const BASE_URL = 'http://182.61.54.90:6149'

function getBearer(token) {
  if (token) return token.startsWith('Bearer ') ? token : `Bearer ${token}`
  try {
    const u = uni.getStorageSync('user') || null
    const t = (u && (u.token || (u.data && u.data.token))) || ''
    if (t) return t.startsWith('Bearer ') ? t : `Bearer ${t}`
  } catch (e) { }
  return ''
}

function toQuery(params) {
  const arr = []
  Object.keys(params || {}).forEach((k) => {
    const v = params[k]
    if (v === undefined || v === null || v === '') return
    arr.push(encodeURIComponent(k) + '=' + encodeURIComponent(v))
  })
  return arr.join('&')
}

/**
 * 用户登录
 * @param {{ phone: string, password: string }} payload
 * @returns {Promise<any>}
 */
export function loginAdmin(payload) {
  return new Promise((resolve, reject) => {
    try {
      uni.request({
        url: `${BASE_URL}/api/auth/login/user`,
        method: 'POST',
        header: { 'Content-Type': 'application/json' },
        data: payload,
        success: (res) => {
          const ok = res && res.statusCode >= 200 && res.statusCode < 300
          if (ok) {
            resolve(res.data)
          } else {
            reject(res)
          }
        },
        fail: (err) => reject(err)
      })
    } catch (e) {
      reject(e)
    }
  })
}

/**
 * 获取用户首页推荐商品
 * GET /api/products/recommended
 */
export function getRecommendedProducts(options = {}) {
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
  } = options

  const query = toQuery({ page, page_size, sort_by, sort_order, available_product_id, length, quantity, color_temperature })
  const url = `${BASE_URL}/api/products/recommended${query ? `?${query}` : ''}`

  return new Promise((resolve, reject) => {
    const auth = getBearer(token)
    const header = auth ? { 'Authorization': auth } : {}
    uni.request({
      url,
      method: 'GET',
      header,
      success: (res) => {
        let data = res?.data
        if (typeof data === 'string') { try { data = JSON.parse(data) } catch (e) { } }
        if (res && res.statusCode >= 200 && res.statusCode < 300) resolve(data)
        else reject(res)
      },
      fail: (err) => reject(err)
    })
  })
}

/**
 * 获取用户可见分类
 * GET /api/products/categories
 */
export function getVisibleCategories(options = {}) {
  const { page = 1, page_size = 20, sort_by = 'id', sort_order, categories_id, token } = options
  const query = toQuery({ page, page_size, sort_by, sort_order, categories_id })
  const url = `${BASE_URL}/api/products/categories${query ? `?${query}` : ''}`

  return new Promise((resolve, reject) => {
    const auth2 = getBearer(token)
    const header2 = auth2 ? { 'Authorization': auth2 } : {}
    uni.request({
      url,
      method: 'GET',
      header: header2,
      success: (res) => {
        let data = res?.data
        if (typeof data === 'string') { try { data = JSON.parse(data) } catch (e) { } }
        if (res && res.statusCode >= 200 && res.statusCode < 300) resolve(data)
        else reject(res)
      },
      fail: (err) => reject(err)
    })
  })
}

/**
 * 用户搜索商品
 * GET /api/products/search
 * @param {Object} options { user_input: string, page?: number, page_size?: number, sort_by?: string, sort_order?: string, available_product_id?: string, length?: number, quantity?: number, color_temperature?: string, token?: string }
 * @returns {Promise<any>}
 */
export function searchProducts(options = {}) {
  const {
    user_input = '',
    page = 1,
    page_size = 20,
    sort_by,
    sort_order,
    available_product_id,
    length,
    quantity,
    color_temperature,
    token
  } = options

  const query = toQuery({ user_input, page, page_size, sort_by, sort_order, available_product_id, length, quantity, color_temperature })
  const url = `${BASE_URL}/api/products/search${query ? `?${query}` : ''}`

  return new Promise((resolve, reject) => {
    const auth = getBearer(token)
    const header = auth ? { 'Authorization': auth } : {}
    uni.request({
      url,
      method: 'GET',
      header,
      success: (res) => {
        let data = res?.data
        if (typeof data === 'string') { try { data = JSON.parse(data) } catch (e) { } }
        if (res && res.statusCode >= 200 && res.statusCode < 300) resolve(data)
        else reject(res)
      },
      fail: (err) => reject(err)
    })
  })
}

/**
 * 用户可见在售产品（按分类）
 * GET /api/products
 * @param {Object} options { page?: number, page_size?: number, sort_by?: string, sort_order?: string, category_id: string, token?: string }
 * @returns {Promise<any>}
 */
export function getVisibleProducts(options = {}) {
  const {
    page = 1,
    page_size = 40,
    sort_by = 'id',
    sort_order,
    category_id,
    token
  } = options

  const query = toQuery({ page, page_size, sort_by, sort_order, category_id })
  const url = `${BASE_URL}/api/products${query ? `?${query}` : ''}`

  return new Promise((resolve, reject) => {
    const auth = getBearer(token)
    const header = auth ? { 'Authorization': auth } : {}
    uni.request({
      url,
      method: 'GET',
      header,
      success: (res) => {
        let data = res?.data
        if (typeof data === 'string') { try { data = JSON.parse(data) } catch (e) { } }
        if (res && res.statusCode >= 200 && res.statusCode < 300) resolve(data)
        else reject(res)
      },
      fail: (err) => reject(err)
    })
  })
}

/**
 * 获取在售产品详情
 * GET /api/products/detail
 * @param {Object} options { available_product_id: string, token?: string }
 * @returns {Promise<any>}
 */
export function getProductDetail(options = {}) {
  const { available_product_id, token } = options
  const query = toQuery({ available_product_id })
  const url = `${BASE_URL}/api/products/detail${query ? `?${query}` : ''}`

  return new Promise((resolve, reject) => {
    const auth = getBearer(token)
    const header = auth ? { 'Authorization': auth } : {}
    uni.request({
      url,
      method: 'GET',
      header,
      success: (res) => {
        let data = res?.data
        if (typeof data === 'string') { try { data = JSON.parse(data) } catch (e) { } }
        if (res && res.statusCode >= 200 && res.statusCode < 300) resolve(data)
        else reject(res)
      },
      fail: (err) => reject(err)
    })
  })
}

/**
 * 用户可见在售产品 - 获取明细规格
 * GET /api/products/get
 * @param {Object} options { page?: number, page_size?: number, sort_by?: string, sort_order?: string, available_product_id?: string, length?: number, quantity?: number, color_temperature?: string, token?: string }
 * @returns {Promise<any>}
 */
export function getProductSpecs(options = {}) {
  const {
    page = 1,
    page_size = 20,
    sort_by = 'id',
    sort_order,
    available_product_id,
    length,
    quantity,
    color_temperature,
    token
  } = options

  const query = toQuery({ page, page_size, sort_by, sort_order, available_product_id, length, quantity, color_temperature })
  const url = `${BASE_URL}/api/products/get${query ? `?${query}` : ''}`

  return new Promise((resolve, reject) => {
    const auth = getBearer(token)
    const header = auth ? { 'Authorization': auth } : {}
    uni.request({
      url,
      method: 'GET',
      header,
      success: (res) => {
        let data = res?.data
        if (typeof data === 'string') { try { data = JSON.parse(data) } catch (e) { } }
        if (res && res.statusCode >= 200 && res.statusCode < 300) resolve(data)
        else reject(res)
      },
      fail: (err) => reject(err)
    })
  })
}

/**
 * 用户创建房间
 * POST /api/rooms?name=xxx
 * @param {Object} options { name: string, body?: any, token?: string }
 */
export function createRoom(options = {}) {
  const { name, body = { name }, token } = options
  const query = toQuery({ name })
  const url = `${BASE_URL}/api/rooms${query ? `?${query}` : ''}`

  return new Promise((resolve, reject) => {
    const auth = getBearer(token)
    const header = { 'Content-Type': 'application/json', ...(auth ? { 'Authorization': auth } : {}) }
    uni.request({
      url,
      method: 'POST',
      header,
      data: body,
      success: (res) => {
        let data = res?.data
        if (typeof data === 'string') { try { data = JSON.parse(data) } catch (e) { } }
        if (res && res.statusCode >= 200 && res.statusCode < 300) resolve(data)
        else reject(res)
      },
      fail: (err) => reject(err)
    })
  })
}

/**
 * 用户更新房间信息
 * POST /api/rooms/update?name=xxx&room_id=yyy
 * @param {Object} options { room_id: string, name: string, body?: any, token?: string }
 */
export function updateRoom(options = {}) {
  const { room_id, name, body = { name }, token } = options
  const query = toQuery({ name, room_id })
  const url = `${BASE_URL}/api/rooms/update${query ? `?${query}` : ''}`

  return new Promise((resolve, reject) => {
    const auth = getBearer(token)
    const header = { 'Content-Type': 'application/json', ...(auth ? { 'Authorization': auth } : {}) }
    uni.request({
      url,
      method: 'POST',
      header,
      data: body,
      success: (res) => {
        let data = res?.data
        if (typeof data === 'string') { try { data = JSON.parse(data) } catch (e) { } }
        if (res && res.statusCode >= 200 && res.statusCode < 300) resolve(data)
        else reject(res)
      },
      fail: (err) => reject(err)
    })
  })
}

/**
 * 用户删除房间
 * POST /api/rooms/delete?room_id=xxx
 * @param {Object} options { room_id: string, name?: string, body?: any, token?: string }
 */
export function deleteRoom(options = {}) {
  const { room_id, name, body = (name ? { name } : {}), token } = options
  const query = toQuery({ room_id })
  const url = `${BASE_URL}/api/rooms/delete${query ? `?${query}` : ''}`

  return new Promise((resolve, reject) => {
    const auth = getBearer(token)
    const header = { 'Content-Type': 'application/json', ...(auth ? { 'Authorization': auth } : {}) }
    uni.request({
      url,
      method: 'POST',
      header,
      data: body,
      success: (res) => {
        let data = res?.data
        if (typeof data === 'string') { try { data = JSON.parse(data) } catch (e) { } }
        if (res && res.statusCode >= 200 && res.statusCode < 300) resolve(data)
        else reject(res)
      },
      fail: (err) => reject(err)
    })
  })
}

/**
 * 获取当前房间列表
 * GET /api/rooms
 * @param {Object} options { token?: string }
 */
export function getRooms(options = {}) {
  const { token } = options
  const url = `${BASE_URL}/api/rooms`

  return new Promise((resolve, reject) => {
    const auth = getBearer(token)
    const header = auth ? { 'Authorization': auth } : {}
    uni.request({
      url,
      method: 'GET',
      header,
      success: (res) => {
        let data = res?.data
        if (typeof data === 'string') { try { data = JSON.parse(data) } catch (e) { } }
        if (res && res.statusCode >= 200 && res.statusCode < 300) resolve(data)
        else reject(res)
      },
      fail: (err) => reject(err)
    })
  })
}

/**
 * 将商品加入购物车
 * POST /api/cart/items?room_id=...&product_id=...&length=...&quantity=...&color=...&note=...
 * @param {Object} options { room_id: string, room_name?: string, product_id: string, length?: number, quantity?: number, color?: string, note?: string, token?: string }
 */
export function addCartItem(options = {}) {
  const { room_id, room_name, product_id, length, quantity, color, note, token } = options
  const query = toQuery({ room_id, room_name, product_id, length, quantity, color, note })
  const url = `${BASE_URL}/api/cart/items${query ? `?${query}` : ''}`

  return new Promise((resolve, reject) => {
    const auth = getBearer(token)
    const header = auth ? { 'Authorization': auth } : {}
    uni.request({
      url,
      method: 'POST',
      header,
      success: (res) => {
        let data = res?.data
        if (typeof data === 'string') { try { data = JSON.parse(data) } catch (e) { } }
        if (res && res.statusCode >= 200 && res.statusCode < 300) resolve(data)
        else reject(res)
      },
      fail: (err) => reject(err)
    })
  })
}

export function getCartItems(options = {}) {
  const { token } = options
  const url = `${BASE_URL}/api/cart/items`

  return new Promise((resolve, reject) => {
    const auth = getBearer(token)
    const header = auth ? { 'Authorization': auth } : {}
    uni.request({
      url,
      method: 'GET',
      header,
      success: (res) => {
        let data = res?.data
        if (typeof data === 'string') { try { data = JSON.parse(data) } catch (e) { } }
        if (res && res.statusCode >= 200 && res.statusCode < 300) resolve(data)
        else reject(res)
      },
      fail: (err) => reject(err)
    })
  })
}

export function deleteCartItem(options = {}) {
  const { id, body = {}, token } = options
  const query = toQuery({ id })
  const url = `${BASE_URL}/api/cart/items/delete${query ? `?${query}` : ''}`

  return new Promise((resolve, reject) => {
    const auth = getBearer(token)
    const header = { 'Content-Type': 'application/json', ...(auth ? { 'Authorization': auth } : {}) }
    uni.request({
      url,
      method: 'POST',
      header,
      data: body,
      success: (res) => {
        let data = res?.data
        if (typeof data === 'string') { try { data = JSON.parse(data) } catch (e) { } }
        if (res && res.statusCode >= 200 && res.statusCode < 300) resolve(data)
        else reject(res)
      },
      fail: (err) => reject(err)
    })
  })
}

export function updateCartItem(options = {}) {
  const { id, room_id, product_id, length, quantity, color, note, token } = options
  const query = toQuery({ id, room_id, product_id, length, quantity, color, note })
  const url = `${BASE_URL}/api/cart/items/update${query ? `?${query}` : ''}`

  return new Promise((resolve, reject) => {
    const auth = getBearer(token)
    const header = auth ? { 'Authorization': auth } : {}
    uni.request({
      url,
      method: 'POST',
      header,
      success: (res) => {
        let data = res?.data
        if (typeof data === 'string') { try { data = JSON.parse(data) } catch (e) { } }
        if (res && res.statusCode >= 200 && res.statusCode < 300) resolve(data)
        else reject(res)
      },
      fail: (err) => reject(err)
    })
  })
}

export function getUserProfile(options = {}) {
  const { token } = options
  const url = `${BASE_URL}/api/user/profile`

  return new Promise((resolve, reject) => {
    const auth = getBearer(token)
    const header = auth ? { 'Authorization': auth } : {}
    uni.request({
      url,
      method: 'GET',
      header,
      success: (res) => {
        let data = res?.data
        if (typeof data === 'string') { try { data = JSON.parse(data) } catch (e) { } }
        if (res && res.statusCode >= 200 && res.statusCode < 300) resolve(data)
        else reject(res)
      },
      fail: (err) => reject(err)
    })
  })
}

export function updateUserProfile(options = {}) {
  const { username, phone, region, contact_name, token } = options
  const query = toQuery({ username, phone, region, contact_name })
  const url = `${BASE_URL}/api/user/profile${query ? `?${query}` : ''}`

  return new Promise((resolve, reject) => {
    const auth = getBearer(token)
    const header = auth ? { 'Authorization': auth } : {}
    uni.request({
      url,
      method: 'POST',
      header,
      success: (res) => {
        let data = res?.data
        if (typeof data === 'string') { try { data = JSON.parse(data) } catch (e) { } }
        if (res && res.statusCode >= 200 && res.statusCode < 300) resolve(data)
        else reject(res)
      },
      fail: (err) => reject(err)
    })
  })
}

export function sendSecurityCode(options = {}) {
  const { token } = options
  const url = `${BASE_URL}/api/user/security/code/send`
  return new Promise((resolve, reject) => {
    const auth = getBearer(token)
    const header = auth ? { 'Authorization': auth } : {}
    uni.request({
      url,
      method: 'POST',
      header,
      success: (res) => {
        let data = res?.data
        if (typeof data === 'string') { try { data = JSON.parse(data) } catch (e) { } }
        if (res && res.statusCode >= 200 && res.statusCode < 300) resolve(data)
        else reject(res)
      },
      fail: (err) => reject(err)
    })
  })
}

export function updateUserPhone(options = {}) {
  const { new_phone, code, token } = options
  const query = toQuery({ new_phone, code })
  const url = `${BASE_URL}/api/user/security/phone/update${query ? `?${query}` : ''}`
  return new Promise((resolve, reject) => {
    const auth = getBearer(token)
    const header = auth ? { 'Authorization': auth } : {}
    uni.request({
      url,
      method: 'POST',
      header,
      success: (res) => {
        let data = res?.data
        if (typeof data === 'string') { try { data = JSON.parse(data) } catch (e) { } }
        if (res && res.statusCode >= 200 && res.statusCode < 300) resolve(data)
        else reject(res)
      },
      fail: (err) => reject(err)
    })
  })
}

export function updateUserEmail(options = {}) {
  const { new_email, code, token } = options
  const query = toQuery({ new_email, code })
  const url = `${BASE_URL}/api/user/security/email/update${query ? `?${query}` : ''}`
  return new Promise((resolve, reject) => {
    const auth = getBearer(token)
    const header = auth ? { 'Authorization': auth } : {}
    uni.request({
      url,
      method: 'POST',
      header,
      success: (res) => {
        let data = res?.data
        if (typeof data === 'string') { try { data = JSON.parse(data) } catch (e) { } }
        if (res && res.statusCode >= 200 && res.statusCode < 300) resolve(data)
        else reject(res)
      },
      fail: (err) => reject(err)
    })
  })
}

/**
 * 获取收货地址列表 / 单个地址
 * GET /api/user/addresses
 * @param {Object} options { addresses_id?: string, token?: string }
 */
export function getAddresses(options = {}) {
  const { addresses_id, token } = options
  const query = toQuery({ addresses_id })
  const url = `${BASE_URL}/api/user/addresses${query ? `?${query}` : ''}`

  return new Promise((resolve, reject) => {
    const auth = getBearer(token)
    const header = auth ? { 'Authorization': auth } : {}
    uni.request({
      url,
      method: 'GET',
      header,
      success: (res) => {
        let data = res?.data
        if (typeof data === 'string') { try { data = JSON.parse(data) } catch (e) { } }
        if (res && res.statusCode >= 200 && res.statusCode < 300) resolve(data)
        else reject(res)
      },
      fail: (err) => reject(err)
    })
  })
}

/**
 * 删除收货地址
 * POST /api/user/addresses/delete
 * @param {Object} options { addresses_id: string, token?: string }
 */
export function deleteAddress(options = {}) {
  const { addresses_id, token } = options
  const query = toQuery({ addresses_id })
  const url = `${BASE_URL}/api/user/addresses/delete${query ? `?${query}` : ''}`

  return new Promise((resolve, reject) => {
    const auth = getBearer(token)
    const header = auth ? { 'Authorization': auth } : {}
    uni.request({
      url,
      method: 'POST',
      header,
      success: (res) => {
        let data = res?.data
        if (typeof data === 'string') { try { data = JSON.parse(data) } catch (e) { } }
        if (res && res.statusCode >= 200 && res.statusCode < 300) resolve(data)
        else reject(res)
      },
      fail: (err) => reject(err)
    })
  })
}

/**
 * 新增收货地址
 * POST /api/user/addresses
 * @param {Object} options { receiver, phone, province, city, district, detail_address, is_default, token }
 */
export function addAddress(options = {}) {
  const { receiver, phone, province, city, district, detail_address, is_default, token } = options
  const query = toQuery({ receiver, phone, province, city, district, detail_address, is_default })
  const url = `${BASE_URL}/api/user/addresses${query ? `?${query}` : ''}`

  return new Promise((resolve, reject) => {
    const auth = getBearer(token)
    const header = auth ? { 'Authorization': auth } : {}
    uni.request({
      url,
      method: 'POST',
      header,
      success: (res) => {
        let data = res?.data
        if (typeof data === 'string') { try { data = JSON.parse(data) } catch (e) { } }
        if (res && res.statusCode >= 200 && res.statusCode < 300) resolve(data)
        else reject(res)
      },
      fail: (err) => reject(err)
    })
  })
}

/**
 * 更新收货地址
 * POST /api/user/addresses/update
 * @param {Object} options { receiver, phone, province, city, district, detail_address, is_default, addresses_id, token }
 */
export function updateAddress(options = {}) {
  const { receiver, phone, province, city, district, detail_address, is_default, addresses_id, token } = options
  const query = toQuery({ receiver, phone, province, city, district, detail_address, is_default, addresses_id })
  const url = `${BASE_URL}/api/user/addresses/update${query ? `?${query}` : ''}`

  return new Promise((resolve, reject) => {
    const auth = getBearer(token)
    const header = auth ? { 'Authorization': auth } : {}
    uni.request({
      url,
      method: 'POST',
      header,
      success: (res) => {
        let data = res?.data
        if (typeof data === 'string') { try { data = JSON.parse(data) } catch (e) { } }
        if (res && res.statusCode >= 200 && res.statusCode < 300) resolve(data)
        else reject(res)
      },
      fail: (err) => reject(err)
    })
  })
}

export function clearCart(options = {}) {
  const { body = {}, token } = options
  const url = `${BASE_URL}/api/cart`

  return new Promise((resolve, reject) => {
    const auth = getBearer(token)
    const header = auth ? { 'Authorization': auth } : {}
    uni.request({
      url,
      method: 'POST',
      header,
      data: body,
      success: (res) => {
        let data = res?.data
        if (typeof data === 'string') { try { data = JSON.parse(data) } catch (e) { } }
        if (res && res.statusCode >= 200 && res.statusCode < 300) resolve(data)
        else reject(res)
      },
      fail: (err) => reject(err)
    })
  })
}

export default { loginAdmin, getRecommendedProducts, getVisibleCategories, searchProducts, getVisibleProducts, getProductDetail, getProductSpecs, createRoom, updateRoom, deleteRoom, getRooms, addCartItem, getCartItems, deleteCartItem, clearCart, updateCartItem, getUserProfile, updateUserProfile, sendSecurityCode, updateUserPhone, updateUserEmail, getAddresses, deleteAddress, addAddress, updateAddress }

