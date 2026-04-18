<template>
  <view class="page">
    <web-view :src="url"></web-view>
  </view>
</template>

<script>
/**
 * WebView 页面模块
 * - 通过路由参数 options.url 接收目标链接（通常由上一页 encodeURIComponent 后传入）
 * - 在 onLoad 中 decode 后写入页面状态，最终绑定到 <web-view> 的 src
 */
export default {
  data() {
    return {
      // web-view 目标地址
      url: ''
    }
  },
  onLoad(options) {
    // 页面初始化：读取并解码 url 参数
    if (options.url) {
      this.url = decodeURIComponent(options.url)
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #1a1a1a;
}
</style>
