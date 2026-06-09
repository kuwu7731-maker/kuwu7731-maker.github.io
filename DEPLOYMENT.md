# 实验中学论坛 - 部署与SEO优化指南

## 1. Cloudflare Pages 部署

### 1.1 前置条件
- Node.js >= 18.17.0
- npm 或 pnpm
- Cloudflare 账号

### 1.2 部署步骤

1. **安装依赖**
   ```bash
   pnpm install
   ```

2. **构建项目**
   ```bash
   pnpm build
   ```

3. **配置 Cloudflare Pages**
   - 登录 Cloudflare 控制台
   - 创建新的 Pages 项目
   - 连接 GitHub/GitLab 仓库
   - 配置构建命令: `pnpm build`
   - 配置构建输出目录: `.next`

4. **环境变量配置**
   在 Cloudflare Pages 项目设置中添加以下环境变量:
   - `DATABASE_URL` - PostgreSQL 数据库连接字符串
   - `REDIS_URL` - Redis 连接字符串
   - `NEXTAUTH_URL` - 域名地址 (如 https://your-domain.com)
   - `NEXTAUTH_SECRET` - NextAuth 密钥
   - `CAPTCHA_SECRET` - 滑块验证密钥

5. **设置自定义域名**
   - 添加自定义域名到 Cloudflare Pages
   - 配置 DNS 记录 (CNAME 或 A 记录)

## 2. Vercel 部署 (备选)

### 2.1 部署步骤

1. **安装 Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **部署项目**
   ```bash
   vercel
   ```

3. **环境变量配置**
   在 Vercel 项目设置中添加环境变量

## 3. 数据库配置

### 3.1 PostgreSQL
推荐使用以下服务之一:
- Cloudflare D1 (零配置)
- Supabase
- Neon
- AWS RDS

### 3.2 Redis
推荐使用以下服务之一:
- Upstash (Serverless Redis)
- Redis Labs
- AWS ElastiCache

### 3.3 数据库迁移
```bash
pnpm db:migrate
pnpm db:seed
```

## 4. SEO 优化指南

### 4.1 百度搜索引擎优化

1. **提交网站**
   - 访问 https://ziyuan.baidu.com
   - 注册并验证网站所有权
   - 提交站点地图: `https://your-domain.com/sitemap.xml`

2. **百度站长工具**
   - 配置网站信息
   - 监控爬取状态
   - 设置搜索展现形式

3. **Meta 标签优化**
   - 确保每个页面有独特的 title 和 description
   - 使用 H1-H6 合理的标题层级
   - 添加 Schema 结构化数据

### 4.2 必应搜索引擎优化

1. **提交网站**
   - 访问 https://www.bing.com/webmasters
   - 注册并验证网站
   - 提交站点地图

2. **配置 SEO 设置**
   - 设置网站区域和语言
   - 配置 URL 参数处理规则

### 4.3 通用 SEO 最佳实践

1. **站点地图**
   - 自动生成 sitemap.xml
   - 包含所有重要页面

2. **Robots.txt**
   - 禁止搜索引擎爬取敏感页面 (/admin, /api)
   - 引导搜索引擎爬取重要页面

3. **页面速度优化**
   - 启用 Next.js 静态生成
   - 配置图片优化
   - 使用 CDN 加速

4. **移动友好**
   - 响应式设计
   - 移动端优先

## 5. ICP 备案提醒

### 5.1 备案要求
根据中国法律法规，在中国大陆提供网站服务必须进行 ICP 备案。

### 5.2 备案流程

1. **准备材料**
   - 域名证书
   - 企业/学校营业执照
   - 负责人身份证明
   - 网站信息登记表

2. **提交备案申请**
   - 通过服务器提供商提交申请
   - 完成真实性核验
   - 等待审核 (通常 20-30 个工作日)

3. **备案通过后**
   - 获取备案号
   - 在网站底部添加备案信息
   - 配置 HTTPS

### 5.3 备案信息展示
在网站页脚添加备案号:
```html
<p>ICP备案号: 京ICP备XXXXXXXX号</p>
```

## 6. 安全配置

### 6.1 HTTPS
- 启用 Cloudflare SSL/TLS
- 配置强制 HTTPS

### 6.2 防火墙
- 配置 Cloudflare WAF
- 设置安全级别
- 启用 Bot 管理

### 6.3 内容安全策略 (CSP)
配置 CSP 头防止 XSS 和其他安全威胁

## 7. 监控与日志

### 7.1 Cloudflare Analytics
- 监控网站访问量
- 分析用户行为
- 跟踪性能指标

### 7.2 错误监控
- 配置 Sentry 或类似工具
- 监控运行时错误
- 设置告警通知

## 8. 备份与恢复

### 8.1 数据库备份
- 定期备份 PostgreSQL
- 配置自动备份策略

### 8.2 代码备份
- 使用 Git 版本控制
- 设置代码仓库保护

## 9. 运维检查清单

- [ ] 域名已注册并解析正确
- [ ] SSL 证书已配置
- [ ] 环境变量已设置
- [ ] 数据库连接正常
- [ ] Redis 缓存正常
- [ ] ICP 备案已完成
- [ ] 搜索引擎已提交
- [ ] 防火墙已配置
- [ ] 监控已设置
- [ ] 备份策略已配置