"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const _sfc_main = {
  data() {
    return {
      addressList: []
    };
  },
  onShow() {
    this.loadAddresses();
  },
  methods: {
    loadAddresses() {
      const u = common_vendor.index.getStorageSync("user");
      const token = u && (u.token || u.data && u.data.token) || "";
      if (!token) {
        common_vendor.index.showToast({ title: "请先登录", icon: "none" });
        setTimeout(() => common_vendor.index.navigateTo({ url: "/pages/login/index" }), 1500);
        return;
      }
      api_index.getAddresses({ token }).then((res) => {
        if (res && res.success) {
          this.addressList = res.data.items || [];
        }
      }).catch((err) => {
        console.error(err);
        common_vendor.index.showToast({ title: "获取地址失败", icon: "none" });
      });
    },
    addAddress() {
      common_vendor.index.navigateTo({ url: "/pages/address/edit" });
    },
    editAddress(id) {
      common_vendor.index.navigateTo({ url: `/pages/address/edit?id=${id}` });
    },
    handleDelete(id) {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要删除该地址吗？",
        success: (res) => {
          if (res.confirm) {
            const u = common_vendor.index.getStorageSync("user");
            const token = u && (u.token || u.data && u.data.token) || "";
            api_index.deleteAddress({ addresses_id: id, token }).then((resp) => {
              if (resp && resp.success) {
                common_vendor.index.showToast({ title: "删除成功", icon: "success" });
                this.loadAddresses();
              } else {
                common_vendor.index.showToast({ title: resp.message || "删除失败", icon: "none" });
              }
            }).catch((err) => {
              common_vendor.index.showToast({ title: "删除失败", icon: "none" });
            });
          }
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.addressList.length > 0
  }, $data.addressList.length > 0 ? {
    b: common_vendor.f($data.addressList, (item, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.receiver),
        b: common_vendor.t(item.phone),
        c: item.is_default === 1
      }, item.is_default === 1 ? {} : {}, {
        d: common_vendor.t(item.province),
        e: common_vendor.t(item.city),
        f: common_vendor.t(item.district),
        g: common_vendor.t(item.detail_address),
        h: common_vendor.o(($event) => $options.editAddress(item.addresses_id), item.addresses_id),
        i: common_vendor.o(($event) => $options.handleDelete(item.addresses_id), item.addresses_id),
        j: item.addresses_id,
        k: common_vendor.o(($event) => $options.editAddress(item.addresses_id), item.addresses_id)
      });
    })
  } : {}, {
    c: common_vendor.o((...args) => $options.addAddress && $options.addAddress(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
