# LiShop 项目架构说明

## 概览

- 技术栈：uni-app + Vue（manifest 指定 vueVersion: 3），通过条件编译兼容 VUE2/VUE3 入口创建。
- 运行平台：H5 与微信小程序（mp-weixin）。
- 职责分层：
  - 页面层：位于 pages 目录，承载业务 UI 与流程。
  - 组件层：位于 components 目录，复用通用 UI/交互模块。
  - 数据访问层：位于 api/index.js，封装后端 HTTP 接口。
  - 应用入口与生命周期：App.vue、main.js。

## 目录结构

- 应用入口
  - [App.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/App.vue)
  - [main.js](file:///c:/Users/HP/Desktop/LiShop/LiShop/main.js)
- 配置与路由
  - [pages.json](file:///c:/Users/HP/Desktop/LiShop/LiShop/pages.json)
  - [manifest.json](file:///c:/Users/HP/Desktop/LiShop/LiShop/manifest.json)
- 数据访问
  - [api/index.js](file:///c:/Users/HP/Desktop/LiShop/LiShop/api/index.js)
- 组件库（节选）
  - [BannerSwiper.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/components/BannerSwiper.vue)
  - [CategoryGrid.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/components/CategoryGrid.vue)
  - [FloatingNav.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/components/FloatingNav.vue)
  - [LoginPrompt.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/components/LoginPrompt.vue)
  - [OnboardingGuide.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/components/OnboardingGuide.vue)
  - [ProductCard.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/components/ProductCard.vue)
  - [RoomSelector.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/components/RoomSelector.vue)
  - [SearchBar.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/components/SearchBar.vue)
  - [Skeleton.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/components/Skeleton.vue)
  - [IcpFooter.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/components/IcpFooter.vue)
- 页面模块（节选）
  - [home/index.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/pages/home/index.vue)
  - [product/index.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/pages/product/index.vue)
  - [category/index.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/pages/category/index.vue)
  - [category/list.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/pages/category/list.vue)
  - [cart/index.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/pages/cart/index.vue)
  - [profile/index.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/pages/profile/index.vue)
  - [search/index.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/pages/search/index.vue)
  - [login/index.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/pages/login/index.vue)
  - [order/index.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/pages/order/index.vue)
  - [favorites/index.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/pages/favorites/index.vue)
  - [address/index.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/pages/address/index.vue)
  - [address/edit.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/pages/address/edit.vue)
  - [announcement/index.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/pages/announcement/index.vue)
  - [settings/index.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/pages/settings/index.vue)
  - [messages/index.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/pages/messages/index.vue)
  - [webview/index.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/pages/webview/index.vue)

## 构建目标与条件编译

- 平台目标：
  - H5：构建产物位于 [unpackage/dist/build/web](file:///c:/Users/HP/Desktop/LiShop/LiShop/unpackage/dist/build/web)。
  - 微信小程序：构建产物位于 [unpackage/dist/dev/mp-weixin](file:///c:/Users/HP/Desktop/LiShop/LiShop/unpackage/dist/dev/mp-weixin)。
- 条件编译：
  - 使用 `#ifdef MP-WEIXIN` 与 `#ifdef H5` 控制不同平台的 UI/能力，例如地址选择器、地图/视频播放、分享等。
  - 入口层使用 `#ifndef VUE3 / #ifdef VUE3` 兼容不同 Vue 版本的应用创建方式（manifest 指定 Vue3）。

## 应用入口与生命周期

- 入口：在 [main.js](file:///c:/Users/HP/Desktop/LiShop/LiShop/main.js) 中创建应用，并为小程序注入统一的分享能力（分享标题、路径、封面图缓存）。
- 根模块：在 [App.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/App.vue) 中处理：
  - 登录态守卫：通过 `uni.addInterceptor` 拦截导航；未登录时仅允许访问白名单页面，并触发全局登录提示事件。
  - 分享场景处理：从分享打开时重定向到首页，避免落在不支持的深链页面。

## 路由与页面

- 路由声明：统一在 [pages.json](file:///c:/Users/HP/Desktop/LiShop/LiShop/pages.json) 配置页面路径、导航栏与分享配置。
- 主要页面职责：
  - 首页 [home/index.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/pages/home/index.vue)：加载轮播图、分类、推荐商品与公告，提供搜索与新手引导。
  - 商品详情 [product/index.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/pages/product/index.vue)：拉取详情与规格，支持加入购物车/下单；兼容 H5/小程序的房间与地址选择。
  - 分类页 [category/index.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/pages/category/index.vue)：左侧一级分类，右侧子分类入口；支持“待激活分类”快速定位。
  - 子分类列表 [category/list.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/pages/category/list.vue)：按父/子分类加载商品，支持分页。
  - 购物车 [cart/index.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/pages/cart/index.vue)：分房间分组，数量修改/删除/清空，选择房间/地址，创建订单/导出。
  - 个人中心 [profile/index.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/pages/profile/index.vue)：资料编辑、账号安全、地址管理、新手引导与公告弹窗。
  - 搜索结果 [search/index.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/pages/search/index.vue)：关键词/分类名搜索，分页与跳页。
  - 登录页 [login/index.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/pages/login/index.vue)：账号密码登录；成功后写入本地缓存并跳转首页。
  - 订单页 [order/index.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/pages/order/index.vue)：列表（按状态）与详情模式，展示物流与操作（确认、取消）。
  - 收藏页 [favorites/index.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/pages/favorites/index.vue)：登录态下加载收藏；未登录触发全局登录提示。
  - 地址列表/编辑 [address/index.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/pages/address/index.vue) / [address/edit.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/pages/address/edit.vue)：收货地址的展示与编辑。
  - 公告页 [announcement/index.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/pages/announcement/index.vue)：拉取并展示公告内容。
  - 设置页 [settings/index.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/pages/settings/index.vue)：设置入口的占位页面。
  - 消息页 [messages/index.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/pages/messages/index.vue)：展示本地缓存消息列表。
  - WebView 页 [webview/index.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/pages/webview/index.vue)：承载外部 H5 页面，通过路由参数传入并解码 URL。

## 组件层

- 轮播 [BannerSwiper.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/components/BannerSwiper.vue)：区分拖拽与点击，点击带 id 的入口跳转详情。
- 分类宫格 [CategoryGrid.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/components/CategoryGrid.vue)：展示分类入口，跳转分类页。
- 悬浮导航 [FloatingNav.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/components/FloatingNav.vue)：首页/购物车/客服/回到顶部；根据端与全局开关决定显示。
- 登录提示 [LoginPrompt.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/components/LoginPrompt.vue)：未登录时拦截关键操作，父组件处理跳转。
- 新手指引 [OnboardingGuide.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/components/OnboardingGuide.vue)：高亮目标区域并展示步骤文案。
- 商品卡片 [ProductCard.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/components/ProductCard.vue)：封面、标题、销量与价格展示，未登录显示提示文案。
- 房间/地址选择 [RoomSelector.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/components/RoomSelector.vue)：房间创建/滑动删除；地址模式支持表单创建/保存。
- 搜索栏 [SearchBar.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/components/SearchBar.vue)：v-model 同步输入值，触发搜索事件。
- 骨架屏 [Skeleton.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/components/Skeleton.vue)：加载占位，支持行数/标题/网格占位。
- ICP 备案 [IcpFooter.vue](file:///c:/Users/HP/Desktop/LiShop/LiShop/components/IcpFooter.vue)：备案信息链接展示。

## 数据访问层（API）

- 位置：[api/index.js](file:///c:/Users/HP/Desktop/LiShop/LiShop/api/index.js)
- 设计要点：
  - BASE_URL 统一配置；`getBearer` 从本地缓存读取 token 并处理过期逻辑。
  - `toQuery` 统一处理查询参数（含对象/数组/字符串数组）。
  - 所有接口使用 `uni.request`，Promise 化返回值，统一解析 `res.data`。
- 功能覆盖：登录、轮播、推荐与可见商品/分类、商品详情与规格、房间 CRUD、购物车 CRUD、订单查询与导出、收藏、地址查询/新增/编辑等。

## 状态管理与本地存储

- 不使用全局状态库（如 Vuex/Pinia），以组件状态 + 本地存储为主。
- 本地存储键（示例）：`user`、`token_expiration`、`cart`、`share_image_url`、`onboarding_*`、`just_logged_in` 等。
- 登录守卫：在入口层拦截导航，判断是否已登录或目标是否在白名单。

## 跨端与能力差异

- 条件编译覆盖：地址选择器（region vs multiSelector）、地图/视频组件能力、页面背景与布局、分享菜单显示等。
- H5 辅助预览页面：[preview/index.html](file:///c:/Users/HP/Desktop/LiShop/LiShop/preview/index.html)。

## 错误处理与健壮性

- 统一使用 `try/catch` 与 `uni.showToast` 提示。
- 数据解析使用类型判断与兜底（例如字符串 JSON 解析、数组判空）。
- 资源容错：视频播放失败回退到图片、空图/空链接回退 logo 等。

## 安全与合规

- Token 过期处理：读取 `token_expiration` 并在过期后清理用户信息。
- 导航守卫避免未登录访问敏感页面。
- 不在仓库中存储敏感密钥；仅使用公开 BASE_URL。
- ICP 备案信息展示组件用于 H5 场景。

## 构建与产物

- 小程序产物：`unpackage/dist/dev/mp-weixin` 与 `unpackage/dist/build/mp-weixin`（存在对应编译输出）。
- H5 产物：`unpackage/dist/build/web`。
- Sourcemap：位于 `unpackage/dist/dev/.sourcemap`，便于定位编译后代码。

## 开发约定与路径

- 别名约定：`@` 用于项目根路径的组件导入。
- 代码风格：Vue 单文件组件（SFC），内联条件编译控制平台差异。
- 路由与分享配置统一在 `pages.json`。
