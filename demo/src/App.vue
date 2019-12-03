<template>
  <div :style="{background: backgroundColor}">
    <Header
      :chosenColor="chosenColor"
      :colors="colors"
    />
<!--    {{room}}-->
<!--    <input type="text" v-model="room">-->
    <beautiful-chat
      :alwaysScrollToBottom="alwaysScrollToBottom"
      :close="closeChat"
      :colors="colors"
      :isOpen="isChatOpen"
      :messageList="messageList"
      :messageStyling="messageStyling"
      :newMessagesCount="newMessagesCount"
      :onMessageWasSent="onMessageWasSent"
      :open="openChat"
      :participants="participants"
      :showEmoji="true"
      :showFile="true"
      :showTypingIndicator="showTypingIndicator"
      :titleImageUrl="titleImageUrl"
      @onType="handleOnType"
      @edit="editMessage"
      @remove="removeMessage"
    >
      <template v-slot:text-message-toolbox="scopedProps">
        <button v-if="!scopedProps.me && scopedProps.message.type==='text'" @click.prevent="like(scopedProps.message.id)">
          👍
        </button>
      </template>
      <template v-slot:text-message-body="scopedProps">
        <p class="sc-message--text-content" v-html="scopedProps.messageText"></p>
        <p v-if="scopedProps.message.data.meta" class='sc-message--meta' :style="{color: scopedProps.messageColors.color}">{{scopedProps.message.data.meta}}</p>
        <p v-if="scopedProps.message.isEdited || scopedProps.message.liked" class='sc-message--edited'>
          <template v-if="scopedProps.message.isEdited">✎</template>
          <template v-if="scopedProps.message.liked">👍</template>
        </p>
      </template>
    </beautiful-chat>
    <p class="text-center toggle">
      <a
        :style="{color: linkColor}"
        @click.prevent="openChat()"
        href="#"
        v-if="!isChatOpen"
      >Open the chat window</a>
      <a
        :style="{color: linkColor}"
        @click.prevent="closeChat()"
        href="#"
        v-else
      >Close the chat window</a>
    </p>
    <p class="text-center colors">
      <a
        :style="{background: availableColors.blue.launcher.bg}"
        @click.prevent="setColor('blue')"
        href="#"
      >Blue</a>
      <a
        :style="{background: availableColors.red.launcher.bg}"
        @click.prevent="setColor('red')"
        href="#"
      >Red</a>
      <a
        :style="{background: availableColors.green.launcher.bg}"
        @click.prevent="setColor('green')"
        href="#"
      >Green</a>
      <a
        :style="{background: availableColors.dark.launcher.bg}"
        @click.prevent="setColor('dark')"
        href="#"
      >Dark</a>
    </p>
    <v-dialog/>
    <p class="text-center messageStyling">
      <label>Message styling enabled?
        <input
          @change="messageStylingToggled"
          checked
          type="checkbox"
        >
      </label>
      <a
        @click.prevent="showStylingInfo()"
        href="#"
      >info</a>
    </p>
    <TestArea
      :chosenColor="chosenColor"
      :colors="colors"
      :messageStyling="messageStyling"
      :onMessage="sendMessage"
      :onTyping="handleTyping"
    />
<!--    <Footer-->
<!--      :chosenColor="chosenColor"-->
<!--      :colors="colors"-->
<!--    />-->
  </div>
</template>

<script>
import messageHistory from './messageHistory'
import chatParticipants from './chatProfiles'
import Header from './Header.vue'
import Footer from './Footer.vue'
import TestArea from './TestArea.vue'
import availableColors from './colors'

export default {
  name: 'app',
  components: {
    Header,
    Footer,
    TestArea
  },
  data() {
    return {
      token: '',
      participants: chatParticipants,
      titleImageUrl:
        'https://a.slack-edge.com/66f9/img/avatars-teams/ava_0001-34.png',
      // messageList: messageHistory,
      messageList: [],
      newMessagesCount: 0,
      isChatOpen: false,
      showTypingIndicator: '',
      colors: null,
      availableColors,
      chosenColor: null,
      alwaysScrollToBottom: true,
      messageStyling: true,
      userIsTyping: false,
      room: 'default',
      user: {}
    }
  },
  created() {
    this.getToken()
    this.setColor('blue')
    this.fetchMyInfo()
  },
  watch: {
    room: function (val, old) {
      console.log('disconnect', old)
      window.Echo.disconnect();
      setTimeout(() => {
        window.Echo.connect();
        this.socketConnect()
        console.log('connect', val)
      }, 1000)

    }
  },
  methods: {
    getToken() {
      const token = localStorage.getItem('api_token')
      if (token) {
        this.token = token
        this.socketConnect()
        return
      }
      axios.get('/token').then(response => {
        localStorage.setItem('api_token', response.data.data.token)
        window.location.reload()
      })
    },
    socketConnect() {
      // console.log('chat' + this.token)
      this.channel
        .listen('MessageEvent', ({message}) => {
          this.push(message, message.id)
        }).listen('MessageRemoveEvent', ({id, type, message}) => {
          this.updateRemoveMessage(id, type, message)
        }).listen('MessageUpdateEvent', ({id, message}) => {
          console.log('MessageUpdateEvent', id, message)
          this.updateEditMessage(id, message)
        })
    },
    sendMessage(text) {
      if (text.length > 0) {
        this.newMessagesCount = this.isChatOpen
          ? this.newMessagesCount
          : this.newMessagesCount + 1
        this.onMessageWasSent({
          author: 'support',
          type: 'text',
          id: Math.random(),
          data: { text }
        })
      }
    },
    handleTyping(text) {
      this.showTypingIndicator =
        text.length > 0
          ? this.participants[this.participants.length - 1].id
          : ''
    },
    push(message, id) {
      this.messageList = [...this.messageList, Object.assign({}, message, {id: id})]
    },
    onMessageWasSent(message) {
      const file = message.data.file
      message.data.file = 'file'
      axios.post(`/chat/${this.room}/message`, message, {
                headers: {
                  'X-Socket-Id': window.Echo.socketId()
                }
              }
      ).then(response => {
        const data = response.data.data
        if (file) {
          this.uploadFile(file, data.id).then(response => {
            console.log('message response', response.data)
            this.push(response.data.data, data.id)
            // this.messageList = [...this.messageList, Object.assign({}, response.data.data, {id: data.id})]
          })
        } else {
          this.push(message, data.id)
          // this.messageList = [...this.messageList, Object.assign({}, message, {id: data.id})]
        }
      })
    },
    uploadFile(file, message_id) {
      let formData = new FormData();
      formData.append('file', file);
      return axios.post(`/message/${message_id}/file`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-Socket-Id': window.Echo.socketId()
        }
      })
    },
    openChat() {
      this.isChatOpen = true
      this.newMessagesCount = 0
    },
    closeChat() {
      this.isChatOpen = false
    },
    setColor(color) {
      this.colors = this.availableColors[color]
      this.chosenColor = color
    },
    showStylingInfo() {
      this.$modal.show('dialog', {
        title: 'Info',
        text:
          'You can use *word* to <strong>boldify</strong>, /word/ to <em>emphasize</em>, _word_ to <u>underline</u>, `code` to <code>write = code;</code>, ~this~ to <del>delete</del> and ^sup^ or ¡sub¡ to write <sup>sup</sup> and <sub>sub</sub>'
      })
    },
    messageStylingToggled(e) {
      this.messageStyling = e.target.checked
    },
    handleOnType() {
      this.$root.$emit('onType')
      this.userIsTyping = true
    },
    editMessage(message){
      axios.put(`/message/${message.id}`, {message: message.data.text}, {
        headers: {
          'X-Socket-Id': window.Echo.socketId()
        }
      }).then(response => {
        this.updateEditMessage(message.id, message.data.text)
      })
    },
    updateEditMessage(message_id, message) {
      const m = this.messageList.find(m => m.id === message_id);
      m.isEdited = true;
      m.data.text = message;
    },
    updateRemoveMessage(message_id, type, message) {
      const m = this.messageList.find(m => m.id === message_id);
      m.type = type;
      m.data.text = message;
    },
    removeMessage(message){
      if (confirm('Delete?')){
        axios.delete(`/message/${message.id}`, {
          headers: {
            'X-Socket-Id': window.Echo.socketId()
          }
        }).then(response => {
          const data = response.data.data
          this.updateRemoveMessage(message.id, data.type, data.message)
        })
      }
    },
    like(id){
      axios.patch(`/message/${id}/like`).then(response => {
        const m = this.messageList.findIndex(m => m.id === id);
        var msg = this.messageList[m];
        msg.liked = !msg.liked;
        this.$set(this.messageList, m, msg);
      })
    },
    fetchMessageHistoty() {
      axios.get(`/chat/${this.room}`).then(response => {
        this.messageList = response.data.data.messages
        // this.messageList.forEach(x=>x.data.text = 'true');
        // this.messageList.forEach(x=>x.isEdited = true);
      })
    },
    fetchMyInfo() {
      axios.get('/user').then(response => {
        this.user = response.data.data
        this.titleImageUrl = `https://eu.ui-avatars.com/api/?name=${this.user.id}&background=fff&color=0D8ABC&size=32`
      })
    }
  },
  computed: {
    channel() {
      const channel = 'chat.' + this.room
      return window.Echo.channel(channel)
    },
    linkColor() {
      return this.chosenColor === 'dark'
        ? this.colors.sentMessage.text
        : this.colors.launcher.bg
    },
    backgroundColor() {
      return this.chosenColor === 'dark' ? this.colors.messageList.bg : '#fff'
    }
  },
  mounted(){
    this.fetchMessageHistoty()
    // this.messageList.forEach(x=>x.liked = false);
  }
}
</script>

<style>
body {
  padding: 0px;
  margin: 0px;
}

* {
  font-family: Avenir Next, Helvetica Neue, Helvetica, sans-serif;
}

.demo-description {
  max-width: 500px;
}

.demo-description img {
  max-width: 500px;
}

.demo-test-area {
  width: 300px;
  box-sizing: border-box;
}

.demo-test-area--text {
  box-sizing: border-box;
  width: 100%;
  margin: 0px;
  padding: 0px;
  resize: none;
  font-family: Avenir Next, Helvetica Neue, Helvetica, sans-serif;
  background: #fafbfc;
  color: #8da2b5;
  border: 1px solid #dde5ed;
  font-size: 16px;
  padding: 16px 15px 14px;
  margin: 0;
  border-radius: 6px;
  outline: none;
  height: 150px;
  margin-bottom: 10px;
}

.demo-monster-img {
  width: 400px;
  display: block;
  margin: 60px auto;
}

.text-center {
  text-align: center;
}

.colors a {
  color: #fff;
  text-decoration: none;
  padding: 4px 10px;
  border-radius: 10px;
}

.toggle a {
  text-decoration: none;
}

.messageStyling {
  font-size: small;
}
</style>
