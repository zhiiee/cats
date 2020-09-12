# 部署说明

本项目后端完全采用微信小程序云开发实现，需先开通微信小程序云开发后才可以使用，小程序云开发的介绍以及开通请参考[官方文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)

## 下载代码

```
git clone https://github.com/zhiiee/cats.git <your local directory>
```

## 修改小程序AppID

打开 `project.config.json` 文件，修改文件中的 `appid` 字段为自己的 `appid`

## 修改云开发环境ID

打开 `env-config.json` 文件，修改文件中的 `develop` 开发环境和 `release` 生产环境的 `云开发环境ID` 为自己对应的 `云开发环境ID`

## 启动或编译项目

安装依赖：
```
yarn
# OR
npm install
```

启动开发环境：
```
yarn dev:mp-weixin
# OR
npm run dev:mp-weixin
```

编译生产环境：
```
yarn build:mp-weixin
# OR
npm run build:mp-weixin
```

## 加载项目

打开 `微信开发者工具` 选择 `导入项目` ，开发环境启动后的项目文件夹为 `dist/dev/mp-weixin` ，生产环境编译后的项目文件夹为 `dist/build/mp-weixin` ，请按需导入

## 部署云函数

1. 在 `微信开发者工具中` 展开 `编辑器`，云函数的文件夹为 `cloudfunctions`，在资源管理器面板中右键点击该文件夹选择云开发的环境

2. 右键点击 `cloudfunctions` 文件夹，点击 `同步云函数列表`，将云开发的云函数列表和本地的云函数列表进行同步

3. 右键点击 `cloudfunctions\cloud` 文件夹，点击 `创建并部署：云端安装依赖（不上传 node_modules）`

4. 云函数部署完成后，点击 `微信开发者工具` 中的 `编译` 按钮，进行 `云函数` 的初次调用（这时云函数会自动初始化云数据库集合）

## 设置云函数的内存配置

本项目只用一个 `云函数` 完成所有接口，为了发挥 `云函数` 的最大性能，建议将内存设置到最大，设置步骤：
```
云开发控制台 -> 云函数 -> 云函数列表 -> 版本管理 -> 配置 -> 内存配置
```

修改为最大：1536MB

## 云开发权限设置

将 `数据库集合` [[官方文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/database/security-rules.html)] 的权限设置全部改为：
```
{
  "read": true,
  "write": true
}
```

将 `存储` [[官方文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/storage/security-rules.html)] 的权限设置全部改为：
```
{
  "read": true,
  "write": true
}
```

将 `云函数` [[官方文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/functions/security-rules.html)] 的权限设置为：
```
{
  "*": {
    "invoke": true
  }
}
```

Tips: 为方便本项目的跨平台性，建议将云开发环境的 `未登录用户访问权限` 进行开启，详见[官方文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/identityless.html)

## 初始化数据

将 `init` 文件夹内的 `articles.json`[文章]和 `categories.json`[分类] 两个文件导入到对应的 `数据库集合` 集合中即可
