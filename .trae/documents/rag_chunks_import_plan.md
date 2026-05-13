# RAG Chunks 导入向量数据库方案（Supabase + pgvector）

## 一、项目技术栈分析

### 1.1 架构概述
| 层级 | 技术 | 位置 |
|------|------|------|
| 前端 | Next.js 14.1.0 + React 18 + TypeScript | `frontend/` |
| 后端 | Node.js + Express | `backend/` |
| 向量数据库 | **Supabase + pgvector** | 外部服务 |
| Embedding服务 | 阿里云DashScope / OpenAI | API调用 |

### 1.2 关键依赖
```json
{
  "ai": "^6.0.90",
  "axios": "^1.13.6",
  "@supabase/supabase-js": "^2.39.0",
  "dotenv": "^17.3.1"
}
```

### 1.3 chunks数据结构
```typescript
interface Chunk {
  chunk_id: string;           // 唯一标识
  parent_id: string | null;   // 父节点ID
  level: number;              // 层级深度
  breadcrumb: string[];       // 面包屑路径
  topic: string;              // 主题分类
  title: string;              // 标题
  text: string;               // 正文内容
  embedding_text: string;     // 用于生成embedding的文本
  keywords: string[];         // 关键词
  source_refs: string[];      // 来源引用
}
```

---

## 二、Supabase 表结构设计

### 2.1 启用 pgvector 扩展
```sql
-- 在 Supabase SQL 编辑器中执行
CREATE EXTENSION IF NOT EXISTS vector;
```

### 2.2 创建 chunks 表
```sql
-- 创建向量存储表
CREATE TABLE IF NOT EXISTS ziwei_chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chunk_id TEXT UNIQUE NOT NULL,
  parent_id TEXT,
  level INTEGER NOT NULL DEFAULT 0,
  breadcrumb TEXT[] NOT NULL,
  topic TEXT NOT NULL,
  title TEXT NOT NULL,
  text TEXT NOT NULL,
  embedding_text TEXT NOT NULL,
  keywords TEXT[] NOT NULL,
  source_refs TEXT[] NOT NULL,
  embedding vector(1024) NOT NULL,  -- DashScope multimodal-embedding-v1 输出1024维
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引（加速向量搜索）
CREATE INDEX IF NOT EXISTS idx_ziwei_chunks_topic ON ziwei_chunks(topic);
CREATE INDEX IF NOT EXISTS idx_ziwei_chunks_embedding ON ziwei_chunks USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_ziwei_chunks_level ON ziwei_chunks(level);
```

### 2.3 创建检索函数
```sql
-- 向量相似度检索函数
CREATE OR REPLACE FUNCTION match_ziwei_chunks(
  query_embedding vector(1024),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INTEGER DEFAULT 5
)
RETURNS TABLE (
  chunk_id TEXT,
  title TEXT,
  text TEXT,
  topic TEXT,
  level INTEGER,
  breadcrumb TEXT[],
  similarity FLOAT,
  keywords TEXT[],
  source_refs TEXT[]
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.chunk_id,
    c.title,
    c.text,
    c.topic,
    c.level,
    c.breadcrumb,
    1 - (c.embedding <=> query_embedding) AS similarity,
    c.keywords,
    c.source_refs
  FROM ziwei_chunks c
  WHERE 1 - (c.embedding <=> query_embedding) >= match_threshold
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 带主题过滤的检索函数
CREATE OR REPLACE FUNCTION match_ziwei_chunks_by_topic(
  query_embedding vector(1024),
  filter_topic TEXT,
  match_threshold FLOAT DEFAULT 0.7,
  match_count INTEGER DEFAULT 5
)
RETURNS TABLE (
  chunk_id TEXT,
  title TEXT,
  text TEXT,
  topic TEXT,
  level INTEGER,
  breadcrumb TEXT[],
  similarity FLOAT,
  keywords TEXT[],
  source_refs TEXT[]
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.chunk_id,
    c.title,
    c.text,
    c.topic,
    c.level,
    c.breadcrumb,
    1 - (c.embedding <=> query_embedding) AS similarity,
    c.keywords,
    c.source_refs
  FROM ziwei_chunks c
  WHERE c.topic = filter_topic
    AND 1 - (c.embedding <=> query_embedding) >= match_threshold
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

---

## 三、本地 Ingest 导入脚本

### 3.1 创建脚本目录和文件
```javascript
// backend/scripts/ingestChunks.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

// 配置
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY;

// 初始化客户端
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// 生成 Embedding
async function embedText(text) {
  try {
    const response = await axios.post(
      'https://dashscope.aliyuncs.com/api/v1/services/embeddings/multimodal-embedding/multimodal-embedding',
      {
        model: 'multimodal-embedding-v1',
        input: { contents: [{ text }] }
      },
      {
        headers: {
          'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.output.embeddings[0].embedding;
  } catch (error) {
    console.error('Embedding生成失败:', error.message);
    throw error;
  }
}

// 导入单个chunk
async function importChunk(chunk) {
  const embedding = await embedText(chunk.embedding_text);
  
  const { error } = await supabase
    .from('ziwei_chunks')
    .upsert({
      chunk_id: chunk.chunk_id,
      parent_id: chunk.parent_id,
      level: chunk.level,
      breadcrumb: chunk.breadcrumb,
      topic: chunk.topic,
      title: chunk.title,
      text: chunk.text,
      embedding_text: chunk.embedding_text,
      keywords: chunk.keywords,
      source_refs: chunk.source_refs,
      embedding: embedding,
      updated_at: new Date().toISOString()
    }, { onConflict: 'chunk_id' });
  
  if (error) {
    console.error(`导入失败 ${chunk.chunk_id}:`, error.message);
    throw error;
  }
  
  return chunk.chunk_id;
}

// 主函数
async function main() {
  console.log('=== 开始导入紫微斗数RAG Chunks ===');
  
  // 读取chunks文件
  const chunksPath = path.join(__dirname, '../../zi_wei_dou_shu_rag_chunks.json');
  if (!fs.existsSync(chunksPath)) {
    console.error(`文件不存在: ${chunksPath}`);
    process.exit(1);
  }
  
  const chunksData = JSON.parse(fs.readFileSync(chunksPath, 'utf8'));
  const chunks = chunksData.chunks;
  
  console.log(`\n数据集信息:`);
  console.log(`- 版本: ${chunksData.version}`);
  console.log(`- 语言: ${chunksData.language}`);
  console.log(`- 总Chunks数: ${chunks.length}`);
  
  // 分批导入（避免API调用过于频繁）
  const batchSize = 10;
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, Math.min(i + batchSize, chunks.length));
    
    console.log(`\n处理批次 ${Math.floor(i / batchSize) + 1}/${Math.ceil(chunks.length / batchSize)}`);
    console.log(`处理范围: ${i + 1} - ${i + batch.length}`);
    
    for (const chunk of batch) {
      try {
        await importChunk(chunk);
        successCount++;
        process.stdout.write(`.`);
      } catch (error) {
        failCount++;
        process.stdout.write(`x`);
      }
    }
    
    // 批次间隔
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n\n=== 导入完成 ===`);
  console.log(`成功: ${successCount}`);
  console.log(`失败: ${failCount}`);
  
  // 验证导入结果
  const { data: countData, error: countError } = await supabase
    .from('ziwei_chunks')
    .select('count', { count: 'exact', head: true });
  
  if (!countError) {
    console.log(`数据库中总记录数: ${countData}`);
  }
}

// 执行
main().catch(error => {
  console.error('导入过程出错:', error);
  process.exit(1);
});
```

---

## 四、Next.js Lib 检索函数

### 4.1 创建检索工具函数
```typescript
// frontend/src/lib/rag.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import axios from 'axios';

export interface ChunkResult {
  chunk_id: string;
  title: string;
  text: string;
  topic: string;
  level: number;
  breadcrumb: string[];
  similarity: number;
  keywords: string[];
  source_refs: string[];
}

// 生成查询embedding
async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.NEXT_PUBLIC_DASHSCOPE_API_KEY;
  
  const response = await axios.post(
    'https://dashscope.aliyuncs.com/api/v1/services/embeddings/multimodal-embedding/multimodal-embedding',
    {
      model: 'multimodal-embedding-v1',
      input: { contents: [{ text }] }
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.data.output.embeddings[0].embedding;
}

// 检索函数
export async function matchZiweiChunks(
  query: string,
  options: {
    threshold?: number;
    count?: number;
    topic?: string;
  } = {}
): Promise<ChunkResult[]> {
  const supabase = createClientComponentClient();
  
  const { threshold = 0.7, count = 5, topic } = options;
  
  // 生成查询向量
  const embedding = await generateEmbedding(query);
  
  try {
    let result;
    
    if (topic) {
      // 带主题过滤的检索
      result = await supabase.rpc('match_ziwei_chunks_by_topic', {
        query_embedding: embedding,
        filter_topic: topic,
        match_threshold: threshold,
        match_count: count
      });
    } else {
      // 全局检索
      result = await supabase.rpc('match_ziwei_chunks', {
        query_embedding: embedding,
        match_threshold: threshold,
        match_count: count
      });
    }
    
    if (result.error) {
      throw new Error(result.error.message);
    }
    
    return result.data as ChunkResult[];
  } catch (error) {
    console.error('检索失败:', error);
    throw error;
  }
}

// 构建上下文文本
export function buildContext(results: ChunkResult[]): string {
  if (!results || results.length === 0) {
    return '暂无相关资料';
  }
  
  return results.map((result, index) => {
    const breadcrumb = result.breadcrumb.join(' > ');
    return `【资料${index + 1}】${breadcrumb}\n标题: ${result.title}\n内容: ${result.text}\n关键词: ${result.keywords.join(', ')}\n相似度: ${(result.similarity * 100).toFixed(1)}%\n---`;
  }).join('\n\n');
}
```

### 4.2 创建 API 路由（可选，用于服务端检索）
```typescript
// frontend/src/app/api/rag/search/route.ts
import { NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const { query, threshold = 0.7, count = 5, topic } = await request.json();
    
    // 生成embedding
    const apiKey = process.env.DASHSCOPE_API_KEY;
    const embeddingResponse = await axios.post(
      'https://dashscope.aliyuncs.com/api/v1/services/embeddings/multimodal-embedding/multimodal-embedding',
      {
        model: 'multimodal-embedding-v1',
        input: { contents: [{ text: query }] }
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const embedding = embeddingResponse.data.output.embeddings[0].embedding;
    
    // 查询Supabase
    const supabase = createServerComponentClient({});
    
    let result;
    if (topic) {
      result = await supabase.rpc('match_ziwei_chunks_by_topic', {
        query_embedding: embedding,
        filter_topic: topic,
        match_threshold: threshold,
        match_count: count
      });
    } else {
      result = await supabase.rpc('match_ziwei_chunks', {
        query_embedding: embedding,
        match_threshold: threshold,
        match_count: count
      });
    }
    
    if (result.error) {
      throw new Error(result.error.message);
    }
    
    return NextResponse.json({ results: result.data });
  } catch (error) {
    console.error('API检索失败:', error);
    return NextResponse.json(
      { error: '检索失败' },
      { status: 500 }
    );
  }
}
```

---

## 五、环境变量配置

### 5.1 backend/.env
```bash
# Supabase 配置
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 阿里云DashScope配置
DASHSCOPE_API_KEY=your_dashscope_api_key
```

### 5.2 frontend/.env.local
```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# DashScope 配置（前端使用，可选）
NEXT_PUBLIC_DASHSCOPE_API_KEY=your_dashscope_api_key

# 后端API地址（如果使用服务端检索）
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 六、需要新增/修改的文件

| 文件路径 | 操作 | 说明 |
|----------|------|------|
| `backend/scripts/ingestChunks.js` | **新增** | 本地导入脚本 |
| `backend/.env` | **新增** | 后端环境变量 |
| `frontend/src/lib/rag.ts` | **新增** | RAG检索工具函数 |
| `frontend/src/app/api/rag/search/route.ts` | **新增** | 服务端检索API |
| `frontend/.env.local` | **修改** | 添加Supabase和DashScope配置 |
| `frontend/package.json` | **修改** | 添加 `@supabase/auth-helpers-nextjs` 依赖 |

---

## 七、执行步骤

### 7.1 配置 Supabase
1. 创建 Supabase 项目
2. 在 SQL 编辑器中执行表结构 SQL（第二章内容）
3. 获取项目 URL、Service Role Key、Anon Key

### 7.2 安装依赖
```bash
# 后端安装依赖
cd backend
npm install @supabase/supabase-js axios dotenv

# 前端安装依赖
cd ../frontend
npm install @supabase/auth-helpers-nextjs @supabase/supabase-js axios
```

### 7.3 配置环境变量
```bash
# 配置 backend/.env
echo "SUPABASE_URL=your_url" >> backend/.env
echo "SUPABASE_SERVICE_ROLE_KEY=your_key" >> backend/.env
echo "DASHSCOPE_API_KEY=your_key" >> backend/.env

# 配置 frontend/.env.local
echo "NEXT_PUBLIC_SUPABASE_URL=your_url" >> frontend/.env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key" >> frontend/.env.local
echo "NEXT_PUBLIC_DASHSCOPE_API_KEY=your_key" >> frontend/.env.local
```

### 7.4 运行导入脚本
```bash
cd backend
node scripts/ingestChunks.js
```

### 7.5 在前端使用检索
```typescript
// 使用示例
import { matchZiweiChunks, buildContext } from '@/lib/rag';

// 基本检索
const results = await matchZiweiChunks('紫微斗數命宮', {
  threshold: 0.7,
  count: 5
});

// 带主题过滤的检索
const palaceResults = await matchZiweiChunks('命宮', {
  threshold: 0.7,
  count: 3,
  topic: 'palace'
});

// 构建上下文
const context = buildContext(results);
console.log(context);
```

---

## 八、注意事项

1. **pgvector 启用**: 需要在 Supabase 中启用 pgvector 扩展
2. **API密钥安全**: 
   - Service Role Key 仅用于后端导入，不要在前端暴露
   - Anon Key 用于前端查询
3. **Embedding维度**: 当前使用1024维，需与表结构一致
4. **API调用限制**: DashScope有调用频率限制，导入时已做分批处理
5. **索引优化**: 创建 HNSW 索引可显著提升检索速度