-- =============================================
-- 紫微斗数 RAG Chunks 向量数据库初始化脚本
-- 在 Supabase SQL 编辑器中执行此脚本
-- =============================================

-- 1. 启用 pgvector 扩展
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. 创建 chunks 表
-- 注意: tongyi-embedding-vision-flash-2026-03-06 输出 768 维向量
DROP TABLE IF EXISTS ziwei_chunks;
CREATE TABLE ziwei_chunks (
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
  embedding vector(768) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. 创建索引
CREATE INDEX IF NOT EXISTS idx_ziwei_chunks_topic ON ziwei_chunks(topic);
CREATE INDEX IF NOT EXISTS idx_ziwei_chunks_level ON ziwei_chunks(level);
CREATE INDEX IF NOT EXISTS idx_ziwei_chunks_embedding ON ziwei_chunks USING hnsw (embedding vector_cosine_ops);

-- 4. 创建向量检索函数
-- 注意: 函数参数使用 vector(768) 与表中实际维度一致
CREATE OR REPLACE FUNCTION match_ziwei_chunks(
  query_embedding vector(768),
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

-- 5. 创建带主题过滤的检索函数
CREATE OR REPLACE FUNCTION match_ziwei_chunks_by_topic(
  query_embedding vector(768),
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

-- 6. 启用 RLS 并创建公开访问策略（允许匿名访问）
ALTER TABLE ziwei_chunks ENABLE ROW LEVEL SECURITY;

-- 创建公开读取策略（无需认证即可读取）
CREATE POLICY "Allow public read access" ON ziwei_chunks
  FOR SELECT
  USING (true);

-- 7. 创建标题索引（可选）
CREATE INDEX IF NOT EXISTS idx_ziwei_chunks_title ON ziwei_chunks(title);

-- =============================================
-- 脚本执行完成
-- =============================================