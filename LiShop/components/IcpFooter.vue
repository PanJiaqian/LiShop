<template>
  <view class="icp-footer">
    <a class="icp-link" href="https://beian.miit.gov.cn/" target="_blank">备案号：粤ICP备2025372127号</a>
  </view>
</template>

<script>
export default {
  name: 'IcpFooter'
}
</script>

<style scoped>
.icp-footer {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx 0 48rpx;
}
.icp-link {
  font-size: 26rpx;
  color: #666;
  text-decoration: none;
}
.icp-link:hover {
  color: #333;
  text-decoration: underline;
}
</style>
