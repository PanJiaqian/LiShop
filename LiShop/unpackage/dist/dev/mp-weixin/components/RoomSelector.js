"use strict";
const common_vendor = require("../common/vendor.js");
const api_index = require("../api/index.js");
const common_assets = require("../common/assets.js");
const _sfc_main = {
  name: "RoomSelector",
  props: {
    visible: { type: Boolean, default: false },
    rooms: { type: Array, default: () => [] },
    selectedName: { type: String, default: "" },
    type: { type: String, default: "" }
  },
  data() {
    return {
      newRoomName: "",
      createAddressMode: false,
      addrForm: {
        receiver: "",
        phone: "",
        province: "",
        city: "",
        district: "",
        detail_address: "",
        is_default: 0
      },
      swipeIndex: -1,
      touchStartX: 0,
      touchStartY: 0,
      isSwiping: false,
      deleteWidth: 160,
      deletedIds: [],
      localRooms: [],
      addrRegionRange: [[], [], []],
      addrRegionIndex: [0, 0, 0],
      addrAreaTree: {
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
    isAddressMode() {
      if (this.type === "addr")
        return true;
      if (this.type === "room")
        return false;
      const list = this.rooms || [];
      if (Array.isArray(list) && list.length > 0) {
        const a = list[0];
        return !!(a && a.raw);
      }
      return false;
    },
    displayRooms() {
      if (this.isAddressMode)
        return this.rooms || [];
      const ids = this.deletedIds || [];
      const list = this.rooms && Array.isArray(this.rooms) ? this.rooms : [];
      return list.filter((r) => {
        const rid = (r == null ? void 0 : r.id) || (r == null ? void 0 : r.room_id) || (r == null ? void 0 : r.name) || "";
        return rid && !ids.includes(rid);
      });
    },
    addrRegionDisplay() {
      const { province, city, district } = this.addrForm;
      const arr = [province, city, district].filter(Boolean);
      return arr.length ? arr.join(" ") : "请选择省/市/区";
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.newRoomName = "";
        this.createAddressMode = false;
        this.addrForm = { receiver: "", phone: "", province: "", city: "", district: "", detail_address: "", is_default: 0 };
        this.initH5AddrRegion();
        this.swipeIndex = -1;
        this.deletedIds = [];
      }
    }
  },
  methods: {
    async ensureAddrAreaTree() {
      try {
        const isH5 = typeof window !== "undefined";
        if (!isH5)
          return;
        const cached = common_vendor.index.getStorageSync("addr_area_tree_v2") || "";
        if (cached && typeof cached === "object") {
          this.addrAreaTree = cached;
          return;
        }
        if (cached && typeof cached === "string") {
          try {
            this.addrAreaTree = JSON.parse(cached);
          } catch (e) {
          }
          if (Object.keys(this.addrAreaTree || {}).length)
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
          this.addrAreaTree = tree;
          try {
            common_vendor.index.setStorageSync("addr_area_tree_v2", tree);
          } catch (e) {
          }
        }
      } catch (e) {
      }
    },
    close() {
      this.$emit("close");
    },
    select(room) {
      this.$emit("select", room);
    },
    onItemTouchStart(e, index) {
      try {
        const t = e && e.touches && e.touches[0] ? e.touches[0] : {};
        this.touchStartX = Number(t.clientX ?? t.pageX ?? 0) || 0;
        this.touchStartY = Number(t.clientY ?? t.pageY ?? 0) || 0;
        this.isSwiping = true;
      } catch (err) {
        this.isSwiping = false;
      }
    },
    onItemTouchMove(e, index) {
      if (!this.isSwiping)
        return;
      try {
        const t = e && e.touches && e.touches[0] ? e.touches[0] : {};
        const x = Number(t.clientX ?? t.pageX ?? 0) || 0;
        const y = Number(t.clientY ?? t.pageY ?? 0) || 0;
        const dx = x - this.touchStartX;
        const dy = y - this.touchStartY;
        if (Math.abs(dy) > 20)
          return;
        if (dx < -30) {
          this.swipeIndex = index;
        } else if (dx > 30) {
          this.swipeIndex = -1;
        }
      } catch (err) {
      }
    },
    onItemTouchEnd() {
      this.isSwiping = false;
    },
    onItemMouseDown(e, index) {
      try {
        const isH5 = typeof window !== "undefined";
        if (!isH5)
          return;
        this.touchStartX = Number((e == null ? void 0 : e.clientX) ?? 0) || 0;
        this.touchStartY = Number((e == null ? void 0 : e.clientY) ?? 0) || 0;
        this.isSwiping = true;
      } catch (err) {
        this.isSwiping = false;
      }
    },
    onItemMouseMove(e, index) {
      const isH5 = typeof window !== "undefined";
      if (!isH5 || !this.isSwiping)
        return;
      try {
        const x = Number((e == null ? void 0 : e.clientX) ?? 0) || 0;
        const y = Number((e == null ? void 0 : e.clientY) ?? 0) || 0;
        const dx = x - this.touchStartX;
        const dy = y - this.touchStartY;
        if (Math.abs(dy) > 20)
          return;
        if (dx < -30)
          this.swipeIndex = index;
        else if (dx > 30)
          this.swipeIndex = -1;
      } catch (err) {
      }
    },
    onItemMouseUp() {
      const isH5 = typeof window !== "undefined";
      if (!isH5)
        return;
      this.isSwiping = false;
    },
    onItemClick(room, index) {
      const isH5 = typeof window !== "undefined";
      if (isH5 && this.swipeIndex === index)
        return;
      this.select(room);
    },
    onDelete(room, index) {
      try {
        const rid = (room == null ? void 0 : room.id) || (room == null ? void 0 : room.room_id) || "";
        if (!rid) {
          common_vendor.index.showToast({ title: "房间ID缺失", icon: "none" });
          return;
        }
        api_index.deleteRoom({ room_id: rid, name: "葱测试" }).then((data) => {
          const ok = !!(data && data.success === true);
          if (ok) {
            common_vendor.index.showToast({ title: data && data.message || "删除房间成功", icon: "success" });
            const key = rid || (room == null ? void 0 : room.name) || "";
            if (key)
              this.deletedIds = Array.from(/* @__PURE__ */ new Set([key, ...this.deletedIds]));
            this.swipeIndex = -1;
          } else {
            const msg = data && (data.message || (data == null ? void 0 : data.data) && data.data.reason) || "删除失败";
            common_vendor.index.showToast({ title: msg, icon: "none" });
          }
        }).catch(() => {
          common_vendor.index.showToast({ title: "网络请求失败", icon: "none" });
        });
      } catch (e) {
        common_vendor.index.showToast({ title: "删除失败", icon: "none" });
      }
    },
    confirmSelect() {
      const list = this.rooms || [];
      const picked = list.find((r) => r && r.name === this.selectedName);
      if (picked) {
        this.$emit("select", picked);
        this.$emit("close");
      }
    },
    confirmCreate() {
      if (!this.newRoomName.trim()) {
        return;
      }
      this.$emit("create", this.newRoomName.trim());
    },
    toggleCreateAddress() {
      this.createAddressMode = true;
    },
    onAddrSwitchChange(e) {
      this.addrForm.is_default = e.detail.value ? 1 : 0;
    },
    onAddrRegionChange(e) {
      var _a;
      const val = ((_a = e == null ? void 0 : e.detail) == null ? void 0 : _a.value) || [];
      this.addrForm.province = val[0] || "";
      this.addrForm.city = val[1] || "";
      this.addrForm.district = val[2] || "";
    },
    async initH5AddrRegion() {
      try {
        const isH5 = typeof window !== "undefined";
        if (!isH5)
          return;
        await this.ensureAddrAreaTree();
        const provinces = Object.keys(this.addrAreaTree || {});
        const p = provinces[0] || "";
        const cities = Object.keys(this.addrAreaTree && this.addrAreaTree[p] || {});
        const c = cities[0] || "";
        const areas = this.addrAreaTree && this.addrAreaTree[p] && this.addrAreaTree[p][c] || [];
        this.addrRegionRange = [provinces, cities, areas];
        this.addrRegionIndex = [0, 0, 0];
      } catch (e) {
      }
    },
    onH5AddrRegionColumnChange(e) {
      const col = e.detail.column;
      const idx = e.detail.value;
      this.addrRegionIndex[col] = idx;
      const p = this.addrRegionRange[0][this.addrRegionIndex[0]] || "";
      if (col === 0) {
        const cities = Object.keys(this.addrAreaTree && this.addrAreaTree[p] || {});
        const c = cities[0] || "";
        const areas = this.addrAreaTree && this.addrAreaTree[p] && this.addrAreaTree[p][c] || [];
        this.addrRegionRange = [this.addrRegionRange[0], cities, areas];
        this.addrRegionIndex[1] = 0;
        this.addrRegionIndex[2] = 0;
      } else if (col === 1) {
        const c = this.addrRegionRange[1][this.addrRegionIndex[1]] || "";
        const areas = this.addrAreaTree && this.addrAreaTree[p] && this.addrAreaTree[p][c] || [];
        this.addrRegionRange = [this.addrRegionRange[0], this.addrRegionRange[1], areas];
        this.addrRegionIndex[2] = 0;
      }
    },
    onH5AddrRegionChange(e) {
      this.addrRegionIndex = e.detail.value;
      const p = this.addrRegionRange[0][this.addrRegionIndex[0]] || "";
      const c = this.addrRegionRange[1][this.addrRegionIndex[1]] || "";
      const a = this.addrRegionRange[2][this.addrRegionIndex[2]] || "";
      this.addrForm.province = p;
      this.addrForm.city = c;
      this.addrForm.district = a;
    },
    saveAddress() {
      const f = this.addrForm;
      if (!f.receiver || !f.phone || !f.province || !f.city || !f.district || !f.detail_address) {
        try {
          common_vendor.index.showToast({ title: "请填写完整地址信息", icon: "none" });
        } catch (e) {
        }
        return;
      }
      this.$emit("createAddress", { ...f });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.visible
  }, $props.visible ? common_vendor.e({
    b: $options.isAddressMode
  }, $options.isAddressMode ? {} : {}, {
    c: common_vendor.o((...args) => $options.close && $options.close(...args)),
    d: $options.isAddressMode && $props.rooms.length === 0
  }, $options.isAddressMode && $props.rooms.length === 0 ? {} : {}, {
    e: !$options.isAddressMode
  }, !$options.isAddressMode ? {
    f: $data.newRoomName,
    g: common_vendor.o(($event) => $data.newRoomName = $event.detail.value)
  } : {}, {
    h: $options.isAddressMode && $data.createAddressMode
  }, $options.isAddressMode && $data.createAddressMode ? {
    i: $data.addrForm.receiver,
    j: common_vendor.o(($event) => $data.addrForm.receiver = $event.detail.value),
    k: $data.addrForm.phone,
    l: common_vendor.o(($event) => $data.addrForm.phone = $event.detail.value),
    m: common_vendor.t($options.addrRegionDisplay),
    n: common_vendor.o((...args) => $options.onAddrRegionChange && $options.onAddrRegionChange(...args)),
    o: $data.addrForm.detail_address,
    p: common_vendor.o(($event) => $data.addrForm.detail_address = $event.detail.value),
    q: $data.addrForm.is_default === 1,
    r: common_vendor.o((...args) => $options.onAddrSwitchChange && $options.onAddrSwitchChange(...args))
  } : {}, {
    s: common_vendor.f($options.displayRooms, (room, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(room.name),
        b: $props.selectedName === room.name ? 1 : "",
        c: $data.swipeIndex === index ? 1 : "",
        d: common_vendor.o(($event) => $options.onItemClick(room, index), index)
      }, !$options.isAddressMode ? {
        e: $data.swipeIndex === index ? 1 : "",
        f: common_vendor.o(($event) => $options.onDelete(room, index), index)
      } : {}, {
        g: index,
        h: common_vendor.o(($event) => $options.onItemTouchStart($event, index), index),
        i: common_vendor.o(($event) => $options.onItemTouchMove($event, index), index),
        j: common_vendor.o((...args) => $options.onItemTouchEnd && $options.onItemTouchEnd(...args), index),
        k: common_vendor.o((...args) => $options.onItemTouchEnd && $options.onItemTouchEnd(...args), index),
        l: common_vendor.o(($event) => $options.onItemMouseDown($event, index), index),
        m: common_vendor.o(($event) => $options.onItemMouseMove($event, index), index),
        n: common_vendor.o((...args) => $options.onItemMouseUp && $options.onItemMouseUp(...args), index),
        o: common_vendor.o((...args) => $options.onItemMouseUp && $options.onItemMouseUp(...args), index)
      });
    }),
    t: common_assets._imports_0$2,
    v: !$options.isAddressMode,
    w: common_vendor.o((...args) => $options.close && $options.close(...args)),
    x: !$options.isAddressMode
  }, !$options.isAddressMode ? {
    y: common_vendor.o((...args) => $options.confirmCreate && $options.confirmCreate(...args))
  } : {}, {
    z: $options.isAddressMode && !$data.createAddressMode
  }, $options.isAddressMode && !$data.createAddressMode ? {
    A: common_vendor.o((...args) => $options.toggleCreateAddress && $options.toggleCreateAddress(...args))
  } : {}, {
    B: $options.isAddressMode && $data.createAddressMode
  }, $options.isAddressMode && $data.createAddressMode ? {
    C: common_vendor.o((...args) => $options.saveAddress && $options.saveAddress(...args))
  } : {}, {
    D: common_vendor.o(() => {
    }),
    E: common_vendor.o((...args) => $options.close && $options.close(...args))
  }) : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-9c17e027"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/RoomSelector.js.map
