"use strict";
const common_vendor = require("../common/vendor.js");
function cacheProductPreview(product) {
  try {
    const normalized = normalizeProductPreview(product);
    if (!normalized.id)
      return;
    common_vendor.index.setStorageSync(getProductPreviewKey(normalized.id), {
      ...normalized,
      cached_at: Date.now()
    });
  } catch (e) {
  }
}
function getCachedProductPreview(productId) {
  try {
    const id = String(productId || "").trim();
    if (!id)
      return null;
    const cached = common_vendor.index.getStorageSync(getProductPreviewKey(id)) || null;
    if (!cached || typeof cached !== "object")
      return null;
    return normalizeProductPreview(cached);
  } catch (e) {
    return null;
  }
}
function getProductPreviewKey(productId) {
  return "product_preview_" + String(productId || "").trim();
}
function normalizeProductPreview(product) {
  const src = product || {};
  const id = String(src.id || src.available_product_id || "").trim();
  const image = normalizeImage(src.image || src.main_image || src.thumbnail);
  const title = String(src.title || src.name || "商品").trim() || "商品";
  const price = src.price === "-" || src.price === "—" ? "-" : Number(src.price ?? 0) || 0;
  const sales = Number(src.sales ?? src.order_count ?? 0) || 0;
  return {
    id,
    title,
    price,
    sales,
    image,
    images: image ? [image] : ["/static/logo.png"],
    details_images: [],
    main_media: image ? [image] : ["/static/logo.png"]
  };
}
function normalizeImage(value) {
  if (typeof value !== "string")
    return "/static/logo.png";
  const image = value.replace(/`/g, "").trim();
  return image || "/static/logo.png";
}
exports.cacheProductPreview = cacheProductPreview;
exports.getCachedProductPreview = getCachedProductPreview;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/product-preview.js.map
