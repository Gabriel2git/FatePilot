# RAG 查询失败 Debug 计划

## 问题分析

RAG 查询链路涉及两个入口：
1. **RagTest 组件** → `matchZiweiChunks` (客户端 Supabase client)
2. **AI 对话** → `generateMasterPrompt` → `fetchRAGContext` → API route

## 可能失败点

### 1. Supabase RPC 函数问题
- 函数 `match_ziwei_chunks` 可能不存在或参数不匹配
- RLS (Row Level Security) 策略可能阻止查询

### 2. DashScope API 问题
- API Key 配置错误
- 模型名称不正确
- 请求格式不匹配

### 3. Embedding 向量问题
- 客户端和服务端使用不同的 embedding 模型
- 向量维度不一致

## Debug 步骤

### Step 1: 检查 Supabase RPC 函数是否存在
在 Supabase Dashboard SQL Editor 执行：
```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%ziwei%';
```

### Step 2: 测试无认证查询
```sql
-- 检查表是否存在
SELECT * FROM ziwei_chunks LIMIT 1;

-- 测试 RPC 函数（直接调用）
SELECT * FROM match_ziwei_chunks(
  embedding := (SELECT embedding FROM ziwei_chunks LIMIT 1),
  match_threshold := 0.6,
  match_count := 5
);
```

### Step 3: 检查 RLS 策略
```sql
-- 查看表的 RLS 策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'ziwei_chunks';
```

### Step 4: 添加 debug 日志到 rag.ts
在 `matchZiweiChunks` 函数中添加详细错误日志

### Step 5: 测试 API route
直接调用 `http://localhost:3000/api/rag/search` 接口测试

## 实施方案

### 文件修改清单

1. **frontend/src/lib/rag.ts**
   - 添加详细的错误日志
   - 检查 Supabase 客户端初始化

2. **backend/scripts/supabase_init.sql**
   - 确保 RPC 函数创建正确
   - 检查 RLS 策略

### 需要验证的配置

1. Supabase URL: `https://euzrscjcovzsvjnpxink.supabase.co`
2. Anon Key: 已配置
3. DashScope API Key: `sk-0b35f469e2c64dd6add4982240f0bd8f`
4. 数据库表 `ziwei_chunks` 存在且有 73 条记录
5. RPC 函数 `match_ziwei_chunks` 已创建

## 预期修复点

1. 可能需要为 `ziwei_chunks` 表添加 RLS 策略允许 anon 密钥访问
2. 可能需要修复 RPC 函数的参数传递方式
3. 可能需要添加更详细的错误日志定位具体失败点