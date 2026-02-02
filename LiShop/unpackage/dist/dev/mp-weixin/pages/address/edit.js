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
        "北京市": { "北京市": ["东城区", "西城区", "朝阳区", "海淀区", "丰台区", "石景山区", "通州区", "昌平区", "顺义区", "大兴区", "房山区"] },
        "上海市": { "上海市": ["黄浦区", "徐汇区", "长宁区", "静安区", "普陀区", "虹口区", "杨浦区", "浦东新区", "闵行区", "宝山区", "嘉定区", "青浦区", "松江区"] },
        "天津市": { "天津市": ["和平区", "河东区", "河西区", "南开区", "河北区", "红桥区", "东丽区", "西青区", "津南区", "北辰区", "滨海新区"] },
        "重庆市": { "重庆市": ["渝中区", "江北区", "南岸区", "沙坪坝区", "九龙坡区", "渝北区", "巴南区", "北碚区"] },
        "广东省": {
          "广州市": ["天河区", "海珠区", "越秀区", "白云区", "荔湾区", "番禺区", "黄埔区", "花都区"],
          "深圳市": ["南山区", "福田区", "罗湖区", "宝安区", "龙岗区", "盐田区", "龙华区", "光明区", "坪山区"],
          "佛山市": ["禅城区", "南海区", "顺德区"]
        },
        "浙江省": { "杭州市": ["西湖区", "上城区", "拱墅区", "滨江区", "余杭区", "萧山区", "临平区"], "宁波市": ["海曙区", "江北区", "鄞州区"] },
        "江苏省": { "南京市": ["玄武区", "秦淮区", "鼓楼区", "建邺区", "栖霞区", "雨花台区"], "苏州市": ["姑苏区", "吴中区", "相城区", "虎丘区", "工业园区"] },
        "四川省": { "成都市": ["锦江区", "青羊区", "金牛区", "武侯区", "成华区", "高新区"] },
        "湖北省": { "武汉市": ["江岸区", "江汉区", "硚口区", "汉阳区", "武昌区", "青山区", "洪山区"] },
        "山东省": { "济南市": ["历下区", "市中区", "槐荫区", "天桥区"], "青岛市": ["市南区", "市北区", "黄岛区", "李沧区", "城阳区", "崂山区"] },
        "福建省": { "福州市": ["鼓楼区", "台江区", "仓山区", "晋安区"], "厦门市": ["思明区", "海沧区", "湖里区", "集美区", "翔安区"] },
        "安徽省": { "合肥市": ["蜀山区", "庐阳区", "瑶海区", "包河区"] },
        "河北省": { "石家庄市": ["长安区", "桥西区", "新华区", "裕华区"] },
        "辽宁省": { "沈阳市": ["和平区", "皇姑区", "大东区", "铁西区"] },
        "山西省": { "太原市": ["小店区", "迎泽区", "杏花岭区", "尖草坪区"] },
        "陕西省": { "西安市": ["未央区", "莲湖区", "新城区", "碑林区", "雁塔区", "高新区", "长安区"] },
        "吉林省": { "长春市": ["南关区", "朝阳区", "宽城区", "二道区"] },
        "黑龙江省": { "哈尔滨市": ["道里区", "南岗区", "道外区", "香坊区"] },
        "广西壮族自治区": { "南宁市": ["青秀区", "兴宁区", "西乡塘区", "江南区", "良庆区"] },
        "海南省": { "海口市": ["龙华区", "美兰区", "琼山区", "秀英区"] },
        "贵州省": { "贵阳市": ["云岩区", "南明区", "花溪区", "乌当区"] },
        "云南省": { "昆明市": ["五华区", "盘龙区", "官渡区", "西山区", "呈贡区"] },
        "甘肃省": { "兰州市": ["城关区", "七里河区", "西固区", "安宁区"] },
        "青海省": { "西宁市": ["城中区", "城西区", "城东区", "城北区"] },
        "宁夏回族自治区": { "银川市": ["兴庆区", "金凤区", "西夏区"] },
        "新疆维吾尔自治区": { "乌鲁木齐市": ["天山区", "沙依巴克区", "新市区", "水磨沟区"] },
        "西藏自治区": { "拉萨市": ["城关区"] },
        "河南省": { "郑州市": ["中原区", "二七区", "管城回族区", "金水区", "上街区", "惠济区"] },
        "湖南省": { "长沙市": ["芙蓉区", "天心区", "岳麓区", "开福区", "雨花区"] },
        "内蒙古自治区": { "呼和浩特市": ["新城区", "赛罕区", "回民区", "玉泉区"] }
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
    async ensureAreaTree() {
      try {
        const isH5 = typeof window !== "undefined";
        if (!isH5)
          return;
        const cached = common_vendor.index.getStorageSync("area_tree_v2") || "";
        if (cached && typeof cached === "object") {
          this.areaTree = cached;
          return;
        }
        if (cached && typeof cached === "string") {
          try {
            this.areaTree = JSON.parse(cached);
          } catch (e) {
          }
          if (Object.keys(this.areaTree || {}).length)
            return;
        }
        const resp = await fetch("https://unpkg.com/province-city-china/dist/level.json", { method: "GET" });
        const data = await resp.json();
        const tree = {};
        (Array.isArray(data) ? data : []).forEach((prov) => {
          const pname = String((prov == null ? void 0 : prov.name) || "").trim();
          const cities = Array.isArray(prov == null ? void 0 : prov.children) ? prov.children : [];
          const cmap = {};
          cities.forEach((city) => {
            const cname = String((city == null ? void 0 : city.name) || "").trim();
            const areas = (Array.isArray(city == null ? void 0 : city.children) ? city.children : []).map((a) => String((a == null ? void 0 : a.name) || "").trim()).filter(Boolean);
            if (cname)
              cmap[cname] = areas;
          });
          if (pname && Object.keys(cmap).length)
            tree[pname] = cmap;
        });
        if (Object.keys(tree).length) {
          this.areaTree = tree;
          try {
            common_vendor.index.setStorageSync("area_tree_v2", tree);
          } catch (e) {
          }
        }
      } catch (e) {
      }
    },
    onRegionPickerChange(e) {
      var _a;
      const val = ((_a = e == null ? void 0 : e.detail) == null ? void 0 : _a.value) || [];
      this.form.province = val[0] || "";
      this.form.city = val[1] || "";
      this.form.district = val[2] || "";
    },
    async initH5Region() {
      try {
        const isH5 = typeof window !== "undefined";
        if (!isH5)
          return;
        await this.ensureAreaTree();
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
        common_vendor.index.__f__("error", "at pages/address/edit.vue:224", err);
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
        common_vendor.index.__f__("error", "at pages/address/edit.vue:280", err);
        common_vendor.index.showToast({ title: "保存失败", icon: "none" });
      });
    },
    deleteAddressHandler() {
      if (!this.id)
        return;
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要删除该收货地址吗？",
        success: (res) => {
          if (res.confirm) {
            const u = common_vendor.index.getStorageSync("user");
            const token = u && (u.token || u.data && u.data.token) || "";
            api_index.deleteAddress({ addresses_id: this.id, token }).then((res2) => {
              if (res2 && res2.success) {
                common_vendor.index.showToast({ title: "删除成功", icon: "success" });
                setTimeout(() => {
                  common_vendor.index.navigateBack();
                }, 1200);
              } else {
                common_vendor.index.showToast({ title: (res2 == null ? void 0 : res2.message) || "删除失败", icon: "none" });
              }
            }).catch(() => {
              common_vendor.index.showToast({ title: "删除失败", icon: "none" });
            });
          }
        }
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
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/address/edit.js.map
