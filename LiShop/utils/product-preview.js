/**
 * 商品详情预览缓存工具。
 * @description
 * 在列表页进入商品详情前，将卡片上的轻量信息写入本地缓存，帮助详情页在网络较慢时先渲染首屏占位内容。
 * @param {Object} product 商品卡片数据
 * @returns {void}
 * @throws {never} 内部已兜底吞掉缓存异常
 * @example
 * cacheProductPreview({ id: '1001', title: '灯带', image: 'https://example.com/a.jpg', price: 99 })
 */
export function cacheProductPreview(product) {
  try {
    const normalized = normalizeProductPreview(product)
    if (!normalized.id) return
    uni.setStorageSync(getProductPreviewKey(normalized.id), {
      ...normalized,
      cached_at: Date.now()
    })
  } catch (e) {}
}

/**
 * 读取商品详情预览缓存。
 * @description
 * 详情页首屏加载时优先读取预览缓存，避免新标签页在接口返回前长时间空白。
 * @param {string|number} productId 商品 ID
 * @returns {Object|null} 轻量预览数据，找不到时返回 null
 * @throws {never} 内部已兜底吞掉缓存异常
 * @example
 * const preview = getCachedProductPreview('1001')
 */
export function getCachedProductPreview(productId) {
  try {
    const id = String(productId || '').trim()
    if (!id) return null
    const cached = uni.getStorageSync(getProductPreviewKey(id)) || null
    if (!cached || typeof cached !== 'object') return null
    return normalizeProductPreview(cached)
  } catch (e) {
    return null
  }
}

/**
 * 生成商品详情预览缓存键。
 * @description
 * 为每个商品构造独立缓存键，避免不同商品之间的数据互相污染。
 * @param {string|number} productId 商品 ID
 * @returns {string} 缓存键
 * @example
 * const key = getProductPreviewKey('1001')
 */
export function getProductPreviewKey(productId) {
  return 'product_preview_' + String(productId || '').trim()
}

/**
 * 归一化商品轻量预览数据。
 * @description
 * 统一提取详情页首屏需要的标题、封面、价格等字段，保证不同列表来源都能复用。
 * @param {Object} product 原始商品对象
 * @returns {{id:string,title:string,price:number|string,sales:number,image:string,images:string[],details_images:string[],main_media:string[]}}
 * @example
 * const preview = normalizeProductPreview(rawProduct)
 */
export function normalizeProductPreview(product) {
  const src = product || {}
  const id = String(src.id || src.available_product_id || '').trim()
  const image = normalizeImage(src.image || src.main_image || src.thumbnail)
  const title = String(src.title || src.name || '商品').trim() || '商品'
  const price = (src.price === '-' || src.price === '—') ? '-' : (Number(src.price ?? 0) || 0)
  const sales = Number(src.sales ?? src.order_count ?? 0) || 0
  return {
    id,
    title,
    price,
    sales,
    image,
    images: image ? [image] : ['/static/logo.png'],
    details_images: [],
    main_media: image ? [image] : ['/static/logo.png']
  }
}

/**
 * 规范化图片地址。
 * @description
 * 去除无效空白与反引号，确保详情页首屏可直接使用。
 * @param {string} value 原始图片地址
 * @returns {string} 清洗后的图片地址
 * @example
 * const image = normalizeImage(' `https://example.com/a.jpg` ')
 */
function normalizeImage(value) {
  if (typeof value !== 'string') return '/static/logo.png'
  const image = value.replace(/`/g, '').trim()
  return image || '/static/logo.png'
}
