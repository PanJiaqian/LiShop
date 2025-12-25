"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const Skeleton = () => "../../components/Skeleton.js";
const _sfc_main = {
  components: { Skeleton },
  data() {
    return {
      id: "",
      regionRange: [[], [], []],
      regionIndex: [0, 0, 0],
      form: {
        receiver: "",
        phone: "",
        province: "",
        city: "",
        district: "",
        detail_address: "",
        is_default: 0
      },
      loading: true,
      areaTree: {
        "北京市": { "北京市": ["东城区", "西城区", "朝阳区", "海淀区"] },
        "上海市": { "上海市": ["黄浦区", "徐汇区", "浦东新区"] },
        "广东省": { "广州市": ["天河区", "海珠区", "越秀区"], "深圳市": ["南山区", "福田区", "罗湖区"] },
        "浙江省": { "杭州市": ["西湖区", "上城区", "拱墅区"], "宁波市": ["海曙区", "江北区"] },
        "江苏省": { "南京市": ["玄武区", "秦淮区"], "苏州市": ["姑苏区", "吴中区"] },
        "四川省": { "成都市": ["锦江区", "青羊区", "武侯区"] },
        "湖北省": { "武汉市": ["江岸区", "武昌区"] },
        "山东省": { "济南市": ["历下区", "市中区"] },
        "河南省": { "郑州市": ["中原区", "二七区"] },
        "湖南省": { "长沙市": ["芙蓉区", "天心区"] },
        "重庆市": { "重庆市": ["渝中区", "江北区"] }
      }
    };
  },
  computed: {
    regionDisplay() {
      const { province, city, district } = this.form;
      const arr = [province, city, district].filter(Boolean);
      return arr.length ? arr.join(" ") : "请选择省/市/区";
    }
  },
  onLoad(options) {
    if (options.id) {
      this.id = options.id;
      this.loadAddress(options.id);
      common_vendor.index.setNavigationBarTitle({ title: "编辑收货地址" });
    } else {
      common_vendor.index.setNavigationBarTitle({ title: "新建收货地址" });
      this.loading = false;
    }
    this.initH5Region();
  },
  methods: {
    onRegionPickerChange(e) {
      var _a;
      const val = ((_a = e == null ? void 0 : e.detail) == null ? void 0 : _a.value) || [];
      this.form.province = val[0] || "";
      this.form.city = val[1] || "";
      this.form.district = val[2] || "";
    },
    initH5Region() {
      try {
        const isH5 = typeof window !== "undefined";
        if (!isH5)
          return;
        const provinces = Object.keys(this.areaTree || {});
        this.regionRange[0] = provinces;
        const p = provinces[0] || "";
        const cities = Object.keys(this.areaTree && this.areaTree[p] || {});
        this.regionRange[1] = cities;
        const c = cities[0] || "";
        const areas = this.areaTree && this.areaTree[p] && this.areaTree[p][c] || [];
        this.regionRange[2] = areas;
        this.regionIndex = [0, 0, 0];
      } catch (e) {
      }
    },
    onH5RegionColumnChange(e) {
      const col = e.detail.column;
      const idx = e.detail.value;
      this.regionIndex[col] = idx;
      const p = this.regionRange[0][this.regionIndex[0]] || "";
      if (col === 0) {
        const cities = Object.keys(this.areaTree && this.areaTree[p] || {});
        this.regionRange[1] = cities;
        this.regionIndex[1] = 0;
        const c = cities[0] || "";
        const areas = this.areaTree && this.areaTree[p] && this.areaTree[p][c] || [];
        this.regionRange[2] = areas;
        this.regionIndex[2] = 0;
      } else if (col === 1) {
        const c = this.regionRange[1][this.regionIndex[1]] || "";
        const areas = this.areaTree && this.areaTree[p] && this.areaTree[p][c] || [];
        this.regionRange[2] = areas;
        this.regionIndex[2] = 0;
      }
    },
    onH5RegionChange(e) {
      this.regionIndex = e.detail.value;
      const p = this.regionRange[0][this.regionIndex[0]] || "";
      const c = this.regionRange[1][this.regionIndex[1]] || "";
      const a = this.regionRange[2][this.regionIndex[2]] || "";
      this.form.province = p;
      this.form.city = c;
      this.form.district = a;
    },
    loadAddress(id) {
      this.loading = true;
      const u = common_vendor.index.getStorageSync("user");
      const token = u && (u.token || u.data && u.data.token) || "";
      api_index.getAddresses({ addresses_id: id, token }).then((res) => {
        if (res && res.success && res.data) {
          const addr = res.data;
          this.form = {
            receiver: addr.receiver,
            phone: addr.phone,
            province: addr.province,
            city: addr.city,
            district: addr.district,
            detail_address: addr.detail_address,
            is_default: addr.is_default
          };
          this.syncH5RegionByForm();
        }
      }).catch((err) => {
        console.error(err);
        common_vendor.index.showToast({ title: "获取地址详情失败", icon: "none" });
      }).finally(() => {
        this.loading = false;
      });
    },
    syncH5RegionByForm() {
      try {
        const isH5 = typeof window !== "undefined";
        if (!isH5)
          return;
        const pIdx = (this.regionRange[0] || []).indexOf(this.form.province);
        if (pIdx >= 0) {
          this.regionIndex[0] = pIdx;
          const p = this.regionRange[0][pIdx];
          const cities = Object.keys(this.areaTree && this.areaTree[p] || {});
          this.regionRange[1] = cities;
          const cIdx = cities.indexOf(this.form.city);
          this.regionIndex[1] = cIdx >= 0 ? cIdx : 0;
          const c = cities[this.regionIndex[1]] || "";
          const areas = this.areaTree && this.areaTree[p] && this.areaTree[p][c] || [];
          this.regionRange[2] = areas;
          const aIdx = areas.indexOf(this.form.district);
          this.regionIndex[2] = aIdx >= 0 ? aIdx : 0;
        }
      } catch (e) {
      }
    },
    onSwitchChange(e) {
      this.form.is_default = e.detail.value ? 1 : 0;
    },
    saveAddress() {
      if (!this.form.receiver)
        return common_vendor.index.showToast({ title: "请填写收货人", icon: "none" });
      if (!this.form.phone)
        return common_vendor.index.showToast({ title: "请填写手机号", icon: "none" });
      if (!this.form.province || !this.form.city || !this.form.district)
        return common_vendor.index.showToast({ title: "请填写完整地区", icon: "none" });
      if (!this.form.detail_address)
        return common_vendor.index.showToast({ title: "请填写详细地址", icon: "none" });
      const u = common_vendor.index.getStorageSync("user");
      const token = u && (u.token || u.data && u.data.token) || "";
      const payload = { ...this.form, token };
      let p;
      if (this.id) {
        payload.addresses_id = this.id;
        p = api_index.updateAddress(payload);
      } else {
        p = api_index.addAddress(payload);
      }
      p.then((res) => {
        if (res && res.success) {
          common_vendor.index.showToast({ title: "保存成功", icon: "success" });
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 1500);
        } else {
          common_vendor.index.showToast({ title: res.message || "保存失败", icon: "none" });
        }
      }).catch((err) => {
        console.error(err);
        common_vendor.index.showToast({ title: "保存失败", icon: "none" });
      });
    },
    deleteAddressHandler() {
      if (!this.id)
        return;
      const u = common_vendor.index.getStorageSync("user");
      const token = u && (u.token || u.data && u.data.token) || "";
      api_index.deleteAddress({ addresses_id: this.id, token }).then((res) => {
        if (res && res.success) {
          common_vendor.index.showToast({ title: "删除成功", icon: "success" });
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 1200);
        } else {
          common_vendor.index.showToast({ title: (res == null ? void 0 : res.message) || "删除失败", icon: "none" });
        }
      }).catch(() => {
        common_vendor.index.showToast({ title: "删除失败", icon: "none" });
      });
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
    b: $data.form.receiver,
    c: common_vendor.o(($event) => $data.form.receiver = $event.detail.value),
    d: $data.form.phone,
    e: common_vendor.o(($event) => $data.form.phone = $event.detail.value),
    f: common_vendor.t($options.regionDisplay),
    g: common_vendor.o((...args) => $options.onRegionPickerChange && $options.onRegionPickerChange(...args)),
    h: $data.form.detail_address,
    i: common_vendor.o(($event) => $data.form.detail_address = $event.detail.value),
    j: $data.form.is_default === 1,
    k: common_vendor.o((...args) => $options.onSwitchChange && $options.onSwitchChange(...args)),
    l: common_vendor.o((...args) => $options.saveAddress && $options.saveAddress(...args)),
    m: $data.id
  }, $data.id ? {
    n: common_vendor.o((...args) => $options.deleteAddressHandler && $options.deleteAddressHandler(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
