"use strict";
const common_vendor = require("../common/vendor.js");
const BASE_URL = "http://182.61.54.90:6149";
function getBearer(token) {
  if (token)
    return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  try {
    const expiration = common_vendor.index.getStorageSync("token_expiration") || 0;
    if (expiration && Date.now() > expiration) {
      common_vendor.index.removeStorageSync("user");
      common_vendor.index.removeStorageSync("token_expiration");
      return "";
    }
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
    let v = params[k];
    if (v === void 0 || v === null || v === "")
      return;
    if (k === "ids") {
      if (Array.isArray(v)) {
        const raw = "[" + v.map((x) => '"' + String(x) + '"').join(",") + "]";
        arr.push(k + "=" + raw);
        return;
      }
      if (typeof v === "string") {
        const raw = v.startsWith("[") ? v : "[" + v.split(",").map((s) => '"' + s.replace(/\[|\]|"/g, "").trim() + '"').join(",") + "]";
        arr.push(k + "=" + raw);
        return;
      }
    }
    if (typeof v === "object") {
      try {
        v = JSON.stringify(v);
      } catch (e) {
      }
    }
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
          let data = res == null ? void 0 : res.data;
          if (typeof data === "string") {
            try {
              data = JSON.parse(data);
            } catch (e) {
            }
          }
          const bizOk = !!(data && data.success === true);
          if (ok && bizOk) {
            resolve(data);
          } else {
            reject(data || res);
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
function getCarousel(options = {}) {
  const { token } = options;
  const url = `${BASE_URL}/api/carousel`;
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
    inventory,
    has_length,
    token
  } = options;
  const query = toQuery({ page, page_size, sort_by, sort_order, available_product_id, length, quantity, inventory, has_length });
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
  const { room_id, product_id, length, quantity, color, note, token } = options;
  const query = toQuery({ room_id, product_id, length, quantity, color, note });
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
function updateUserAvatar(options = {}) {
  const { filePath, file, token } = options;
  const url = `${BASE_URL}/api/user/avatar/update`;
  return new Promise((resolve, reject) => {
    const auth = getBearer(token);
    const header = auth ? { "Authorization": auth } : {};
    if (filePath && typeof common_vendor.index.uploadFile === "function") {
      common_vendor.index.uploadFile({
        url,
        filePath,
        name: "file",
        header,
        success: (res) => {
          let data = res == null ? void 0 : res.data;
          if (typeof data === "string") {
            try {
              data = JSON.parse(data);
            } catch (e) {
            }
          }
          resolve(data);
        },
        fail: (err) => reject(err)
      });
      return;
    }
    if (file && typeof FormData !== "undefined") {
      try {
        const formdata = new FormData();
        formdata.append("file", file);
        fetch(url, { method: "POST", headers: header, body: formdata }).then(async (resp) => {
          let text = await resp.text();
          try {
            text = JSON.parse(text);
          } catch (e) {
          }
          resolve(text);
        }).catch((err) => reject(err));
      } catch (e) {
        reject(e);
      }
      return;
    }
    reject(new Error("No file provided"));
  });
}
function addFavorite(options = {}) {
  const { product_id, token } = options;
  const query = toQuery({ product_id });
  const url = `${BASE_URL}/api/user/favorites${query ? `?${query}` : ""}`;
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
function deleteFavorite(options = {}) {
  const { product_id, token } = options;
  const query = toQuery({ product_id });
  const url = `${BASE_URL}/api/user/favorites/delete${query ? `?${query}` : ""}`;
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
function getFavorites(options = {}) {
  const { addresses_id, token } = options;
  const query = toQuery({ addresses_id });
  const url = `${BASE_URL}/api/user/favorites${query ? `?${query}` : ""}`;
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
function getPendingPaymentOrders(options = {}) {
  const { token } = options;
  const url = `${BASE_URL}/api/user/orders/pending_payment`;
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
function getPendingShipmentOrders(options = {}) {
  const { token } = options;
  const url = `${BASE_URL}/api/user/orders/pending_shipment`;
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
function getPendingReceiptOrders(options = {}) {
  const { token } = options;
  const url = `${BASE_URL}/api/user/orders/pending_receipt`;
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
function getHistoryOrders(options = {}) {
  const { token } = options;
  const url = `${BASE_URL}/api/user/orders/history`;
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
function getOrderDetail(options = {}) {
  const { order_id, token } = options;
  const query = toQuery({ order_id });
  const url = `${BASE_URL}/api/user/orders/detail${query ? `?${query}` : ""}`;
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
function confirmOrderReceipt(options = {}) {
  const { order_id, token } = options;
  const query = toQuery({ order_id });
  const url = `${BASE_URL}/api/user/orders/confirm_receipt${query ? `?${query}` : ""}`;
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
function createDirectOrder(options = {}) {
  const { product_id, address_id, note, length, quantity, room_id, token } = options;
  const query = toQuery({ product_id, address_id, note, length, quantity, room_id });
  const url = `${BASE_URL}/api/orders/create_direct${query ? `?${query}` : ""}`;
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
          reject(data || res);
      },
      fail: (err) => reject(err)
    });
  });
}
function createOrderByIds(options = {}) {
  const { ids, address_id, note, token } = options;
  const query = toQuery({ ids, address_id, note });
  const url = `${BASE_URL}/api/orders/create_by_ids${query ? `?${query}` : ""}`;
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
function cancelOrder(options = {}) {
  const { order_id, token } = options;
  const query = toQuery({ order_id });
  const url = `${BASE_URL}/api/orders/cancel${query ? `?${query}` : ""}`;
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
function getCartItemsByIDs(options = {}) {
  const { ids, token } = options;
  const query = toQuery({ ids });
  const url = `${BASE_URL}/api/cart/items/detail${query ? `?${query}` : ""}`;
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
function exportOrderExcel(options = {}) {
  const { order_id, token } = options;
  const query = toQuery({ order_id });
  const url = `${BASE_URL}/api/user/orders/export_pending_excel${query ? `?${query}` : ""}`;
  return new Promise((resolve, reject) => {
    const auth = getBearer(token);
    const header = auth ? { "Authorization": auth } : {};
    common_vendor.index.request({
      url,
      method: "GET",
      header,
      responseType: "arraybuffer",
      success: (res) => {
        const ok = res && res.statusCode >= 200 && res.statusCode < 300;
        if (!ok) {
          reject(res);
          return;
        }
        const ct = res && res.header && (res.header["content-type"] || res.header["Content-Type"]) || "";
        const cd = res && res.header && (res.header["content-disposition"] || res.header["Content-Disposition"]) || "";
        const isBinary = ct && (ct.includes("application") || ct.includes("octet-stream"));
        if (isBinary && res.data) {
          let filename = "";
          try {
            const m = cd && cd.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
            if (m)
              filename = decodeURIComponent(m[1] || m[2] || "");
          } catch (e) {
          }
          try {
            const blob = typeof Blob !== "undefined" ? new Blob([res.data], { type: ct || "application/octet-stream" }) : res.data;
            resolve({ success: true, blob, filename });
          } catch (e) {
            resolve({ success: true, data: res.data, filename });
          }
        } else {
          let data = res == null ? void 0 : res.data;
          if (typeof data === "string") {
            try {
              data = JSON.parse(data);
            } catch (e) {
            }
          }
          resolve(data);
        }
      },
      fail: (err) => reject(err)
    });
  });
}
exports.addAddress = addAddress;
exports.addCartItem = addCartItem;
exports.addFavorite = addFavorite;
exports.cancelOrder = cancelOrder;
exports.clearCart = clearCart;
exports.confirmOrderReceipt = confirmOrderReceipt;
exports.createDirectOrder = createDirectOrder;
exports.createOrderByIds = createOrderByIds;
exports.createRoom = createRoom;
exports.deleteAddress = deleteAddress;
exports.deleteCartItem = deleteCartItem;
exports.deleteFavorite = deleteFavorite;
exports.exportOrderExcel = exportOrderExcel;
exports.getAddresses = getAddresses;
exports.getCarousel = getCarousel;
exports.getCartItems = getCartItems;
exports.getCartItemsByIDs = getCartItemsByIDs;
exports.getFavorites = getFavorites;
exports.getHistoryOrders = getHistoryOrders;
exports.getOrderDetail = getOrderDetail;
exports.getPendingPaymentOrders = getPendingPaymentOrders;
exports.getPendingReceiptOrders = getPendingReceiptOrders;
exports.getPendingShipmentOrders = getPendingShipmentOrders;
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
exports.updateUserAvatar = updateUserAvatar;
exports.updateUserEmail = updateUserEmail;
exports.updateUserPhone = updateUserPhone;
exports.updateUserProfile = updateUserProfile;
