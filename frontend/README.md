# FatePilot 前端

前端使用 Next.js 14、React 18、TypeScript 和 Tailwind CSS。项目总览、环境配置及前后端联调方式请看根目录 [README.md](../README.md)。

## 本地开发

```bash
npm install
npm run dev
```

默认访问 <http://localhost:3000>，并请求 `http://localhost:3001` 的本地 API。若后端部署在其他地址，在 `frontend/.env.local` 中设置 `NEXT_PUBLIC_API_URL`。

## 常用命令

```bash
npm run dev                 # 启动开发服务器
npm run build               # 生产构建
npm run start               # 启动生产构建
npm run test:ui-contract    # 运行 UI 契约测试
```

## 主要目录

- `src/app/`：Next.js 页面、布局、全局样式和 API route。
- `src/components/`：表单、命盘、AI 对话和侧栏等界面组件。
- `src/hooks/`：命盘数据、对话与案例状态。
- `src/lib/`：排盘辅助、四化、模型请求和 prompt 逻辑。
- `src/contexts/`：跨组件共享的认证状态。
- `tests/`：前端契约和逻辑测试。

命盘视图由项目内的 `ZiweiChart` 组件实现。虽然依赖清单仍包含 `react-iztro`，当前命盘界面不是用该库直接渲染；请以 `src/components/ZiweiChart/` 中的代码为准。
