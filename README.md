# FatePilot

FatePilot 是一个紫微斗数排盘与 AI 解读应用。本文档是项目当前状态的入口；开发过程记录见 [DEVLOG.md](./DEVLOG.md)。

## 项目组成

- `frontend/`：Next.js 14 + React 18 前端，包含出生信息表单、命盘、运限切换和 AI 对话界面。
- `src/server.js`：Node.js HTTP API，调用 `iztro` 排盘，并代理模型请求、校验邀请码和提供 RAG 查询接口。
- `backend/services/retrievalService.js`：RAG 检索服务；使用 DashScope 生成向量，并连接 Supabase 向量库。
- `backend/data/`：检索文档与本地向量数据。知识库原文和生成数据请勿随意覆盖。
- `frontend/src/lib/`：排盘辅助计算、AI prompt、四化、RAG 请求等业务逻辑。
- `frontend/src/hooks/`：命盘数据、AI 对话、保存案例等状态逻辑。
- `frontend/src/components/ZiweiChart/`：命盘宫位和中央信息渲染；`ChartView/` 负责运限选择及整体命盘视图。
- `DEVLOG.md`：按时间记录的历史改动。遇到与代码不一致的描述时，以当前实现为准。

## 本地运行

要求 Node.js 18+ 和 npm。前端和根目录依赖需要分别安装：

```bash
npm install
cd frontend && npm install
```

在项目根目录创建 `backend/.env`，按需填写：

```env
# 邀请码验证
AUTH_CODE=your_invite_code

# 模型服务。默认地址是 DeepSeek；切换到 DashScope 时改为对应兼容接口地址。
PROVIDER_BASE_URL=https://api.deepseek.com/v1
DEEPSEEK_API_KEY=your_deepseek_api_key

# RAG 检索所需；SUPABASE_URL 应是项目根地址，不要带 /rest/v1/。
DASHSCOPE_API_KEY=your_dashscope_api_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

`src/server.js` 在非 production 环境会从 `backend/.env` 加载变量。服务端密钥只放在服务端环境中，不要提交真实密钥，也不要将 service role key 放进 `NEXT_PUBLIC_*` 变量。模型地址若使用 DeepSeek，服务端读取 `DEEPSEEK_API_KEY`；若使用 DashScope 域名，读取 `DASHSCOPE_API_KEY`；其他兼容服务读取 `OPENAI_API_KEY`。

前端可以使用默认的本地 API 地址 `http://localhost:3001`。需要覆盖时，在 `frontend/.env.local` 设置：

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

分别启动后端和前端：

```bash
# 终端一：项目根目录
node src/server.js

# 终端二：frontend 目录
npm run dev
```

打开 <http://localhost:3000>。后端健康检查地址为 <http://localhost:3001/health>；RAG 是否就绪看返回中的 `ragInitialized`，仅有 `status: ok` 不代表向量检索已连通。

## 代码阅读顺序

1. `frontend/src/app/page.tsx`：页面和主要流程编排。
2. `frontend/src/components/ChartView/` 与 `frontend/src/components/ZiweiChart/`：运限按钮、宫位高亮和命盘布局。
3. `frontend/src/hooks/useZiweiData.ts`：前端如何请求并维护命盘数据。
4. `src/server.js`：排盘 API、数据序列化、运限上下文及模型代理。
5. `frontend/src/lib/ai.ts` 和 `backend/services/retrievalService.js`：模型 prompt 与知识检索。

## API 速览

接口实现以 `src/server.js` 为准。排盘请求接收出生日期、时辰索引、性别、农历/闰月标记及可选目标年份。

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| `GET` | `/health` | 服务状态和 RAG 初始化状态 |
| `POST` | `/api/ziwei-lite` | 命盘及当前运限的轻量数据 |
| `POST` | `/api/ziwei-context` | 当前选中上下文、运限年份信息和 prompt 运限区块 |
| `POST` | `/api/ziwei` | 聚合命盘与运限数据 |
| `POST` | `/api/rag/search` | 检索知识库并返回上下文 |
| `POST` | `/api/rag/test` | 检索并返回调试 prompt |
| `POST` | `/api/llm/chat` | 代理兼容 Chat Completions 模型调用 |
| `POST` | `/api/verify-code` | 校验邀请码 |

## 验证

前端当前配置的验证命令：

```bash
cd frontend
npm run test:ui-contract
npm run build
```

后端 embedding 配置测试：

```bash
node --test backend/test/retrievalEmbeddingConfig.test.js
```

根目录 `package.json` 当前没有配置正式测试脚本；不要用根目录 `npm test` 作为项目验证命令。RAG 集成脚本可能需要外部服务和密钥，按脚本说明及当前环境决定是否执行。

## 文档维护

- 代码结构或运行方式变化时，同步更新本文件及 `frontend/README.md`。
- 历史原因和迭代过程写入 `DEVLOG.md`；当前行为以代码为准。
- `frontend/README.md` 是前端子目录的启动说明，不再维护独立的旧版架构介绍。
