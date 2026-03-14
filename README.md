# Ruanm 官网

用户体验至上的好产品

## 简介

Ruanm 专注于打造用户体验至上的好产品，以设计驱动，以体验为本。

## 技术栈

- **框架**: Next.js 16
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **UI 组件**: Radix UI
- **动画**: AOS (Animate On Scroll)
- **状态管理**: React Hooks
- **认证**: Supabase

## 功能特性

- 响应式设计，支持移动端和桌面端
- 深色模式支持
- 流畅的页面动画效果
- 用户认证系统
- 产品展示和搜索
- 文档中心
- 系统状态监控
- AI 对话接口（基于 OpenRouter）

## API 接口

### AI 对话接口

调用 OpenRouter AI 服务进行对话。

**接口地址**: `POST /api/v1/ai`

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| model | string | 否 | 模型名称，默认 `deepseek/deepseek-v3.2` |
| messages | array | 是 | 对话消息数组 |
| messages[].role | string | 是 | 角色：`system`、`user`、`assistant` |
| messages[].content | string | 是 | 消息内容 |
| temperature | number | 否 | 温度参数，0-2 |
| max_tokens | number | 否 | 最大生成令牌数 |
| stream | boolean | 否 | 是否流式输出，默认 false |

**生产环境调用示例**:

```bash
curl -X POST https://ruanmgjx.dpdns.org/api/v1/ai \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek/deepseek-v3.2",
    "messages": [
      {"role": "user", "content": "你好，请介绍一下你自己"}
    ]
  }'
```

**JavaScript 调用示例** (非流式):

```javascript
const response = await fetch('https://ruanmgjx.dpdns.org/api/v1/ai', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'deepseek/deepseek-v3.2',
    messages: [
      { role: 'user', content: '你好，请介绍一下你自己' }
    ],
  }),
});

const data = await response.json();
console.log(data);
```

**JavaScript 调用示例** (流式输出):

```javascript
const response = await fetch('https://ruanmgjx.dpdns.org/api/v1/ai', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'deepseek/deepseek-v3.2',
    messages: [
      { role: 'user', content: '你好，请介绍一下你自己' }
    ],
    stream: true, // 启用流式输出
  }),
});

if (!response.body) {
  console.error('No response body');
  return;
}

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value, { stream: true });
  
  // 解析 SSE 事件
  const lines = chunk.split('\n');
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = line.slice(6);
      if (data === '[DONE]') {
        console.log('Stream completed');
      } else {
        try {
          const json = JSON.parse(data);
          if (json.choices && json.choices[0]?.delta?.content) {
            const content = json.choices[0].delta.content;
            console.log('Received content:', content);
            // 在这里更新 UI，逐字显示内容
          }
        } catch (e) {
          console.error('Error parsing JSON:', e);
        }
      }
    }
  }
}
```

**响应示例**:

```json
{
  "id": "gen-xxxxx",
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "你好！我是一个AI助手..."
      },
      "finish_reason": "stop"
    }
  ],
  "model": "deepseek/deepseek-v3.2-20251201"
}
```

### 图像生成接口

调用 OpenRouter AI 服务生成图像。

**接口地址**: `GET /api/v1/ai/image` 或 `POST /api/v1/ai/image`

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| model | string | 否 | 模型名称，默认 `google/gemini-2.5-flash-image-preview` |
| prompt | string | 是 | 图像生成提示词 |
| size | string | 否 | 图像尺寸，默认 `1024x1024` |
| quality | string | 否 | 图像质量，默认 `standard` |
| n | number | 否 | 生成图像数量，默认 1 |

**GET 方法调用示例**:

```bash
curl "https://ruanmgjx.dpdns.org/api/v1/ai/image?prompt=一只可爱的小猫&size=1024x1024"
```

**POST 方法调用示例**:

```bash
curl -X POST https://ruanmgjx.dpdns.org/api/v1/ai/image \
  -H "Content-Type: application/json" \
  -d '{
    "model": "google/gemini-2.5-flash-image-preview",
    "prompt": "一只可爱的小猫",
    "size": "1024x1024",
    "quality": "standard",
    "n": 1
  }'
```

**JavaScript 调用示例**:

```javascript
// GET 方法
const response = await fetch('https://ruanmgjx.dpdns.org/api/v1/ai/image?prompt=一只可爱的小猫&size=1024x1024');
const data = await response.json();
console.log(data);

// POST 方法
const response = await fetch('https://ruanmgjx.dpdns.org/api/v1/ai/image', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'google/gemini-2.5-flash-image-preview',
    prompt: '一只可爱的小猫',
    size: '1024x1024',
    quality: 'standard',
    n: 1
  }),
});

const data = await response.json();
console.log(data);
```

**响应示例**:

```json
{
  "created": 1677825464,
  "data": [
    {
      "url": "https://oaidalleapiprodscus.blob.core.windows.net/private/org-xxxxx/user-xxxxx/img-xxxxx.png?st=2026-03-14T07:57:44Z&se=2026-03-14T09:57:44Z&sp=r&sv=2021-08-06&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2026-03-13T22:40:36Z&ske=2026-03-14T22:40:36Z&sks=b&skv=2021-08-06&sig=xxxxx"
    }
  ]
}
```

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

### 构建项目

```bash
pnpm build
```

### 代码检查

```bash
pnpm lint
```

## 项目结构

```
.
├── app/              # Next.js 应用目录
│   ├── page.tsx      # 主页
│   ├── products/     # 产品页面
│   ├── docs/         # 文档页面
│   ├── login/        # 登录页面
│   ├── register/     # 注册页面
│   └── user/         # 用户页面
├── components/       # React 组件
│   ├── ui/          # UI 基础组件
│   ├── header.tsx    # 导航栏
│   ├── footer.tsx    # 页脚
│   └── ...          # 其他业务组件
├── public/          # 静态资源
│   ├── logo.png
│   ├── sitemap.xml
│   └── statuses.json
└── lib/            # 工具函数
```

## 部署

本项目使用 Cloudflare Pages 自动部署。

部署流程：
1. 推送代码到 `main` 分支
2. Cloudflare Pages 自动触发构建
3. 构建完成后自动部署到 Cloudflare Pages 全球网络

### 访问链接
- **Cloudflare Pages**: https://ruanmgjx.dpdns.org
- **GitHub 仓库**: https://github.com/RuanMingze/Ruanm-OW

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 联系方式

- 邮箱: xmt20160124@outlook.com
- GitHub: https://github.com/RuanMingze/Ruanm-OW
