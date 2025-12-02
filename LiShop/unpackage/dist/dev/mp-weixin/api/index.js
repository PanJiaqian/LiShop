"use strict";
const common_vendor = require("../common/vendor.js");
const BASE_URL = "http://182.61.54.90:6149";
function getBearer(token) {
  if (token)
    return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  try {
    const u = common_vendor.index.getStorageSync("user") || null;
    const t = u && (u.token || u.data && u.data.token) || "";
    if (t)
      return t.startsWith("Bearer ") ? t : `Bearer ${t}`;
  } catch (e) {
  }
  return "";
}
function toQuery(params) {
  const arr = [];
  Object.keys(params || {}).forEach((k) => {
    const v = params[k];
    if (v === void 0 || v === null || v === "")
      return;
    arr.push(encodeURIComponent(k) + "=" + encodeURIComponent(v));
  });
  return arr.join("&");
}
function loginAdmin(payload) {
  return new Promise((resolve, reject) => {
    try {
      common_vendor.index.request({
        url: `${BASE_URL}/api/auth/login/user`,
        method: "POST",
        header: { "Content-Type": "application/json" },
        data: payload,
        success: (res) => {
          const ok = res && res.statusCode >= 200 && res.statusCode < 300;
          if (ok) {
            resolve(res.data);
          } else {
            reject(res);
          }
        },
        fail: (err) => reject(err)
      });
    } catch (e) {
      reject(e);
    }
  });
}
function getRecommendedProducts(options = {}) {
  const {
    page = 1,
    page_size = 20,
    sort_by,
    sort_order,
    available_product_id,
    length,
    quantity,
    color_temperature,
    token
  } = options;
  const query = toQuery({ page, page_size, sort_by, sort_order, available_product_id, length, quantity, color_temperature });
  const url = `${BASE_URL}/api/products/recommended${query ? `?${query}` : ""}`;
  return new Promise((resolve, reject) => {
    const auth = getBearer(token);
    const header = auth ? { "Authorization": auth } : {};
    common_vendor.index.request({
      url,
      method: "GET",
      header,
      success: (res) => {
        let data = res == null ? void 0 : res.data;
        if (typeof data === "string") {
          try {
            data = JSON.parse(data);
          } catch (e) {
          }
        }
        if (res && res.statusCode >= 200 && res.statusCode < 300)
          resolve(data);
        else
          reject(res);
      },
      fail: (err) => reject(err)
    });
  });
}
function getVisibleCategories(options = {}) {
  const { page = 1, page_size = 20, sort_by = "id", sort_order, categories_id, token } = options;
  const query = toQuery({ page, page_size, sort_by, sort_order, categories_id });
  const url = `${BASE_URL}/api/products/categories${query ? `?${query}` : ""}`;
  return new Promise((resolve, reject) => {
    const auth2 = getBearer(token);
    const header2 = auth2 ? { "Authorization": auth2 } : {};
    common_vendor.index.request({
      url,
      method: "GET",
      header: header2,
      success: (res) => {
        let data = res == null ? void 0 : res.data;
        if (typeof data === "string") {
          try {
            data = JSON.parse(data);
          } catch (e) {
          }
        }
        if (res && res.statusCode >= 200 && res.statusCode < 300)
          resolve(data);
        else
          reject(res);
      },
      fail: (err) => reject(err)
    });
  });
}
function searchProducts(options = {}) {
  const {
    user_input = "",
    page = 1,
    page_size = 20,
    sort_by,
    sort_order,
    available_product_id,
    length,
    quantity,
    color_temperature,
    token
  } = options;
  const query = toQuery({ user_input, page, page_size, sort_by, sort_order, available_product_id, length, quantity, color_temperature });
  const url = `${BASE_URL}/api/products/search${query ? `?${query}` : ""}`;
  return new Promise((resolve, reject) => {
    const auth = getBearer(token);
    const header = auth ? { "Authorization": auth } : {};
    common_vendor.index.request({
      url,
      method: "GET",
      header,
      success: (res) => {
        let data = res == null ? void 0 : res.data;
        if (typeof data === "string") {
          try {
            data = JSON.parse(data);
          } catch (e) {
          }
        }
        if (res && res.statusCode >= 200 && res.statusCode < 300)
          resolve(data);
        else
          reject(res);
      },
      fail: (err) => reject(err)
    });
  });
}
function getVisibleProducts(options = {}) {
  const {
    page = 1,
    page_size = 40,
    sort_by = "id",
    sort_order,
    category_id,
    token
  } = options;
  const query = toQuery({ page, page_size, sort_by, sort_order, category_id });
  const url = `${BASE_URL}/api/products${query ? `?${query}` : ""}`;
  return new Promise((resolve, reject) => {
    const auth = getBearer(token);
    const header = auth ? { "Authorization": auth } : {};
    common_vendor.index.request({
      url,
      method: "GET",
      header,
      success: (res) => {
        let data = res == null ? void 0 : res.data;
        if (typeof data === "string") {
          try {
            data = JSON.parse(data);
          } catch (e) {
          }
        }
        if (res && res.statusCode >= 200 && res.statusCode < 300)
          resolve(data);
        else
          reject(res);
      },
      fail: (err) => reject(err)
    });
  });
}
function getProductDetail(options = {}) {
  const { available_product_id, token } = options;
  const query = toQuery({ available_product_id });
  const url = `${BASE_URL}/api/products/detail${query ? `?${query}` : ""}`;
  return new Promise((resolve, reject) => {
    const auth = getBearer(token);
    const header = auth ? { "Authorization": auth } : {};
    common_vendor.index.request({
      url,
      method: "GET",
      header,
      success: (res) => {
        let data = res == null ? void 0 : res.data;
        if (typeof data === "string") {
          try {
            data = JSON.parse(data);
          } catch (e) {
          }
        }
        if (res && res.statusCode >= 200 && res.statusCode < 300)
          resolve(data);
        else
          reject(res);
      },
      fail: (err) => reject(err)
    });
  });
}
function getProductSpecs(options = {}) {
  const {
    page = 1,
    page_size = 20,
    sort_by = "id",
    sort_order,
    available_product_id,
    length,
    quantity,
    color_temperature,
    token
  } = options;
  const query = toQuery({ page, page_size, sort_by, sort_order, available_product_id, length, quantity, color_temperature });
  const url = `${BASE_URL}/api/products/get${query ? `?${query}` : ""}`;
  return new Promise((resolve, reject) => {
    const auth = getBearer(token);
    const header = auth ? { "Authorization": auth } : {};
    common_vendor.index.request({
      url,
      method: "GET",
      header,
      success: (res) => {
        let data = res == null ? void 0 : res.data;
        if (typeof data === "string") {
          try {
            data = JSON.parse(data);
          } catch (e) {
          }
        }
        if (res && res.statusCode >= 200 && res.statusCode < 300)
          resolve(data);
        else
          reject(res);
      },
      fail: (err) => reject(err)
    });
  });
}
function createRoom(options = {}) {
  const { name, body = { name }, token } = options;
  const query = toQuery({ name });
  const url = `${BASE_URL}/api/rooms${query ? `?${query}` : ""}`;
  return new Promise((resolve, reject) => {
    const auth = getBearer(token);
    const header = { "Content-Type": "application/json", ...auth ? { "Authorization": auth } : {} };
    common_vendor.index.request({
      url,
      method: "POST",
      header,
      data: body,
      success: (res) => {
        let data = res == null ? void 0 : res.data;
        if (typeof data === "string") {
          try {
            data = JSON.parse(data);
          } catch (e) {
          }
        }
        if (res && res.statusCode >= 200 && res.statusCode < 300)
          resolve(data);
        else
          reject(res);
      },
      fail: (err) => reject(err)
    });
  });
}
function getRooms(options = {}) {
  const { token } = options;
  const url = `${BASE_URL}/api/rooms`;
  return new Promise((resolve, reject) => {
    const auth = getBearer(token);
    const header = auth ? { "Authorization": auth } : {};
    common_vendor.index.request({
      url,
      method: "GET",
      header,
      success: (res) => {
        let data = res == null ? void 0 : res.data;
        if (typeof data === "string") {
          try {
            data = JSON.parse(data);
          } catch (e) {
          }
        }
        if (res && res.statusCode >= 200 && res.statusCode < 300)
          resolve(data);
        else
          reject(res);
      },
      fail: (err) => reject(err)
    });
  });
}
function addCartItem(options = {}) {
  const { room_id, room_name, product_id, length, quantity, color, note, token } = options;
  const query = toQuery({ room_id, room_name, product_id, length, quantity, color, note });
  const url = `${BASE_URL}/api/cart/items${query ? `?${query}` : ""}`;
  return new Promise((resolve, reject) => {
    const auth = getBearer(token);
    const header = auth ? { "Authorization": auth } : {};
    common_vendor.index.request({
      url,
      method: "POST",
      header,
      success: (res) => {
        let data = res == null ? void 0 : res.data;
        if (typeof data === "string") {
          try {
            data = JSON.parse(data);
          } catch (e) {
          }
        }
        if (res && res.statusCode >= 200 && res.statusCode < 300)
          resolve(data);
        else
          reject(res);
      },
      fail: (err) => reject(err)
    });
  });
}
function getCartItems(options = {}) {
  const { token } = options;
  const url = `${BASE_URL}/api/cart/items`;
  return new Promise((resolve, reject) => {
    const auth = getBearer(token);
    const header = auth ? { "Authorization": auth } : {};
    common_vendor.index.request({
      url,
      method: "GET",
      header,
      success: (res) => {
        let data = res == null ? void 0 : res.data;
        if (typeof data === "string") {
          try {
            data = JSON.parse(data);
          } catch (e) {
          }
        }
        if (res && res.statusCode >= 200 && res.statusCode < 300)
          resolve(data);
        else
          reject(res);
      },
      fail: (err) => reject(err)
    });
  });
}
function deleteCartItem(options = {}) {
  const { id, body = {}, token } = options;
  const query = toQuery({ id });
  const url = `${BASE_URL}/api/cart/items/delete${query ? `?${query}` : ""}`;
  return new Promise((resolve, reject) => {
    const auth = getBearer(token);
    const header = { "Content-Type": "application/json", ...auth ? { "Authorization": auth } : {} };
    common_vendor.index.request({
      url,
      method: "POST",
      header,
      data: body,
      success: (res) => {
        let data = res == null ? void 0 : res.data;
        if (typeof data === "string") {
          try {
            data = JSON.parse(data);
          } catch (e) {
          }
        }
        if (res && res.statusCode >= 200 && res.statusCode < 300)
          resolve(data);
        else
          reject(res);
      },
      fail: (err) => reject(err)
    });
  });
}
function updateCartItem(options = {}) {
  const { id, room_id, product_id, length, quantity, color, note, token } = options;
  const query = toQuery({ id, room_id, product_id, length, quantity, color, note });
  const url = `${BASE_URL}/api/cart/items/update${query ? `?${query}` : ""}`;
  return new Promise((resolve, reject) => {
    const auth = getBearer(token);
    const header = auth ? { "Authorization": auth } : {};
    common_vendor.index.request({
      url,
      method: "POST",
      header,
      success: (res) => {
        let data = res == null ? void 0 : res.data;
        if (typeof data === "string") {
          try {
            data = JSON.parse(data);
          } catch (e) {
          }
        }
        if (res && res.statusCode >= 200 && res.statusCode < 300)
          resolve(data);
        else
          reject(res);
      },
      fail: (err) => reject(err)
    });
  });
}
function getUserProfile(options = {}) {
  const { token } = options;
  const url = `${BASE_URL}/api/user/profile`;
  return new Promise((resolve, reject) => {
    const auth = getBearer(token);
    const header = auth ? { "Authorization": auth } : {};
    common_vendor.index.request({
      url,
      method: "GET",
      header,
      success: (res) => {
        let data = res == null ? void 0 : res.data;
        if (typeof data === "string") {
          try {
            data = JSON.parse(data);
          } catch (e) {
          }
        }
        if (res && res.statusCode >= 200 && res.statusCode < 300)
          resolve(data);
        else
          reject(res);
      },
      fail: (err) => reject(err)
    });
  });
}
function updateUserProfile(options = {}) {
  const { username, phone, region, contact_name, token } = options;
  const query = toQuery({ username, phone, region, contact_name });
  const url = `${BASE_URL}/api/user/profile${query ? `?${query}` : ""}`;
  return new Promise((resolve, reject) => {
    const auth = getBearer(token);
    const header = auth ? { "Authorization": auth } : {};
    common_vendor.index.request({
      url,
      method: "POST",
      header,
      success: (res) => {
        let data = res == null ? void 0 : res.data;
        if (typeof data === "string") {
          try {
            data = JSON.parse(data);
          } catch (e) {
          }
        }
        if (res && res.statusCode >= 200 && res.statusCode < 300)
          resolve(data);
        else
          reject(res);
      },
      fail: (err) => reject(err)
    });
  });
}
function sendSecurityCode(options = {}) {
  const { token } = options;
  const url = `${BASE_URL}/api/user/security/code/send`;
  return new Promise((resolve, reject) => {
    const auth = getBearer(token);
    const header = auth ? { "Authorization": auth } : {};
    common_vendor.index.request({
      url,
      method: "POST",
      header,
      success: (res) => {
        let data = res == null ? void 0 : res.data;
        if (typeof data === "string") {
          try {
            data = JSON.parse(data);
          } catch (e) {
          }
        }
        if (res && res.statusCode >= 200 && res.statusCode < 300)
          resolve(data);
        else
          reject(res);
      },
      fail: (err) => reject(err)
    });
  });
}
function updateUserPhone(options = {}) {
  const { new_phone, code, token } = options;
  const query = toQuery({ new_phone, code });
  const url = `${BASE_URL}/api/user/security/phone/update${query ? `?${query}` : ""}`;
  return new Promise((resolve, reject) => {
    const auth = getBearer(token);
    const header = auth ? { "Authorization": auth } : {};
    common_vendor.index.request({
      url,
      method: "POST",
      header,
      success: (res) => {
        let data = res == null ? void 0 : res.data;
        if (typeof data === "string") {
          try {
            data = JSON.parse(data);
          } catch (e) {
          }
        }
        if (res && res.statusCode >= 200 && res.statusCode < 300)
          resolve(data);
        else
          reject(res);
      },
      fail: (err) => reject(err)
    });
  });
}
function updateUserEmail(options = {}) {
  const { new_email, code, token } = options;
  const query = toQuery({ new_email, code });
  const url = `${BASE_URL}/api/user/security/email/update${query ? `?${query}` : ""}`;
  return new Promise((resolve, reject) => {
    const auth = getBearer(token);
    const header = auth ? { "Authorization": auth } : {};
    common_vendor.index.request({
      url,
      method: "POST",
      header,
      success: (res) => {
        let data = res == null ? void 0 : res.data;
        if (typeof data === "string") {
          try {
            data = JSON.parse(data);
          } catch (e) {
          }
        }
        if (res && res.statusCode >= 200 && res.statusCode < 300)
          resolve(data);
        else
          reject(res);
      },
      fail: (err) => reject(err)
    });
  });
}
function getAddresses(options = {}) {
  const { addresses_id, token } = options;
  const query = toQuery({ addresses_id });
  const url = `${BASE_URL}/api/user/addresses${query ? `?${query}` : ""}`;
  return new Promise((resolve, reject) => {
    const auth = getBearer(token);
    const header = auth ? { "Authorization": auth } : {};
    common_vendor.index.request({
      url,
      method: "GET",
      header,
      success: (res) => {
        let data = res == null ? void 0 : res.data;
        if (typeof data === "string") {
          try {
            data = JSON.parse(data);
          } catch (e) {
          }
        }
        if (res && res.statusCode >= 200 && res.statusCode < 300)
          resolve(data);
        else
          reject(res);
      },
      fail: (err) => reject(err)
    });
  });
}
function deleteAddress(options = {}) {
  const { addresses_id, token } = options;
  const query = toQuery({ addresses_id });
  const url = `${BASE_URL}/api/user/addresses/delete${query ? `?${query}` : ""}`;
  return new Promise((resolve, reject) => {
    const auth = getBearer(token);
    const header = auth ? { "Authorization": auth } : {};
    common_vendor.index.request({
      url,
      method: "POST",
      header,
      success: (res) => {
        let data = res == null ? void 0 : res.data;
        if (typeof data === "string") {
          try {
            data = JSON.parse(data);
          } catch (e) {
          }
        }
        if (res && res.statusCode >= 200 && res.statusCode < 300)
          resolve(data);
        else
          reject(res);
      },
      fail: (err) => reject(err)
    });
  });
}
function addAddress(options = {}) {
  const { receiver, phone, province, city, district, detail_address, is_default, token } = options;
  const query = toQuery({ receiver, phone, province, city, district, detail_address, is_default });
  const url = `${BASE_URL}/api/user/addresses${query ? `?${query}` : ""}`;
  return new Promise((resolve, reject) => {
    const auth = getBearer(token);
    const header = auth ? { "Authorization": auth } : {};
    common_vendor.index.request({
      url,
      method: "POST",
      header,
      success: (res) => {
        let data = res == null ? void 0 : res.data;
        if (typeof data === "string") {
          try {
            data = JSON.parse(data);
          } catch (e) {
          }
        }
        if (res && res.statusCode >= 200 && res.statusCode < 300)
          resolve(data);
        else
          reject(res);
      },
      fail: (err) => reject(err)
    });
  });
}
function updateAddress(options = {}) {
  const { receiver, phone, province, city, district, detail_address, is_default, addresses_id, token } = options;
  const query = toQuery({ receiver, phone, province, city, district, detail_address, is_default, addresses_id });
  const url = `${BASE_URL}/api/user/addresses/update${query ? `?${query}` : ""}`;
  return new Promise((resolve, reject) => {
    const auth = getBearer(token);
    const header = auth ? { "Authorization": auth } : {};
    common_vendor.index.request({
      url,
      method: "POST",
      header,
      success: (res) => {
        let data = res == null ? void 0 : res.data;
        if (typeof data === "string") {
          try {
            data = JSON.parse(data);
          } catch (e) {
          }
        }
        if (res && res.statusCode >= 200 && res.statusCode < 300)
          resolve(data);
        else
          reject(res);
      },
      fail: (err) => reject(err)
    });
  });
}
function clearCart(options = {}) {
  const { body = {}, token } = options;
  const url = `${BASE_URL}/api/cart`;
  return new Promise((resolve, reject) => {
    const auth = getBearer(token);
    const header = auth ? { "Authorization": auth } : {};
    common_vendor.index.request({
      url,
      method: "POST",
      header,
      data: body,
      success: (res) => {
        let data = res == null ? void 0 : res.data;
        if (typeof data === "string") {
          try {
            data = JSON.parse(data);
          } catch (e) {
          }
        }
        if (res && res.statusCode >= 200 && res.statusCode < 300)
          resolve(data);
        else
          reject(res);
      },
      fail: (err) => reject(err)
    });
  });
}
exports.addAddress = addAddress;
exports.addCartItem = addCartItem;
exports.clearCart = clearCart;
exports.createRoom = createRoom;
exports.deleteAddress = deleteAddress;
exports.deleteCartItem = deleteCartItem;
exports.getAddresses = getAddresses;
exports.getCartItems = getCartItems;
exports.getProductDetail = getProductDetail;
exports.getProductSpecs = getProductSpecs;
exports.getRecommendedProducts = getRecommendedProducts;
exports.getRooms = getRooms;
exports.getUserProfile = getUserProfile;
exports.getVisibleCategories = getVisibleCategories;
exports.getVisibleProducts = getVisibleProducts;
exports.loginAdmin = loginAdmin;
exports.searchProducts = searchProducts;
exports.sendSecurityCode = sendSecurityCode;
exports.updateAddress = updateAddress;
exports.updateCartItem = updateCartItem;
exports.updateUserEmail = updateUserEmail;
exports.updateUserPhone = updateUserPhone;
exports.updateUserProfile = updateUserProfile;
