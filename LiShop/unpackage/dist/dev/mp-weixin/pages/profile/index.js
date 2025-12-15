"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const common_assets = require("../../common/assets.js");
const FloatingNav = () => "../../components/FloatingNav.js";
const Skeleton = () => "../../components/Skeleton.js";
const _sfc_main = {
  components: { FloatingNav, Skeleton },
  data() {
    return {
      loading: true,
      loggedIn: false,
      displayName: "",
      fetchedProfile: {},
      isEditing: false,
      editForm: {},
      showSecurityModal: false,
      securityType: "",
      securityForm: { value: "", code: "" },
      countdown: 0,
      timer: null
    };
  },
  computed: {
    profile() {
      try {
        const u = this.fetchedProfile.user_id ? this.fetchedProfile : common_vendor.index.getStorageSync("user") || null;
        return {
          username: (u == null ? void 0 : u.username) || "未设置",
          phone: (u == null ? void 0 : u.phone) || "未设置",
          email: (u == null ? void 0 : u.email) || "未设置",
          companyName: (u == null ? void 0 : u.company_name) || (u == null ? void 0 : u.companyName) || "未设置",
          contactName: (u == null ? void 0 : u.contact_name) || (u == null ? void 0 : u.contactName) || "未设置",
          region: (u == null ? void 0 : u.region) || "未设置"
        };
      } catch (e) {
        return { username: "未设置", phone: "未设置", email: "未设置", companyName: "未设置", contactName: "未设置", region: "未设置" };
      }
    },
    securityTitle() {
      const map = { phone: "更换手机号", email: "更换邮箱", password: "修改登录密码" };
      return map[this.securityType] || "安全验证";
    },
    securityPlaceholder() {
      const map = { phone: "请输入新手机号", email: "请输入新邮箱", password: "请输入新密码" };
      return map[this.securityType] || "";
    }
  },
  onShow() {
    try {
      const u = common_vendor.index.getStorageSync("user") || null;
      this.loggedIn = !!u;
      this.displayName = (u == null ? void 0 : u.username) || "";
      if (this.loggedIn) {
        const token = u && (u.token || u.data && u.data.token) || "";
        this.loadUserProfile(token).finally(() => this.loading = false);
      } else {
        this.loading = false;
      }
    } catch (e) {
      this.loading = false;
    }
  },
  methods: {
    goHome() {
      if (common_vendor.index && common_vendor.index.switchTab) {
        common_vendor.index.switchTab({ url: "/pages/home/index" });
        return;
      }
      if (common_vendor.index && common_vendor.index.navigateTo) {
        common_vendor.index.navigateTo({ url: "/pages/home/index" });
        return;
      }
    },
    loadUserProfile(token) {
      if (!token)
        return Promise.resolve();
      return api_index.getUserProfile({ token }).then((res) => {
        if (res && res.success) {
          this.fetchedProfile = res.data;
          if (res.data.username)
            this.displayName = res.data.username;
        }
      }).catch((err) => {
        console.error("Fetch user profile failed", err);
      });
    },
    login() {
      common_vendor.index.navigateTo({ url: "/pages/login/index" });
    },
    logout() {
      try {
        common_vendor.index.removeStorageSync("user");
      } catch (e) {
      }
      this.loggedIn = false;
      this.displayName = "";
      this.fetchedProfile = {};
      common_vendor.index.showToast({ title: "已退出登录", icon: "success" });
      setTimeout(() => {
        common_vendor.index.navigateTo({ url: "/pages/login/index" });
      }, 500);
    },
    onAuthButton() {
      if (this.loggedIn)
        this.logout();
      else
        this.login();
    },
    handleEdit() {
      this.editForm = {
        username: this.profile.username,
        company_name: this.profile.companyName,
        contact_name: this.profile.contactName,
        region: this.profile.region,
        phone: this.profile.phone
        // Pass phone as required by some APIs, though not edited
      };
      this.isEditing = true;
    },
    handleCancel() {
      this.isEditing = false;
      this.editForm = {};
    },
    handleSave() {
      const u = common_vendor.index.getStorageSync("user");
      const token = u && (u.token || u.data && u.data.token) || "";
      if (!token) {
        common_vendor.index.showToast({ title: "请先登录", icon: "none" });
        return;
      }
      common_vendor.index.showLoading({ title: "保存中" });
      api_index.updateUserProfile({
        ...this.editForm,
        token
      }).then((res) => {
        common_vendor.index.hideLoading();
        if (res && res.success) {
          common_vendor.index.showToast({ title: "更新成功", icon: "success" });
          this.isEditing = false;
          this.fetchedProfile = {
            ...this.fetchedProfile,
            username: this.editForm.username,
            company_name: this.editForm.company_name,
            contact_name: this.editForm.contact_name,
            region: this.editForm.region
          };
          this.loadUserProfile(token);
        } else {
          common_vendor.index.showToast({ title: res.message || "更新失败", icon: "none" });
        }
      }).catch((err) => {
        common_vendor.index.hideLoading();
        console.error(err);
        common_vendor.index.showToast({ title: "更新出错", icon: "none" });
      });
    },
    openSecurityModal(type) {
      this.securityType = type;
      this.securityForm = { value: "", code: "" };
      this.showSecurityModal = true;
    },
    closeSecurityModal() {
      this.showSecurityModal = false;
      this.securityForm = { value: "", code: "" };
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      this.countdown = 0;
    },
    sendCode() {
      if (this.countdown > 0)
        return;
      const u = common_vendor.index.getStorageSync("user");
      const token = u && (u.token || u.data && u.data.token) || "";
      if (!token) {
        common_vendor.index.showToast({ title: "请先登录", icon: "none" });
        return;
      }
      const val = this.securityForm.value;
      if (this.securityType === "phone") {
        if (!/^1[3-9]\d{9}$/.test(val)) {
          common_vendor.index.showToast({ title: "请输入正确的手机号", icon: "none" });
          return;
        }
      } else if (this.securityType === "email") {
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val)) {
          common_vendor.index.showToast({ title: "请输入正确的邮箱", icon: "none" });
          return;
        }
      }
      common_vendor.index.showLoading({ title: "发送中" });
      api_index.sendSecurityCode({ token }).then((res) => {
        common_vendor.index.hideLoading();
        if (res && res.success) {
          common_vendor.index.showToast({ title: "已发送至安全邮箱", icon: "none", duration: 2e3 });
          this.countdown = 60;
          this.timer = setInterval(() => {
            this.countdown--;
            if (this.countdown <= 0) {
              clearInterval(this.timer);
              this.timer = null;
            }
          }, 1e3);
        } else {
          common_vendor.index.showToast({ title: res.message || "发送失败", icon: "none" });
        }
      }).catch((err) => {
        common_vendor.index.hideLoading();
        console.error(err);
        common_vendor.index.showToast({ title: "发送出错", icon: "none" });
      });
    },
    confirmSecurityEdit() {
      const { value, code } = this.securityForm;
      if (!value) {
        common_vendor.index.showToast({ title: this.securityPlaceholder, icon: "none" });
        return;
      }
      if (!code) {
        common_vendor.index.showToast({ title: "请输入验证码", icon: "none" });
        return;
      }
      const u = common_vendor.index.getStorageSync("user");
      const token = u && (u.token || u.data && u.data.token) || "";
      if (!token) {
        common_vendor.index.showToast({ title: "请先登录", icon: "none" });
        return;
      }
      common_vendor.index.showLoading({ title: "提交中" });
      let promise;
      if (this.securityType === "phone") {
        promise = api_index.updateUserPhone({ new_phone: value, code, token });
      } else if (this.securityType === "email") {
        promise = api_index.updateUserEmail({ new_email: value, code, token });
      } else if (this.securityType === "password") {
        promise = Promise.reject({ message: "暂无修改密码接口" });
      }
      if (promise) {
        promise.then((res) => {
          common_vendor.index.hideLoading();
          if (res && res.success) {
            common_vendor.index.showToast({ title: "修改成功", icon: "success" });
            this.closeSecurityModal();
            this.loadUserProfile(token);
          } else {
            common_vendor.index.showToast({ title: res.message || "修改失败", icon: "none" });
          }
        }).catch((err) => {
          common_vendor.index.hideLoading();
          console.error(err);
          common_vendor.index.showToast({ title: err && err.message || "修改出错", icon: "none" });
        });
      }
    }
  }
};
if (!Array) {
  const _component_Skeleton = common_vendor.resolveComponent("Skeleton");
  _component_Skeleton();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.p({
      loading: $data.loading,
      showTitle: true
    }),
    b: common_assets._imports_0$2,
    c: common_vendor.t($data.loggedIn ? $data.displayName : "未登录"),
    d: common_vendor.t($data.loggedIn ? "退出登录" : "登录"),
    e: common_vendor.o((...args) => $options.onAuthButton && $options.onAuthButton(...args)),
    f: $data.loggedIn
  }, $data.loggedIn ? common_vendor.e({
    g: !$data.isEditing
  }, !$data.isEditing ? {
    h: common_vendor.o((...args) => $options.handleEdit && $options.handleEdit(...args))
  } : {
    i: common_vendor.o((...args) => $options.handleCancel && $options.handleCancel(...args)),
    j: common_vendor.o((...args) => $options.handleSave && $options.handleSave(...args))
  }) : {}, {
    k: $data.isEditing
  }, $data.isEditing ? {
    l: $data.editForm.username,
    m: common_vendor.o(($event) => $data.editForm.username = $event.detail.value)
  } : {
    n: common_vendor.t($options.profile.username)
  }, {
    o: common_vendor.t($options.profile.phone),
    p: $data.loggedIn
  }, $data.loggedIn ? {
    q: common_vendor.o(($event) => $options.openSecurityModal("phone"))
  } : {}, {
    r: common_vendor.t($options.profile.email),
    s: $data.loggedIn
  }, $data.loggedIn ? {
    t: common_vendor.o(($event) => $options.openSecurityModal("email"))
  } : {}, {
    v: $data.loggedIn
  }, $data.loggedIn ? {
    w: common_vendor.o(($event) => $options.openSecurityModal("password"))
  } : {}, {
    x: $data.isEditing
  }, $data.isEditing ? {
    y: $data.editForm.company_name,
    z: common_vendor.o(($event) => $data.editForm.company_name = $event.detail.value)
  } : {
    A: common_vendor.t($options.profile.companyName)
  }, {
    B: $data.isEditing
  }, $data.isEditing ? {
    C: $data.editForm.contact_name,
    D: common_vendor.o(($event) => $data.editForm.contact_name = $event.detail.value)
  } : {
    E: common_vendor.t($options.profile.contactName)
  }, {
    F: $data.isEditing
  }, $data.isEditing ? {
    G: $data.editForm.region,
    H: common_vendor.o(($event) => $data.editForm.region = $event.detail.value)
  } : {
    I: common_vendor.t($options.profile.region)
  }, {
    J: $data.showSecurityModal
  }, $data.showSecurityModal ? {
    K: common_vendor.t($options.securityTitle),
    L: $options.securityPlaceholder,
    M: $data.securityForm.value,
    N: common_vendor.o(($event) => $data.securityForm.value = $event.detail.value),
    O: $data.securityForm.code,
    P: common_vendor.o(($event) => $data.securityForm.code = $event.detail.value),
    Q: common_vendor.t($data.countdown > 0 ? `${$data.countdown}s` : "获取验证码"),
    R: $data.countdown > 0,
    S: common_vendor.o((...args) => $options.sendCode && $options.sendCode(...args)),
    T: common_vendor.o((...args) => $options.closeSecurityModal && $options.closeSecurityModal(...args)),
    U: common_vendor.o((...args) => $options.confirmSecurityEdit && $options.confirmSecurityEdit(...args)),
    V: common_vendor.o(() => {
    }),
    W: common_vendor.o((...args) => $options.closeSecurityModal && $options.closeSecurityModal(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-201c0da5"]]);
wx.createPage(MiniProgramPage);
