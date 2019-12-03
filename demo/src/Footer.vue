<template>
  <div class="demo-footer" :style="{color: linkColor}">
<!--    <div>-->
<!--      <div>&copy; {{new Date().getFullYear()}} freelaxdeveloper</div>-->
<!--    </div>-->
  </div>
</template>

<script>
export default {
  props: {
    colors: {
      type: Object,
      required: true
    },
    chosenColor: {
      type: String,
      required: true
    }
  },
  computed: {
    linkColor() {
      return this.chosenColor === 'dark' ? this.colors.sentMessage.text : this.colors.launcher.bg
    },
    backgroundColor() {
      return this.chosenColor === 'dark' ? this.colors.messageList.bg : '#fff'
    }
  }
}
</script>

<style scoped>
.demo-footer {
  max-width: 1100px;
  display: flex;
  margin: auto;
  justify-content: space-between;
  padding: 20px 0px;
  border-top: solid 2px #F0F4FA;
  color: #8694AB;
  font-weight: 100;
  font-size: 14px;
}
</style>
