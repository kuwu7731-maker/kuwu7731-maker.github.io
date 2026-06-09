# 实验中学论坛 - 整合使用文档

## 项目概览

实验中学论坛是一个面向七至九年级师生的高颜值、高安全性校园论坛，融合 Apple Liquid Glass 液态玻璃质感与 Google Gemini 活力渐变配色。

### 核心特性

- **液态玻璃美学**: 全局 backdrop-filter: blur(16px)、半透明边框、微光折射效果
- **Gemini 色彩体系**: 深空灰/纯白玻璃底色，动态渐变 (#00E5FF → #2979FF → #D500F9)
- **敏感词识别系统**: 基于 DFA 算法 + 拼音变体识别 + 零宽字符过滤
- **三级权限管理**: 学生(发帖/评论)、教师(发帖/置顶/加精)、管理员(全部权限)
- **三大年级板块**: 七年级·启航、八年级·深耕、九年级·冲刺

---

## 目录结构

```
├── prisma/                    # 数据库配置
│   ├── schema.prisma          # Prisma 数据模型
│   └── seed.ts                # 数据库初始化脚本
├── scripts/                   # 工具脚本
│   └── download-sensitivity-words.ts  # 敏感词库下载与清洗
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── admin/             # 管理后台
│   │   │   ├── page.tsx       # 数据看板
│   │   │   └── sensitive-words/
│   │   │       └── page.tsx   # 敏感词管理
│   │   ├── api/               # API 接口
│   │   │   ├── auth/          # 认证接口
│   │   │   ├── posts/         # 帖子接口
│   │   │   └── sensitive-words/  # 敏感词接口
│   │   ├── grade/[id]/        # 年级板块页面
│   │   ├── login/             # 登录页
│   │   ├── register/          # 注册页
│   │   ├── post/create/       # 发帖页
│   │   └── layout.tsx         # 全局布局
│   ├── components/            # 公共组件
│   │   ├── SlideCaptcha.tsx   # 滑块验证组件
│   │   └── TermsModal.tsx     # 用户协议弹窗
│   ├── data/                  # 静态数据
│   │   └── terms.ts           # 用户协议/隐私政策/免责声明
│   └── lib/                   # 核心库
│       ├── auth/              # 认证模块
│       │   ├── auth.ts        # NextAuth 配置
│       │   ├── captcha.ts     # 滑块验证逻辑
│       │   └── password-validator.ts  # 密码校验
│       └── sensitive-word/    # 敏感词过滤系统
│           ├── dfa.ts         # DFA 字典树算法
│           ├── pinyin.ts      # 拼音转换
│           ├── free-content-filter.ts  # 内容过滤器
│           ├── free-content-filter.test.ts  # 单元测试
│           └── index.ts       # 导出接口
├── .env                       # 环境变量
├── tailwind.config.js         # Tailwind 配置
└── next.config.js             # Next.js 配置
```

---

## 环境变量配置

```bash
# 数据库连接
DATABASE_URL="postgresql://username:password@localhost:5432/shool_forum"

# Redis (敏感词缓存)
REDIS_URL="redis://localhost:6379"

# NextAuth 密钥
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# 滑块验证 (可选)
CAPTCHA_PUBLIC_KEY="your-captcha-key"
CAPTCHA_PRIVATE_KEY="your-captcha-secret"
```

---

## 敏感词过滤系统

### 架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                     前端预检层                              │
│   实时检测输入内容，提示高风险词汇，减少无效请求              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     后端拦截层                              │
│   API 接口强制校验，命中敏感词直接拒绝并记录日志             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     异步复审层                              │
│   对疑似违规内容标记待审状态，仅管理员可见                   │
└─────────────────────────────────────────────────────────────┘
```

### 核心组件

#### 1. DFA 算法 ([dfa.ts](file:///C:/Users/Administrator/Documents/trae_projects/shool/src/lib/sensitive-word/dfa.ts))

基于字典树实现高效敏感词匹配：

```typescript
import { DFAMatcher } from '@/lib/sensitive-word/dfa'

const matcher = new DFAMatcher()
matcher.addWords(['暴力', '色情', '赌博'])
const result = matcher.match('这篇文章包含暴力内容')
// 返回: { found: true, matches: ['暴力'] }
```

#### 2. 拼音转换 ([pinyin.ts](file:///C:/Users/Administrator/Documents/trae_projects/shool/src/lib/sensitive-word/pinyin.ts))

支持汉字与拼音互转，用于检测拼音变体：

```typescript
import { textToPinyin, generatePinyinVariants } from '@/lib/sensitive-word/pinyin'

const pinyin = textToPinyin('暴力')
// 返回: 'baoli'

const variants = generatePinyinVariants('暴力')
// 返回: ['baoli', 'bao li', 'b a o l i', ...]
```

#### 3. FreeContentFilter 类 ([free-content-filter.ts](file:///C:/Users/Administrator/Documents/trae_projects/shool/src/lib/sensitive-word/free-content-filter.ts))

综合过滤器，支持多层检测：

```typescript
import { freeContentFilter } from '@/lib/sensitive-word/free-content-filter'

// 加载词库
await freeContentFilter.loadFromFile('clean-base-words.txt')

// 检测内容
const result = freeContentFilter.detect('你好世界')
// 返回: { hasBanned: false, hasSuspect: false, matches: [] }

const result2 = freeContentFilter.detect('这是色情内容')
// 返回: { hasBanned: true, hasSuspect: false, matches: [{ word: '色情', type: 'banned' }] }
```

#### 4. 零宽字符过滤

自动过滤以下零宽字符：
- U+200B 零宽空格
- U+200C 零宽不连字
- U+200D 零宽连字
- U+FEFF 零宽非断行空格

---

## API 接口

### 帖子接口

**POST /api/posts** - 创建帖子

请求体：
```json
{
  "gradeId": 7,
  "title": "学习经验分享",
  "content": "分享我的学习方法..."
}
```

成功响应 (201)：
```json
{
  "code": 201,
  "msg": "发布成功",
  "data": { ... }
}
```

敏感词拦截响应 (403)：
```json
{
  "code": 403,
  "msg": "内容包含违规词",
  "words": ["色情", "暴力"]
}
```

**GET /api/posts** - 获取帖子列表

请求参数：
- `gradeId`: 年级ID (可选)
- `page`: 页码 (默认 1)
- `limit`: 每页数量 (默认 10)

### 敏感词接口

**GET /api/sensitive-words** - 获取敏感词列表

**POST /api/sensitive-words** - 添加敏感词

请求体：
```json
{
  "word": "违规词",
  "type": "banned"
}
```

**DELETE /api/sensitive-words/[id]** - 删除敏感词

**POST /api/sensitive-words/validate** - 敏感词检测（前端预检）

请求体：
```json
{
  "content": "需要检测的内容"
}
```

### 认证接口

**POST /api/auth/[...nextauth]** - 登录/注册

---

## 管理后台

### 功能模块

1. **数据看板** (`/admin`)
   - DAU（日活跃用户）统计
   - 发帖量统计
   - 敏感词触发次数统计

2. **敏感词管理** (`/admin/sensitive-words`)
   - 敏感词列表展示与搜索
   - 单条添加/删除敏感词
   - TXT 文件批量上传追加词库
   - 最近 7 天命中统计图表

3. **用户管理**
   - 身份审核/封禁/重置密码

4. **内容审核**
   - 待审列表/历史操作记录

---

## 词库管理流程

### 1. 下载原始词库

```bash
pnpm tsx scripts/download-sensitivity-words.ts
```

脚本功能：
- 从 Gitee 下载 SensitiveWordStopWords 的 `sensitive_words.txt`
- 自动剔除校园高频误杀词（如"同志"、"激情"、"小学生"等）
- 生成清洗后的 `clean-base-words.txt`

### 2. 加载词库到数据库

```bash
pnpm db:seed
```

### 3. 后台维护

通过 `/admin/sensitive-words` 页面进行：
- 上传新的 TXT 文件追加词库
- 单条删除误杀词
- 查看命中统计

---

## 单元测试

运行敏感词过滤器测试：

```bash
pnpm test
```

测试场景：
1. **正常文本**: "这是正常的校园交流内容" → 不应误杀
2. **纯拼音**: "baoli" → 应识别为"暴力"
3. **零宽字符插入**: "暴​力" → 应识别为"暴力"
4. **校园专属词**: "校园霸凌" → 应正确识别

---

## 部署指南

### Cloudflare Pages

1. 配置环境变量
2. 添加构建命令：`pnpm build`
3. 设置输出目录：`.next`
4. 添加预览命令：`pnpm dev`

### Vercel

1. 连接 GitHub 仓库
2. 配置环境变量
3. 自动构建部署

### 数据库迁移

```bash
pnpm db:migrate
pnpm db:seed
```

---

## 安全策略

### 密码策略

正则校验：`/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/`

要求：
- 至少 8 位
- 包含小写字母
- 包含大写字母
- 包含数字

### 权限控制 (RBAC)

| 角色 | 权限 |
|------|------|
| 学生 | 发帖、评论 |
| 教师 | 发帖、评论、置顶、加精 |
| 管理员 | 全部权限 + 敏感词库管理 |

### 内容安全

- 词库仅存于服务端内存/Redis，绝不通过接口返回给浏览器
- 仅下载 TXT 纯文本格式，拒绝 JSON/Excel 等冗余格式
- 图片仅允许 GIF 或头像上传，禁止视频上传

---

## 浏览器兼容性

- Chrome 100+
- Firefox 95+
- Safari 15+
- Edge 100+

---

## 开发命令

```bash
pnpm dev          # 启动开发服务器
pnpm build        # 构建生产版本
pnpm lint         # 代码检查
pnpm db:migrate   # 数据库迁移
pnpm db:seed      # 初始化数据
pnpm test         # 运行测试
```
