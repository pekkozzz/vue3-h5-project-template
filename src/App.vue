<script setup lang="ts">
import { Add } from '@nutui/icons-vue'
</script>

<template>
  <Add color="red" />
  <nut-button type="primary">nutui</nut-button>
  <van-icon name="chat-o" />
  <van-button type="primary">按钮</van-button>
  <h1>You did it!</h1>
  <div class="test">
    <div class="test1">哈哈哈哈</div>
  </div>
  <p>
    Visit <a href="https://vuejs.org/" target="_blank" rel="noopener">vuejs.org</a> to read the
    documentation
  </p>
</template>

<style scoped lang="scss">
.test {
  .test1 {
    width: 100px;
    height: 100px;
    background-color: pink;
    font-size: p2r(32);
  }
}
</style>
