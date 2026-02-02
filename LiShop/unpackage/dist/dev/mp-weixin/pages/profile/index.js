"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const common_assets = require("../../common/assets.js");
const FloatingNav = () => "../../components/FloatingNav.js";
const Skeleton = () => "../../components/Skeleton.js";
const OnboardingGuide = () => "../../components/OnboardingGuide.js";
const LoginPrompt = () => "../../components/LoginPrompt.js";
const _sfc_main = {
  components: { FloatingNav, Skeleton, OnboardingGuide, LoginPrompt },
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
      timer: null,
      addresses: [],
      avatarError: false,
      showAnnouncementModal: false,
      announcementLoading: false,
      announcement: null,
      showAnnContent: false,
      showOnboarding: false,
      onboardingRects: [],
      onboardingSteps: [],
      onboardingIndex: 0,
      onboardingStepsH5: [
        "顶部搜索可快速查找商品与店铺",
        "左侧分类导航支持展开子分类",
        "轮播图可直达热门商品",
        "猜你喜欢展示为你推荐的商品",
        "我的与购物车提供快捷入口",
        "商品详情页查看规格与加入购物车",
        "房间选择，购物车根据房间名进行分组",
        "订单页面查看物流与支付进度",
        "个人信息管理",
        "功能区",
        "收货地址管理"
      ],
      onboardingStepsMp: [
        "顶部搜索定位商品",
        "横向分类导航查看子分类",
        "轮播图快捷入口",
        "猜你喜欢推荐区",
        "商品详情页查看规格与加入购物车",
        "房间选择，购物车根据房间名进行分组",
        "订单页面查看物流与支付进度",
        "个人信息管理",
        "功能区",
        "收货地址管理"
      ],
      showLoginModal: false
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
          region: (u == null ? void 0 : u.region) || "未设置",
          avatarUrl: typeof ((u == null ? void 0 : u.avatar) || (u == null ? void 0 : u.avatar_url)) === "string" ? (u.avatar || u.avatar_url).replace(/`/g, "").trim() : ""
        };
      } catch (e) {
        return { username: "未设置", phone: "未设置", email: "未设置", companyName: "未设置", contactName: "未设置", region: "未设置", avatarUrl: "" };
      }
    },
    displayTime() {
      var _a, _b;
      try {
        const t = ((_a = this.announcement) == null ? void 0 : _a.created_at) || ((_b = this.announcement) == null ? void 0 : _b.timestamp) || "";
        if (!t)
          return "";
        const d = new Date(t);
        if (isNaN(d.getTime()))
          return String(t);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const h = String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");
        return `${y}-${m}-${day} ${h}:${mm}`;
      } catch (e) {
        return "";
      }
    },
    securityTitle() {
      const map = { phone: "更换手机号", email: "更换邮箱", password: "修改登录密码" };
      return map[this.securityType] || "安全验证";
    },
    securityPlaceholder() {
      const map = { phone: "请输入新手机号", email: "请输入新邮箱", password: "请输入新密码" };
      return map[this.securityType] || "";
    },
    avatarInitial() {
      try {
        const name = (this.profile.contactName || this.profile.username || "").trim();
        return name ? name.charAt(0) : "U";
      } catch (e) {
        return "U";
      }
    }
  },
  onShow() {
    try {
      const u = common_vendor.index.getStorageSync("user") || null;
      const exp = common_vendor.index.getStorageSync("token_expiration") || 0;
      const ok = !!u && (!exp || Date.now() < exp);
      if (!ok) {
        this.showLoginModal = true;
        return;
      }
    } catch (e) {
    }
    this.loadAddresses();
    try {
      const cont = !!common_vendor.index.getStorageSync("onboarding_continue");
      const sel = common_vendor.index.getStorageSync("onboarding_target_selector") || "";
      const idx = Number(common_vendor.index.getStorageSync("onboarding_index") || 0);
      const stepsStored = common_vendor.index.getStorageSync("onboarding_steps") || [];
      if (cont && sel) {
        if (Array.isArray(stepsStored) && stepsStored.length)
          this.onboardingSteps = stepsStored;
        const safeIdx = Math.max(0, Math.min(idx, this.onboardingSteps.length - 1));
        this.onboardingIndex = safeIdx;
        this.$nextTick(() => {
          let isH5 = false;
          try {
            isH5 = typeof window !== "undefined";
          } catch (e) {
            isH5 = false;
          }
          const targetMapH5 = { 8: "#og-profile-info", 9: "#og-profile-menu", 10: "#og-profile-addr" };
          const targetMapMp = { 7: "#og-profile-info", 8: "#og-profile-menu", 9: "#og-profile-addr" };
          const tSel = isH5 ? targetMapH5[safeIdx] || sel : targetMapMp[safeIdx] || sel;
          try {
            common_vendor.index.setStorageSync("onboarding_target_selector", tSel);
          } catch (e) {
          }
          this.refreshOnboardingRect(tSel);
        });
      }
    } catch (e) {
    }
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
  onLoad() {
    try {
      const h = () => {
        this.showLoginModal = true;
      };
      this._globalLoginHandler = h;
      common_vendor.index.$on("global-login-prompt", h);
    } catch (e) {
    }
  },
  onUnload() {
    try {
      if (this._globalLoginHandler)
        common_vendor.index.$off("global-login-prompt", this._globalLoginHandler);
      this._globalLoginHandler = null;
    } catch (e) {
    }
  },
  methods: {
    closeLoginModal() {
      this.showLoginModal = false;
      try {
        let isH5 = false;
        try {
          isH5 = typeof window !== "undefined";
        } catch (e) {
          isH5 = false;
        }
        if (!isH5) {
          if (common_vendor.index && common_vendor.index.switchTab) {
            common_vendor.index.switchTab({ url: "/pages/home/index" });
            return;
          }
          if (common_vendor.index && common_vendor.index.navigateTo) {
            common_vendor.index.navigateTo({ url: "/pages/home/index" });
            return;
          }
        }
      } catch (e) {
      }
    },
    goLogin() {
      this.showLoginModal = false;
      common_vendor.index.navigateTo({ url: "/pages/login/index" });
    },
    startOnboardingFromProfile() {
      try {
        let isH5 = false;
        try {
          isH5 = typeof window !== "undefined";
        } catch (e) {
          isH5 = false;
        }
        const steps = isH5 ? this.onboardingStepsH5 : this.onboardingStepsMp;
        this.onboardingSteps = steps;
        common_vendor.index.setStorageSync("onboarding_steps", steps);
        common_vendor.index.setStorageSync("onboarding_index", 0);
        common_vendor.index.setStorageSync("onboarding_continue", true);
        common_vendor.index.setStorageSync("onboarding_target_selector", "#og-search");
      } catch (e) {
      }
      try {
        if (common_vendor.index && common_vendor.index.switchTab) {
          common_vendor.index.switchTab({ url: "/pages/home/index" });
          return;
        }
        if (common_vendor.index && common_vendor.index.navigateTo) {
          common_vendor.index.navigateTo({ url: "/pages/home/index" });
          return;
        }
      } catch (e) {
      }
    },
    refreshOnboardingRect(sel) {
      let isH5 = false;
      try {
        isH5 = typeof window !== "undefined";
      } catch (e) {
        isH5 = false;
      }
      const total = this.onboardingSteps.length || 0;
      const arr = new Array(total).fill(null);
      if (isH5) {
        const el = typeof document !== "undefined" ? document.querySelector(sel) : null;
        if (el) {
          const r = el.getBoundingClientRect();
          arr[this.onboardingIndex] = { left: r.left, top: r.top, width: r.width, height: r.height };
        }
        this.onboardingRects = arr;
        this.showOnboarding = true;
      } else {
        const tryMp = (attempt = 0) => {
          const q = common_vendor.index.createSelectorQuery().in(this);
          try {
            common_vendor.index.pageScrollTo({ selector: sel, duration: 250 });
          } catch (e) {
          }
          setTimeout(() => {
            q.select(sel).boundingClientRect();
            q.exec((res) => {
              const r = (res || [])[0];
              if (r) {
                arr[this.onboardingIndex] = { left: r.left, top: r.top, width: r.width, height: r.height };
                this.onboardingRects = arr;
                this.showOnboarding = true;
              } else if (attempt < 3) {
                setTimeout(() => tryMp(attempt + 1), 140);
              }
            });
          }, 260);
        };
        tryMp(0);
      }
    },
    handleOnboardingNext(nextIndex) {
      const idx = Number(nextIndex || 0);
      this.onboardingIndex = idx;
      try {
        common_vendor.index.setStorageSync("onboarding_index", idx);
        if (Array.isArray(this.onboardingSteps) && this.onboardingSteps.length) {
          common_vendor.index.setStorageSync("onboarding_steps", this.onboardingSteps);
        }
        common_vendor.index.setStorageSync("onboarding_continue", true);
      } catch (e) {
      }
      const isH5 = typeof window !== "undefined";
      if (isH5) {
        if (idx <= 4) {
          const map = ["#og-search", "#og-cate", "#og-banner", "#og-guess", "#og-quick"];
          const sel = map[idx] || "#og-search";
          common_vendor.index.setStorageSync("onboarding_target_selector", sel);
          if (common_vendor.index.switchTab)
            common_vendor.index.switchTab({ url: "/pages/home/index" });
          else
            common_vendor.index.navigateTo({ url: "/pages/home/index" });
          return;
        }
        if (idx === 5) {
          common_vendor.index.setStorageSync("onboarding_target_selector", "#og-product-add");
          common_vendor.index.navigateTo({ url: "/pages/product/index" });
          return;
        }
        if (idx === 6) {
          common_vendor.index.setStorageSync("onboarding_target_selector", "#og-room-modal-list");
          common_vendor.index.navigateTo({ url: "/pages/product/index" });
          return;
        }
        if (idx === 7) {
          common_vendor.index.setStorageSync("onboarding_target_selector", "#og-order-tabs");
          common_vendor.index.navigateTo({ url: "/pages/order/index" });
          return;
        }
        if (idx === 8) {
          this.$nextTick(() => {
            this.refreshOnboardingRect("#og-profile-info");
          });
          return;
        }
        if (idx === 9) {
          this.$nextTick(() => {
            this.refreshOnboardingRect("#og-profile-menu");
          });
          return;
        }
        if (idx === 10) {
          this.$nextTick(() => {
            this.refreshOnboardingRect("#og-profile-addr");
          });
          return;
        }
      } else {
        if (idx <= 3) {
          const map = ["#og-search", "#og-mp-cate", "#og-banner", "#og-mp-guess"];
          const sel = map[idx] || "#og-search";
          common_vendor.index.setStorageSync("onboarding_target_selector", sel);
          if (common_vendor.index.switchTab)
            common_vendor.index.switchTab({ url: "/pages/home/index" });
          else
            common_vendor.index.navigateTo({ url: "/pages/home/index" });
          return;
        }
        if (idx === 4) {
          common_vendor.index.setStorageSync("onboarding_target_selector", "#og-product-add");
          common_vendor.index.navigateTo({ url: "/pages/product/index" });
          return;
        }
        if (idx === 5) {
          common_vendor.index.setStorageSync("onboarding_target_selector", "#og-room-modal-list");
          common_vendor.index.navigateTo({ url: "/pages/product/index" });
          return;
        }
        if (idx === 6) {
          common_vendor.index.setStorageSync("onboarding_target_selector", "#og-order-tabs");
          common_vendor.index.navigateTo({ url: "/pages/order/index" });
          return;
        }
        if (idx === 7) {
          this.$nextTick(() => {
            this.refreshOnboardingRect("#og-profile-info");
          });
          return;
        }
        if (idx === 8) {
          this.$nextTick(() => {
            this.refreshOnboardingRect("#og-profile-menu");
          });
          return;
        }
        if (idx === 9) {
          this.$nextTick(() => {
            this.refreshOnboardingRect("#og-profile-addr");
          });
          return;
        }
      }
    },
    handleOnboardingPrev(prevIndex) {
      const idx = Number(prevIndex || 0);
      if (idx < 0)
        return;
      this.onboardingIndex = idx;
      try {
        common_vendor.index.setStorageSync("onboarding_index", idx);
        common_vendor.index.setStorageSync("onboarding_continue", true);
      } catch (e) {
      }
      const isH5 = typeof window !== "undefined";
      if (isH5) {
        if (idx <= 4) {
          const map = ["#og-search", "#og-cate", "#og-banner", "#og-guess", "#og-quick"];
          const sel = map[idx] || "#og-search";
          common_vendor.index.setStorageSync("onboarding_target_selector", sel);
          if (common_vendor.index.switchTab)
            common_vendor.index.switchTab({ url: "/pages/home/index" });
          else
            common_vendor.index.navigateTo({ url: "/pages/home/index" });
          return;
        }
        if (idx === 5) {
          common_vendor.index.setStorageSync("onboarding_target_selector", "#og-product-add");
          common_vendor.index.navigateTo({ url: "/pages/product/index" });
          return;
        }
        if (idx === 6) {
          common_vendor.index.setStorageSync("onboarding_target_selector", "#og-room-modal-list");
          common_vendor.index.navigateTo({ url: "/pages/product/index" });
          return;
        }
        if (idx === 7) {
          common_vendor.index.setStorageSync("onboarding_target_selector", "#og-order-tabs");
          common_vendor.index.navigateTo({ url: "/pages/order/index" });
          return;
        }
        if (idx === 8) {
          this.$nextTick(() => {
            this.refreshOnboardingRect("#og-profile-info");
          });
          return;
        }
        if (idx === 9) {
          this.$nextTick(() => {
            this.refreshOnboardingRect("#og-profile-menu");
          });
          return;
        }
        if (idx === 10) {
          this.$nextTick(() => {
            this.refreshOnboardingRect("#og-profile-addr");
          });
          return;
        }
      } else {
        if (idx <= 3) {
          const map = ["#og-search", "#og-mp-cate", "#og-banner", "#og-mp-guess"];
          const sel = map[idx] || "#og-search";
          common_vendor.index.setStorageSync("onboarding_target_selector", sel);
          if (common_vendor.index.switchTab)
            common_vendor.index.switchTab({ url: "/pages/home/index" });
          else
            common_vendor.index.navigateTo({ url: "/pages/home/index" });
          return;
        }
        if (idx === 4) {
          common_vendor.index.setStorageSync("onboarding_target_selector", "#og-product-add");
          common_vendor.index.navigateTo({ url: "/pages/product/index" });
          return;
        }
        if (idx === 5) {
          common_vendor.index.setStorageSync("onboarding_target_selector", "#og-room-modal-list");
          common_vendor.index.navigateTo({ url: "/pages/product/index" });
          return;
        }
        if (idx === 6) {
          common_vendor.index.setStorageSync("onboarding_target_selector", "#og-order-tabs");
          common_vendor.index.navigateTo({ url: "/pages/order/index" });
          return;
        }
        if (idx === 7) {
          this.$nextTick(() => {
            this.refreshOnboardingRect("#og-profile-info");
          });
          return;
        }
        if (idx === 8) {
          this.$nextTick(() => {
            this.refreshOnboardingRect("#og-profile-menu");
          });
          return;
        }
        if (idx === 9) {
          this.$nextTick(() => {
            this.refreshOnboardingRect("#og-profile-addr");
          });
          return;
        }
      }
    },
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
    closeOnboarding() {
      this.showOnboarding = false;
      try {
        common_vendor.index.removeStorageSync("onboarding_continue");
        common_vendor.index.removeStorageSync("onboarding_target_selector");
        common_vendor.index.removeStorageSync("onboarding_step_text");
        common_vendor.index.removeStorageSync("onboarding_steps");
        common_vendor.index.removeStorageSync("onboarding_index");
        common_vendor.index.reLaunch({ url: "/pages/home/index" });
      } catch (e) {
      }
    },
    openAnnouncementModalH5() {
      this.announcementLoading = true;
      try {
        const u = common_vendor.index.getStorageSync("user") || null;
        const token = u && (u.token || u.data && u.data.token) || "";
        api_index.getCurrentAnnouncement({ token }).then((res) => {
          const ok = !!(res && res.success);
          const data = (res == null ? void 0 : res.data) || null;
          if (ok && data) {
            this.announcement = {
              id: data.announcement_id || data.id || "",
              title: data.title || "",
              content: data.content || "",
              created_at: data.created_at || res.timestamp || ""
            };
          } else {
            this.announcement = null;
          }
        }).catch(() => {
          this.announcement = null;
        }).finally(() => {
          this.announcementLoading = false;
          this.showAnnouncementModal = true;
          this.showAnnContent = true;
        });
      } catch (e) {
        this.announcement = null;
        this.announcementLoading = false;
        this.showAnnouncementModal = true;
        this.showAnnContent = true;
      }
    },
    closeAnnouncementModal() {
      this.showAnnouncementModal = false;
      this.showAnnContent = false;
    },
    goBack() {
      this.goHome();
    },
    loadAddresses() {
      const u = common_vendor.index.getStorageSync("user");
      const token = u && (u.token || u.data && u.data.token) || "";
      if (!token)
        return;
      api_index.getAddresses({ token }).then((res) => {
        var _a;
        const raw = Array.isArray((_a = res == null ? void 0 : res.data) == null ? void 0 : _a.items) ? res.data.items : Array.isArray(res == null ? void 0 : res.items) ? res.items : [];
        this.addresses = raw.map((a) => ({
          id: a.addresses_id || a.id || "",
          receiver: a.receiver || "",
          phone: a.phone || "",
          full: [a.province, a.city, a.district, a.detail_address].filter(Boolean).join(" "),
          is_default: a.is_default === 1
        }));
      }).catch(() => {
        this.addresses = [];
      });
    },
    goCreateAddress() {
      common_vendor.index.navigateTo({ url: "/pages/address/edit?mode=create" });
    },
    editAddress(addr) {
      const id = addr && (addr.id || addr.addresses_id) || "";
      common_vendor.index.navigateTo({ url: "/pages/address/edit" + (id ? "?id=" + id : "") });
    },
    loadUserProfile(token) {
      if (!token)
        return Promise.resolve();
      return api_index.getUserProfile({ token }).then((res) => {
        if (res && res.success) {
          this.fetchedProfile = res.data;
          if (res.data.username)
            this.displayName = res.data.username;
          this.avatarError = false;
        }
      }).catch((err) => {
        common_vendor.index.__f__("error", "at pages/profile/index.vue:716", "Fetch user profile failed", err);
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
        common_vendor.index.__f__("error", "at pages/profile/index.vue:784", err);
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
        common_vendor.index.__f__("error", "at pages/profile/index.vue:834", err);
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
          common_vendor.index.__f__("error", "at pages/profile/index.vue:870", err);
          common_vendor.index.showToast({ title: err && err.message || "修改出错", icon: "none" });
        });
      }
    },
    triggerAvatarPicker() {
      try {
        if (common_vendor.index && typeof common_vendor.index.chooseImage === "function") {
          const u = common_vendor.index.getStorageSync("user") || null;
          const token = u && (u.token || u.data && u.data.token) || "";
          if (!token) {
            common_vendor.index.showToast({ title: "请先登录", icon: "none" });
            return;
          }
          common_vendor.index.chooseImage({
            count: 1,
            sizeType: ["compressed", "original"],
            sourceType: ["album", "camera"],
            success: (ret) => {
              const path = Array.isArray(ret.tempFilePaths) ? ret.tempFilePaths[0] : ret.tempFiles && ret.tempFiles[0] && (ret.tempFiles[0].path || ret.tempFiles[0]) || "";
              if (!path) {
                common_vendor.index.showToast({ title: "选择失败", icon: "none" });
                return;
              }
              common_vendor.index.showLoading({ title: "上传中" });
              api_index.updateUserAvatar({ filePath: path, token }).then((res) => {
                common_vendor.index.hideLoading();
                if (res && res.success) {
                  common_vendor.index.showToast({ title: "上传成功", icon: "success" });
                  this.loadUserProfile(token);
                } else {
                  common_vendor.index.showToast({ title: (res == null ? void 0 : res.message) || "上传失败", icon: "none" });
                }
              }).catch(() => {
                common_vendor.index.hideLoading();
                common_vendor.index.showToast({ title: "上传失败", icon: "none" });
              });
            }
          });
          return;
        }
        const el = typeof document !== "undefined" ? document.getElementById("avatar-file") : null;
        if (el && typeof el.click === "function")
          el.click();
      } catch (e) {
      }
    },
    onAvatarFileChange(e) {
      try {
        const files = e && e.target && e.target.files ? e.target.files : [];
        if (!files || !files.length) {
          common_vendor.index.showToast({ title: "请选择图片", icon: "none" });
          return;
        }
        const file = files[0];
        const u = common_vendor.index.getStorageSync("user") || null;
        const token = u && (u.token || u.data && u.data.token) || "";
        if (!token) {
          common_vendor.index.showToast({ title: "请先登录", icon: "none" });
          return;
        }
        common_vendor.index.showLoading({ title: "上传中" });
        api_index.updateUserAvatar({ file, token }).then((res) => {
          common_vendor.index.hideLoading();
          if (res && res.success) {
            common_vendor.index.showToast({ title: "上传成功", icon: "success" });
            this.loadUserProfile(token);
          } else {
            common_vendor.index.showToast({ title: (res == null ? void 0 : res.message) || "上传失败", icon: "none" });
          }
        }).catch(() => {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({ title: "上传失败", icon: "none" });
        });
      } catch (err) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: "上传失败", icon: "none" });
      }
    },
    chooseAvatarWx() {
      try {
        const u = common_vendor.index.getStorageSync("user") || null;
        const token = u && (u.token || u.data && u.data.token) || "";
        if (!token) {
          common_vendor.index.showToast({ title: "请先登录", icon: "none" });
          return;
        }
        common_vendor.index.chooseImage({
          count: 1,
          sizeType: ["compressed", "original"],
          sourceType: ["album", "camera"],
          success: (ret) => {
            const path = Array.isArray(ret.tempFilePaths) ? ret.tempFilePaths[0] : ret.tempFiles && ret.tempFiles[0] && ret.tempFiles[0].path || "";
            if (!path) {
              common_vendor.index.showToast({ title: "选择失败", icon: "none" });
              return;
            }
            common_vendor.index.showLoading({ title: "上传中" });
            api_index.updateUserAvatar({ filePath: path, token }).then((res) => {
              common_vendor.index.hideLoading();
              if (res && res.success) {
                common_vendor.index.showToast({ title: "上传成功", icon: "success" });
                this.loadUserProfile(token);
              } else {
                common_vendor.index.showToast({ title: (res == null ? void 0 : res.message) || "上传失败", icon: "none" });
              }
            }).catch(() => {
              common_vendor.index.hideLoading();
              common_vendor.index.showToast({ title: "上传失败", icon: "none" });
            });
          }
        });
      } catch (e) {
        common_vendor.index.showToast({ title: "上传失败", icon: "none" });
      }
    },
    onAvatarError() {
      this.avatarError = true;
    }
  }
};
if (!Array) {
  const _component_Skeleton = common_vendor.resolveComponent("Skeleton");
  const _component_OnboardingGuide = common_vendor.resolveComponent("OnboardingGuide");
  const _component_LoginPrompt = common_vendor.resolveComponent("LoginPrompt");
  (_component_Skeleton + _component_OnboardingGuide + _component_LoginPrompt)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.p({
      loading: $data.loading,
      showTitle: true
    }),
    b: common_assets._imports_0,
    c: $options.profile.avatarUrl && !$data.avatarError
  }, $options.profile.avatarUrl && !$data.avatarError ? {
    d: $options.profile.avatarUrl,
    e: common_vendor.o((...args) => $options.onAvatarError && $options.onAvatarError(...args))
  } : {
    f: common_vendor.t($options.avatarInitial)
  }, {
    g: common_vendor.o((...args) => $options.chooseAvatarWx && $options.chooseAvatarWx(...args)),
    h: $data.isEditing
  }, $data.isEditing ? {
    i: $data.editForm.username,
    j: common_vendor.o(($event) => $data.editForm.username = $event.detail.value)
  } : {
    k: common_vendor.t($options.profile.username)
  }, {
    l: common_vendor.t($options.profile.phone),
    m: $data.loggedIn
  }, $data.loggedIn ? {
    n: common_vendor.o(($event) => $options.openSecurityModal("phone"))
  } : {}, {
    o: common_vendor.t($options.profile.email),
    p: $data.loggedIn
  }, $data.loggedIn ? {
    q: common_vendor.o(($event) => $options.openSecurityModal("email"))
  } : {}, {
    r: $data.loggedIn
  }, $data.loggedIn ? {
    s: common_vendor.o(($event) => $options.openSecurityModal("password"))
  } : {}, {
    t: $data.isEditing
  }, $data.isEditing ? {
    v: $data.editForm.company_name,
    w: common_vendor.o(($event) => $data.editForm.company_name = $event.detail.value)
  } : {
    x: common_vendor.t($options.profile.companyName)
  }, {
    y: $data.isEditing
  }, $data.isEditing ? {
    z: $data.editForm.contact_name,
    A: common_vendor.o(($event) => $data.editForm.contact_name = $event.detail.value)
  } : {
    B: common_vendor.t($options.profile.contactName)
  }, {
    C: $data.isEditing
  }, $data.isEditing ? {
    D: $data.editForm.region,
    E: common_vendor.o(($event) => $data.editForm.region = $event.detail.value)
  } : {
    F: common_vendor.t($options.profile.region)
  }, {
    G: $data.loggedIn
  }, $data.loggedIn ? {
    H: common_vendor.t($data.isEditing ? "保存修改" : "编辑资料"),
    I: common_vendor.o(($event) => $data.isEditing ? $options.handleSave() : $options.handleEdit()),
    J: common_vendor.t($data.isEditing ? "取消" : "退出登录"),
    K: common_vendor.o(($event) => $data.isEditing ? $options.handleCancel() : $options.logout())
  } : {
    L: common_vendor.o((...args) => $options.login && $options.login(...args))
  }, {
    M: common_vendor.o((...args) => $options.startOnboardingFromProfile && $options.startOnboardingFromProfile(...args)),
    N: common_vendor.o((...args) => $options.goCreateAddress && $options.goCreateAddress(...args)),
    O: common_vendor.f($data.addresses, (addr, k0, i0) => {
      return {
        a: common_vendor.t(addr.full),
        b: common_vendor.t(addr.receiver),
        c: common_vendor.t(addr.phone),
        d: addr.id,
        e: common_vendor.o(($event) => $options.editAddress(addr), addr.id)
      };
    }),
    P: $data.addresses.length === 0
  }, $data.addresses.length === 0 ? {} : {}, {
    Q: $data.showOnboarding
  }, $data.showOnboarding ? {
    R: common_vendor.o($options.handleOnboardingNext),
    S: common_vendor.o($options.handleOnboardingPrev),
    T: common_vendor.o($options.closeOnboarding),
    U: common_vendor.p({
      steps: $data.onboardingSteps,
      targets: $data.onboardingRects,
      initialIndex: $data.onboardingIndex
    })
  } : {}, {
    V: $data.showSecurityModal
  }, $data.showSecurityModal ? {
    W: common_vendor.t($options.securityTitle),
    X: $options.securityPlaceholder,
    Y: $data.securityForm.value,
    Z: common_vendor.o(($event) => $data.securityForm.value = $event.detail.value),
    aa: $data.securityForm.code,
    ab: common_vendor.o(($event) => $data.securityForm.code = $event.detail.value),
    ac: common_vendor.t($data.countdown > 0 ? `${$data.countdown}s` : "获取验证码"),
    ad: $data.countdown > 0,
    ae: common_vendor.o((...args) => $options.sendCode && $options.sendCode(...args)),
    af: common_vendor.o((...args) => $options.closeSecurityModal && $options.closeSecurityModal(...args)),
    ag: common_vendor.o((...args) => $options.confirmSecurityEdit && $options.confirmSecurityEdit(...args)),
    ah: common_vendor.o(() => {
    }),
    ai: common_vendor.o((...args) => $options.closeSecurityModal && $options.closeSecurityModal(...args))
  } : {}, {
    aj: common_vendor.o($options.closeLoginModal),
    ak: common_vendor.o($options.goLogin),
    al: common_vendor.p({
      visible: $data.showLoginModal
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-201c0da5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/profile/index.js.map
