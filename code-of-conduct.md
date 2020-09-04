## 源码目录介绍
```
cloudfunctions                             // 云开发目录
│
└── cloud                                  // 唯一的一个云函数目录
    │
    ├──services                            // 业务逻辑存放目录
    │   │
    │   ├── base-service.js                // 基类(所有接口类都要继承这个类)
    │   │
    │   ├── categories-service.js          // 分类相关接口
    │   │
    │   └── users-service.js               // 用户相关接口
    │
    ├──config.json                         // 云函数配置
    │
    ├──index.js                            // 云函数入口
    │
    └──package.json

init                                       // 初始数据
│
└── categories.json                        // 分类初始数据

public
│
└── index.html

src
│
├── api                                    // 调用接口的服务都写在这个目录(按模块区分)
│   │
│   ├── base                               // 基类(所有接口服务类都要继承这个类)
│   │  │
│   │  └──index.ts
│   │
│   ├── categories                         // 分类相关接口
│   │  │
│   │  └──index.ts
│   │
│   ├── users                              // 用户相关接口
│   │  │
│   │  └──index.ts
│   │
│   └── index.ts                           // 用于导出模块
│
├── common                                 // 公共类都写在这个目录
│
├── components                             // 组件都写在这个目录
│   │
│   ├── loading
│   │  │
│   │  └──loading.vue                      // 加载组件
│   │
│   ├── navigation-bar
│   │  │
│   │  └──navigation-bar.vue               // 自定义nav-bar组件
│   │
│   ├── page-status
│   │  │
│   │  └──page-status.vue                  // 页面状态组件
│   │
│   └── tab-bar
│      │
│      └──tab-bar.vue                      // 头部tab-bar组件
│
├── mixins                                 // 一些混入的类都写在这个目录
│   │
│   └── share.tsx                          // 统一分享处理
│
├── pages                                  // 页面都写在这个目录(按页面区分)
│   │
│   ├── about
│   │  │
│   │  └──about.vue                        // 关于页面
│   │
│   ├── home
│   │  │
│   │  └──home.vue                         // 猫咪列表页面（主页）
│   │
│   ├── index
│   │  │
│   │  └──index.vue                        // 加载页面（首页）
│   │
│   └── science
│      │
│      └──science.vue                      // 科普页面
│
├── plugins                                // 第三方库都放到这里(按名称区分)
│
├── ststic                                 // 静态资源都放在这里(如图片)
│   │
│   └── images                             // 图片资源
│       │
│       ├── empty.svg                      // 空数据图标
│       │
│       └── error.svg                      // 错误图标
│
├── store
│   │
│   └── index.ts                           // Vuex相关配置
│
├── types
│   │
│   └── index.d.ts                         // types定义都写在这个里面
│
├── App.vue
│
├── main.scss                              // 全局样式表
│
├── main.ts                                // 入口文件
│
├── manifest.json                          // 各平台的相关配置
│
├── pages.json                             // 页面的相关配置(相当于路由)
│
├── shims-tsx.d.ts
│
├── shims-vue.d.ts
│
└── uni.scss                               // uni-app样式变量(所有的变量最好都定义在这里)

.editorconfig                              // 编辑器配置

.eslintignore                              // eslint过滤配置

.eslintrc.js                               // eslint配置

.gitignore                                 // git过滤配置

babel.config.js                            // babel配置

env-config.json                            // 环境变量配置(区分开发环境和生产环境)

package.json

postcss.config.js                          // postcss配置

tsconfig.json                              // typescript配置

vue.config.js                              // webpack配置
```