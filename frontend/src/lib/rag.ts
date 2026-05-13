import { createClient } from '@supabase/supabase-js';
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.NEXT_PUBLIC_DASHSCOPE_API_KEY;

  console.log('[RAG] 生成 Embedding，API Key 前10位:', apiKey?.substring(0, 10));

  try {
    const response = await axios.post(
      'https://dashscope.aliyuncs.com/api/v1/services/embeddings/multimodal-embedding/multimodal-embedding',
      {
        model: 'tongyi-embedding-vision-flash-2026-03-06',
        input: {
          texts: [{ text }]
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const embedding = response.data.output.embeddings[0].embedding;
    console.log('[RAG] Embedding 生成成功，长度:', embedding.length);
    return embedding;
  } catch (error: any) {
    console.error('[RAG] Embedding 生成失败:', error.response?.data || error.message);
    throw new Error(`Embedding 生成失败: ${error.response?.data?.error?.message || error.message}`);
  }
}

export async function matchZiweiChunks(
  query: string,
  options: {
    threshold?: number;
    count?: number;
    topic?: string;
  } = {}
): Promise<ChunkResult[]> {
  const { threshold = 0.7, count = 5, topic } = options;

  console.log('[RAG] 开始检索:', { query: query.substring(0, 50), threshold, count, topic });

  let embedding;
  try {
    embedding = await generateEmbedding(query);
  } catch (error) {
    console.error('[RAG] Embedding 失败:', error);
    throw error;
  }

  try {
    console.log('[RAG] 调用 Supabase RPC...');

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

    console.log('[RAG] RPC 结果:', { hasData: !!result.data, dataLength: result.data?.length, error: result.error });

    if (result.error) {
      console.error('[RAG] Supabase RPC 错误:', result.error);
      throw new Error(result.error.message);
    }

    return result.data as ChunkResult[];
  } catch (error: any) {
    console.error('[RAG] 检索过程错误:', error);
    throw error;
  }
}

export function buildContext(results: ChunkResult[]): string {
  if (!results || results.length === 0) {
    return '暂无相关资料';
  }

  return results.map((result, index) => {
    const breadcrumb = result.breadcrumb?.join(' > ') || '';
    const keywords = result.keywords?.join(', ') || '';
    return `【资料${index + 1}】${breadcrumb}\n标题: ${result.title}\n内容: ${result.text}\n关键词: ${keywords}\n相似度: ${(result.similarity * 100).toFixed(1)}%\n---`;
  }).join('\n\n');
}