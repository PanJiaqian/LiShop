"use strict";
/**
 * WebView 页面模块（编译产物）
 * - 该页面用于在小程序内打开外部 H5 链接
 * - 运行时从页面参数读取 url，并 decode 后绑定给 web-view 的 src
 */
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      // web-view 目标地址
      url: ""
    };
  },
  onLoad(options) {
    // 页面初始化：读取并解码 url 参数
    if (options.url) {
      this.url = decodeURIComponent(options.url);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  // 渲染函数：将 url 暴露给模板（wxml）绑定
  return {
    a: $data.url
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/webview/index.js.map
