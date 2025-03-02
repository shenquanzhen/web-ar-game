# Web AR 游戏阿里云ECS部署指南

本文档提供了将Web AR游戏部署到阿里云ECS（云服务器）的详细步骤，包括所有必要的命令行操作和配置说明。

## 前提条件

- 已购买并启动阿里云ECS实例
- 已配置好域名并完成SSL证书申请
- 已在本地完成项目开发
- 已安装SSH客户端（如OpenSSH）

## 1. 本地项目构建

在部署前，需要先在本地构建项目：

```bash
# 在本地项目根目录下执行
cd /Users/shenquanzhen/web-game

# 安装依赖
npm install

# 构建项目
npm run build
```

构建完成后，`dist` 目录中将包含所有需要部署的文件。

## 2. 连接到阿里云ECS服务器

使用SSH连接到您的ECS实例：

```bash
# 替换以下信息为您的实际信息
ssh username@your-ecs-instance-ip

# 例如
# ssh root@123.456.789.10
```

## 3. 在ECS上安装Nginx

连接到服务器后，安装并配置Nginx：

```bash
# 更新软件包列表
sudo apt update  # 如果是Ubuntu/Debian系统
# 或
sudo yum update  # 如果是CentOS/RHEL系统

# 安装Nginx
sudo apt install nginx  # 如果是Ubuntu/Debian系统
# 或
sudo yum install nginx  # 如果是CentOS/RHEL系统

# 启动Nginx并设置为开机自启
sudo systemctl start nginx
sudo systemctl enable nginx

# 检查Nginx状态
sudo systemctl status nginx
```

## 4. 配置Nginx服务器

创建Nginx配置文件：

```bash
# 创建站点配置文件
sudo nano /etc/nginx/sites-available/ar-game  # 如果是Ubuntu/Debian系统
# 或
sudo nano /etc/nginx/conf.d/ar-game.conf  # 如果是CentOS/RHEL系统
```

在编辑器中添加以下配置（替换域名为您的实际域名）：

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # 将HTTP请求重定向到HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name your-domain.com www.your-domain.com;
    
    # SSL证书配置
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    # SSL配置优化
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    ssl_stapling on;
    ssl_stapling_verify on;
    
    # 网站根目录
    root /var/www/ar-game;
    index index.html;
    
    # 配置缓存策略
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
    
    # 处理单页应用路由
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 安全相关头信息
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options SAMEORIGIN;
    add_header X-XSS-Protection "1; mode=block";
    
    # 允许摄像头和麦克风访问（对AR应用很重要）
    add_header Permissions-Policy "camera=*, microphone=*";
}
```

如果是Ubuntu/Debian系统，还需要创建符号链接：

```bash
sudo ln -s /etc/nginx/sites-available/ar-game /etc/nginx/sites-enabled/
```

## 5. 创建网站目录并设置权限

```bash
# 创建网站目录
sudo mkdir -p /var/www/ar-game

# 设置目录权限
sudo chown -R $USER:$USER /var/www/ar-game
sudo chmod -R 755 /var/www/ar-game
```

## 6. 上传项目文件到服务器

在本地计算机上，使用scp命令上传构建好的文件：

```bash
# 在本地项目目录执行
cd /Users/shenquanzhen/web-game

# 上传dist目录中的所有文件到服务器
scp -r dist/* username@your-ecs-instance-ip:/var/www/ar-game/

# 例如
# scp -r dist/* root@123.456.789.10:/var/www/ar-game/
```

## 7. 配置SSL证书

将您的SSL证书和私钥上传到服务器：

```bash
# 在本地执行，上传证书和私钥
scp your-certificate.crt username@your-ecs-instance-ip:/path/to/your/certificate.crt
scp your-private.key username@your-ecs-instance-ip:/path/to/your/private.key
```

确保Nginx配置文件中的证书路径与实际上传路径一致。

## 8. 检查Nginx配置并重启

在服务器上执行：

```bash
# 检查Nginx配置是否有语法错误
sudo nginx -t

# 如果配置正确，重启Nginx
sudo systemctl restart nginx
```

## 9. 配置防火墙

确保防火墙允许HTTP和HTTPS流量：

```bash
# 如果使用UFW（Ubuntu）
sudo ufw allow 'Nginx Full'

# 如果使用firewalld（CentOS）
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## 10. 测试部署

在浏览器中访问您的域名（https://your-domain.com）来测试部署是否成功。

## 11. 故障排除

如果遇到问题，可以查看Nginx错误日志：

```bash
sudo tail -f /var/log/nginx/error.log
```

## 12. 更新部署

当需要更新应用时，重复以下步骤：

1. 在本地构建项目：`npm run build`
2. 上传新的构建文件：`scp -r dist/* username@your-ecs-instance-ip:/var/www/ar-game/`

## 13. 性能优化建议

- 考虑使用CDN加速静态资源
- 配置适当的缓存策略
- 使用gzip压缩文本资源
- 定期监控服务器性能

## 14. 安全建议

- 定期更新服务器系统和软件包
- 配置防火墙，只开放必要端口
- 使用强密码和SSH密钥认证
- 考虑使用Let's Encrypt自动更新SSL证书
- 定期备份网站数据

## 15. 维护命令参考

```bash
# 重启Nginx
sudo systemctl restart nginx

# 查看Nginx状态
sudo systemctl status nginx

# 查看实时访问日志
sudo tail -f /var/log/nginx/access.log

# 查看错误日志
sudo tail -f /var/log/nginx/error.log
```

祝您部署顺利！如有任何问题，请参考阿里云官方文档或联系技术支持。