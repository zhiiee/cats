# 贡献指南

如果有兴趣一起参与开发和维护本项目，可遵循此规范进行代码贡献

## 目录规范

源码的目录规范请参考 [源码目录介绍](https://github.com/zhiiee/cats/blob/master/code-of-conduct.md)

## 代码检查

统一走 `ESLint` 来约束，启动和提交代码时会对文件进行检查，确保无任何规则失败提示

## 分支规范

默认开发分支为 `develop` 分支，如果需要提 `PR`，则以此分支为基准。当 `develop` 分支稳定后会合入 `master` 分支

创建其他分支的命名规范：

```
feature/xxx：新特性分支
hotfix/xxx：bugfix 分支
```

合入流程：

其他分支 -> `develop` 分支 -> `master` 分支
