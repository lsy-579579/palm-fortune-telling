# 掌纹算命 🔮

基于 **uni-app + Vue3 + Vite + TypeScript** 的跨平台掌纹算命应用，一套代码同时编译到微信小程序和抖音小程序。

## 功能特性

- 🖐️ 三大主线解读：生命线、智慧线、感情线
- 📊 综合运势评分系统
- 🎨 中式玄学风格界面（紫金配色）
- 📱 跨平台：微信小程序 / 抖音小程序 / H5 / App

## 技术栈

| 技术 | 说明 |
|------|------|
| uni-app | 跨平台框架，一套代码多端发布 |
| Vue 3 | 前端框架（Composition API + `<script setup>`） |
| Vite | 构建工具 |
| TypeScript | 类型安全 |

## 支持平台

| 平台 | 构建命令 | 说明 |
|------|---------|------|
| 微信小程序 | `npm run dev:mp-weixin` | 需安装微信开发者工具 |
| 抖音小程序 | `npm run dev:mp-toutiao` | 需安装抖音开发者工具 |
| H5 | `npm run dev:h5` | 浏览器预览 |

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
# 微信小程序
npm run dev:mp-weixin
# 构建产物在 dist/dev/mp-weixin，用微信开发者工具导入该目录

# 抖音小程序
npm run dev:mp-toutiao
# 构建产物在 dist/dev/mp-toutiao，用抖音开发者工具导入该目录

# H5 预览
npm run dev:h5
```

### 生产构建

```bash
# 微信小程序
npm run build:mp-weixin

# 抖音小程序
npm run build:mp-toutiao
```

## 小程序发布配置

### 微信小程序

1. 在 [微信公众平台](https://mp.weixin.qq.com/) 注册小程序，获取 AppID
2. 将 AppID 填入 `src/manifest.json` 中 `mp-weixin.appid`
3. 运行 `npm run build:mp-weixin`
4. 用微信开发者工具导入 `dist/build/mp-weixin` 目录
5. 在开发者工具中点击「上传」提交审核

### 抖音小程序

1. 在 [抖音开放平台](https://developer.open-douyin.com/) 注册小程序，获取 AppID
2. 将 AppID 填入 `src/manifest.json` 中 `mp-toutiao.appid`
3. 运行 `npm run build:mp-toutiao`
4. 用抖音开发者工具导入 `dist/build/mp-toutiao` 目录
5. 在开发者工具中点击「上传」提交审核

## 项目结构

```
palm-fortune-uniapp/
├── src/
│   ├── pages/
│   │   ├── index/index.vue    # 欢迎页
│   │   ├── palm/palm.vue      # 掌纹选择页
│   │   └── result/result.vue  # 解读结果页
│   ├── store/
│   │   └── selection.ts       # 用户选择状态
│   ├── utils/
│   │   └── palmData.ts        # 掌纹解读数据
│   ├── App.vue                # 全局组件
│   ├── main.ts                # 入口文件
│   ├── manifest.json          # 应用配置（含小程序配置）
│   └── pages.json             # 页面路由配置
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 免责声明

本应用仅供娱乐参考，算命结果不代表真实预测。命运掌握在自己手中。🙏

## License

MIT
