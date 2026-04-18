<template>
  <view class="page" :class="{ h5: isH5 }">
    <view v-if="isH5" class="h5-topbar">
      <view class="back-btn" @click="goBack">←</view>
      <text class="h5-title">用户服务协议</text>
    </view>
    <view class="header">
      <text class="title">用户服务协议</text>
      <text class="subtitle">生效日期：2026年03月11日</text>
    </view>
    <view class="content">
      <view class="section">
        <text class="section-title">一、协议说明</text>
        <text class="section-text">本协议是您与诺米智能光电之间就使用本应用服务所订立的法律文件，适用于您通过本应用进行商品浏览、下单、支付、收货、售后等全部行为。</text>
        <text class="section-text">您在登录或使用服务前应充分阅读并理解本协议的全部内容。您点击同意、勾选协议或继续使用服务，即视为接受本协议全部条款。</text>
        <text class="section-text">本协议受中国大陆现行法律法规管辖并据其解释。若您不同意本协议的任何内容，请立即停止使用本应用服务。</text>
      </view>
      <view class="section">
        <text class="section-title">二、账号与安全</text>
        <text class="section-text">您应确保提交的账号信息真实、准确、完整并及时更新。因信息不实导致的服务受限、交易失败或损失，由您自行承担。</text>
        <text class="section-text">账号及密码由您自行保管，您应采取合理措施保护账号安全。因账号或密码泄露、被他人冒用造成的损失由您自行承担。</text>
        <text class="section-text">如您发现账号异常、被盗用或存在安全风险，请及时通过应用内客服渠道与我们联系，我们将协助处理但不保证立即恢复。</text>
      </view>
      <view class="section">
        <text class="section-title">三、服务内容</text>
        <text class="section-text">我们向您提供商品信息展示、搜索与筛选、加入购物车、订单创建与支付、物流查询、售后咨询及其他与产品相关的服务。</text>
        <text class="section-text">服务内容以应用内实际展示为准，可能因业务调整而增减或变更。我们会在合理范围内提前提示相关变化。</text>
        <text class="section-text">部分服务可能需要您补充必要信息或满足条件方可使用，例如完善收货地址、确认支付方式等。</text>
      </view>
      <view class="section">
        <text class="section-title">四、用户权利与义务</text>
        <text class="section-text">您有权在遵守本协议与法律法规的前提下使用本应用服务，并获得与服务相关的合理支持。</text>
        <text class="section-text">您应遵守平台规则与交易秩序，按页面提示真实填写订单信息、收货信息，并按约定完成支付。</text>
        <text class="section-text">您不得利用本应用发布、传播违法违规信息，不得以任何方式扰乱平台正常运营或损害他人合法权益。</text>
      </view>
      <view class="section">
        <text class="section-title">五、交易与订单</text>
        <text class="section-text">您在本应用提交订单后即视为对订单内容的确认，订单内容包括商品名称、规格、数量、价格、收货信息及相关服务规则。</text>
        <text class="section-text">商品库存、价格或促销信息以订单提交时页面展示为准。若因系统错误导致明显不合理价格或库存异常，我们有权取消订单并及时告知。</text>
        <text class="section-text">如需修改或取消订单，请以页面提示与实际处理结果为准，不同订单状态的处理规则可能不同。</text>
      </view>
      <view class="section">
        <text class="section-title">六、支付与退款</text>
        <text class="section-text">您应在订单有效期内完成支付。支付成功后，订单进入履约流程；支付失败或超时未支付的订单可能自动关闭。</text>
        <text class="section-text">退款、退货或换货需遵守应用内展示的售后规则及法律法规要求。退款到账时间以支付渠道处理结果为准。</text>
        <text class="section-text">如发生支付异常、重复扣款或退款失败，请及时联系应用内客服，我们将协助核实处理。</text>
      </view>
      <view class="section">
        <text class="section-title">七、配送与验收</text>
        <text class="section-text">商品配送方式与时效以订单页面展示为准，具体到货时间受物流公司、收货地址与不可抗力因素影响。</text>
        <text class="section-text">您在签收时应当核对商品数量、外观与包装。如发现破损、短缺或异常，请及时拍照留存并与客服联系处理。</text>
        <text class="section-text">您或授权收货人签收后，视为您已确认商品外观无明显异常；但不影响您依法享有的售后权利。</text>
      </view>
      <view class="section">
        <text class="section-title">八、售后与争议处理</text>
        <text class="section-text">售后服务范围、流程与材料要求以应用内展示规则为准，包括但不限于退货、换货、维修或补发。</text>
        <text class="section-text">您应按规则在合理期限内提出售后申请，并提供必要的订单信息与问题说明，以便我们快速处理。</text>
        <text class="section-text">如发生争议，我们倡导友好协商解决；协商不成的，可按本协议争议解决条款处理。</text>
      </view>
      <view class="section">
        <text class="section-title">九、知识产权</text>
        <text class="section-text">本应用内的文字、图片、图标、商标、界面设计及其他内容均受法律保护，相关权利归我们或权利人所有。</text>
        <text class="section-text">未经授权，您不得复制、修改、传播、展示或用于商业用途。否则我们有权追究法律责任。</text>
      </view>
      <view class="section">
        <text class="section-title">十、禁止行为</text>
        <text class="section-text">您不得利用本应用从事欺诈、侵权、恶意下单、刷单、虚假评价、扰乱交易秩序或非法爬取数据等行为。</text>
        <text class="section-text">您不得以任何方式干扰或破坏本应用的正常运行，不得对服务进行反向工程、恶意攻击或传播病毒。</text>
        <text class="section-text">如您存在上述行为，我们有权限制或终止服务，并保留追究法律责任的权利。</text>
      </view>
      <view class="section">
        <text class="section-title">十一、免责声明</text>
        <text class="section-text">因不可抗力或非我们可控原因导致的服务中断、延迟、数据丢失等，我们在法律允许范围内不承担责任。</text>
        <text class="section-text">我们将尽力保障服务稳定，但不对服务的持续性、及时性或完全无误作出保证。</text>
      </view>
      <view class="section">
        <text class="section-title">十二、协议变更与终止</text>
        <text class="section-text">我们可能根据业务调整或法律法规变化对本协议进行更新，更新内容将通过应用内公示后生效。</text>
        <text class="section-text">若您在更新后继续使用服务，即视为接受更新内容。您可随时停止使用服务并注销账号。</text>
      </view>
      <view class="section">
        <text class="section-title">十三、争议解决</text>
        <text class="section-text">本协议的订立、执行与解释均适用中国大陆法律法规。因本协议产生的争议，双方应协商解决。</text>
        <text class="section-text">协商不成的，提交有管辖权的人民法院处理。</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {}
  },
  computed: {
    isH5() {
      try { return typeof window !== 'undefined' } catch (e) { return false }
    }
  },
  methods: {
    goBack() {
      try {
        if (typeof window !== 'undefined' && window.history && window.history.length > 1) { window.history.back(); return }
      } catch (e) {}
      if (uni && uni.navigateBack) { uni.navigateBack({ delta: 1 }); return }
      if (uni && uni.switchTab) { uni.switchTab({ url: '/pages/home/index' }); return }
      if (uni && uni.navigateTo) { uni.navigateTo({ url: '/pages/home/index' }); return }
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #1a1a1a;
  padding: 32rpx;
  box-sizing: border-box;
}
.page.h5 {
  padding: 140rpx 120rpx 40rpx;
}
.header {
  margin-bottom: 24rpx;
}
.title {
  font-size: 36rpx;
  font-weight: 700;
  color: #ffffff;
  display: block;
}
.subtitle {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #aaaaaa;
}
.content {
  background: #2c2c2c;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, .3);
}
.section {
  margin-bottom: 28rpx;
}
.section:last-child {
  margin-bottom: 0;
}
.section-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #ffffff;
  display: block;
  margin-bottom: 12rpx;
}
.section-text {
  display: block;
  font-size: 26rpx;
  color: #dddddd;
  line-height: 1.7;
  margin-bottom: 10rpx;
}
.section-text:last-child {
  margin-bottom: 0;
}
.h5-topbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(26, 26, 26, 0.9);
  z-index: 10;
  backdrop-filter: blur(8px);
}
.h5-title {
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 700;
}
.back-btn {
  position: absolute;
  left: 24rpx;
  width: 80rpx;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  color: #ffffff;
  font-size: 36rpx;
}
</style>
