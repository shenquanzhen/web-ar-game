# Web AR 游戏 GitHub 和 Vercel 部署指南

本文档提供了将 Web AR 游戏部署到 GitHub 并通过 Vercel 进行公开部署的详细步骤。这种方法比直接使用阿里云 ECS 更简单，而且 Vercel 提供免费的 HTTPS 证书，非常适合 AR 应用的部署需求。

## 前提条件

- 已完成 Web AR 游戏的本地开发
- 拥有 GitHub 账号
- 拥有 Vercel 账号（可以使用 GitHub 账号直接注册）

## 1. 创建 GitHub 仓库

1. 登录到 GitHub 账号
2. 点击右上角的 '+' 图标，选择 'New repository'
3. 填写仓库名称，例如 'web-ar-game'
4. 选择仓库类型（公开或私有）
5. 不要初始化仓库，保持为空
6. 点击 'Create repository'

## 2. 推送本地项目到 GitHub

在本地项目目录下执行以下命令：

```bash
# 初始化 Git 仓库（如果还没有初始化）
git init

# 添加远程仓库
git remote add origin https://github.com/你的用户名/web-ar-game.git

# 添加所有文件到暂存区
git add .

# 提交更改
git commit -m "初始提交"

# 推送到 GitHub
git push -u origin main
```

## 3. 在 Vercel 上部署项目

1. 登录到 Vercel 账号（https://vercel.com/）
2. 点击 'New Project'
3. 在 'Import Git Repository' 部分，选择你刚刚创建的 GitHub 仓库
4. Vercel 会自动检测项目类型和构建设置，通常不需要更改
5. 点击 'Deploy'

Vercel 会自动构建和部署你的项目。部署完成后，你会看到一个成功消息和项目的 URL。

## 4. 自定义域名（可选）

1. 在 Vercel 仪表板中，选择你的项目
2. 点击 'Settings' > 'Domains'
3. 添加你的自定义域名
4. 按照 Vercel 的指示更新你的 DNS 记录

## 5. 更新和重新部署

每次你推送更改到 GitHub 仓库的主分支时，Vercel 都会自动重新构建和部署你的项目。

```bash
# 在本地进行更改后
git add .
git commit -m "更新描述"
git push
```

## 注意事项

1. Vercel 自动提供 HTTPS，这对于 AR.js 应用是必需的
2. 确保你的 `package.json` 文件中包含正确的构建脚本
3. 如果你的项目使用环境变量，可以在 Vercel 的项目设置中配置它们
4. Vercel 提供免费和付费计划，请查看他们的定价页面了解详情

通过这种方法，你可以轻松地将 Web AR 游戏部署到公网上，并享受 Vercel 提供的自动化部署和 HTTPS 支持。