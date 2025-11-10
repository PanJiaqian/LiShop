"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return { order: null, orders: [] };
  },
  onLoad(query) {
    const id = Number(query == null ? void 0 : query.id);
    const list = common_vendor.index.getStorageSync("orders") || [];
    if (id) {
      this.order = list.find((o) => o.id === id) || null;
    } else {
      this.orders = list;
    }
  },
  methods: {
    formatTime(t) {
      try {
        return new Date(t).toLocaleString();
      } catch {
        return t;
      }
    },
    copyWaybill(no) {
      try {
        common_vendor.index.setClipboardData({ data: String(no) });
        common_vendor.index.showToast({ title: "已复制运单号", icon: "success" });
      } catch (e) {
      }
    },
    openDetail(id) {
      common_vendor.index.navigateTo({ url: "/pages/order/index?id=" + id });
    },
    firstThumbs(o) {
      try {
        const imgs = [];
        o.rooms.forEach((r) => r.items.forEach((x) => imgs.push(x.image || "/static/logo.png")));
        return imgs.slice(0, 3);
      } catch {
        return [];
      }
    },
    exportExcel(order) {
      try {
        const header = ["房间", "商品", "型号", "色温", "长度", "单价", "数量", "金额"];
        let html = '<table border="1" cellspacing="0" cellpadding="4"><tr>' + header.map((h) => `<th>${h}</th>`).join("") + "</tr>";
        order.rooms.forEach((r) => {
          r.items.forEach((x) => {
            const row = [r.name, x.title, x.id, x.specTemp || "", x.specLength || "", x.price.toFixed(2), x.quantity, (x.price * x.quantity).toFixed(2)];
            html += "<tr>" + row.map((v) => `<td>${v}</td>`).join("") + "</tr>";
          });
        });
        html += "</table>";
        const blob = new Blob([`\uFEFF${html}`], { type: "application/vnd.ms-excel" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `订单_${order.id}.xls`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        common_vendor.index.showToast({ title: "已导出Excel", icon: "success" });
      } catch (e) {
        common_vendor.index.showToast({ title: "导出仅支持H5", icon: "none" });
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.order
  }, $data.order ? common_vendor.e({
    b: common_vendor.t($data.order.orderNo || $data.order.id),
    c: common_vendor.t($options.formatTime($data.order.createdAt)),
    d: common_vendor.t($data.order.total.toFixed(2)),
    e: $data.order.waybillNo
  }, $data.order.waybillNo ? {
    f: common_vendor.t($data.order.waybillNo),
    g: common_vendor.o(($event) => $options.copyWaybill($data.order.waybillNo))
  } : {}, {
    h: ($data.order.tracking || []).length
  }, ($data.order.tracking || []).length ? {
    i: common_vendor.f($data.order.tracking, (ev, i, i0) => {
      return common_vendor.e({
        a: common_vendor.t(ev.status),
        b: common_vendor.t(ev.desc),
        c: common_vendor.t($options.formatTime(ev.time)),
        d: ev.place
      }, ev.place ? {
        e: common_vendor.t(ev.place)
      } : {}, {
        f: i
      });
    })
  } : {}, {
    j: common_vendor.f($data.order.rooms, (r, k0, i0) => {
      return {
        a: common_vendor.t(r.name),
        b: common_vendor.t(r.roomTotal.toFixed(2)),
        c: common_vendor.f(r.items, (x, k1, i1) => {
          return {
            a: common_vendor.t(x.title),
            b: common_vendor.t(x.id),
            c: common_vendor.t(x.specTemp || "-"),
            d: common_vendor.t(x.specLength || "-"),
            e: common_vendor.t(x.price.toFixed(2)),
            f: common_vendor.t(x.quantity),
            g: common_vendor.t((x.price * x.quantity).toFixed(2)),
            h: x.id + "_" + x.specLength + "_" + x.specTemp
          };
        }),
        d: r.name
      };
    }),
    k: common_vendor.o(($event) => $options.exportExcel($data.order))
  }) : common_vendor.e({
    l: $data.orders.length
  }, $data.orders.length ? {
    m: common_vendor.f($data.orders, (o, k0, i0) => {
      return {
        a: common_vendor.t(o.orderNo || o.id),
        b: common_vendor.t($options.formatTime(o.createdAt)),
        c: common_vendor.t(o.total.toFixed(2)),
        d: common_vendor.f($options.firstThumbs(o), (src, i, i1) => {
          return {
            a: i,
            b: src
          };
        }),
        e: common_vendor.o(($event) => $options.openDetail(o.id), o.id),
        f: o.id
      };
    })
  } : {}));
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-17a44f9d"]]);
wx.createPage(MiniProgramPage);
