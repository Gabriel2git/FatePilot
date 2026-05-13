import { NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import axios from 'axios';

function buildContext(results: any[]): string {
  if (!results || results.length === 0) {
    return '暂无相关资料';
  }

  return results.map((result, index) => {
    const breadcrumb = result.breadcrumb?.join(' > ') || '';
    return `【资料${index + 1}】${breadcrumb}\n标题: ${result.title}\n内容: ${result.text}\n关键词: ${result.keywords?.join(', ')}\n相似度: ${((result.similarity || 0) * 100).toFixed(1)}%\n---`;
  }).join('\n\n');
}

export async function POST(request: Request) {
  console.log('[RAG API] 收到请求');

  try {
    const { query, threshold = 0.7, count = 5, topic } = await request.json();
    console.log('[RAG API] 查询参数:', { query: query?.substring(0, 50), threshold, count, topic });

    const apiKey = process.env.DASHSCOPE_API_KEY;
    console.log('[RAG API] DashScope API Key 前10位:', apiKey?.substring(0, 10));

    const embeddingResponse = await axios.post(
      'https://dashscope.aliyuncs.com/api/v1/services/embeddings/multimodal-embedding/multimodal-embedding',
      {
        model: 'tongyi-embedding-vision-flash-2026-03-06',
        input: {
          texts: [{ text: query }]
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('[RAG API] Embedding 响应:', embeddingResponse.status, embeddingResponse.data.output?.embeddings?.[0]?.embedding?.length);

    const embedding = embeddingResponse.data.output.embeddings[0].embedding;

    const supabase = createServerComponentClient({});
    console.log('[RAG API] Supabase 客户端创建成功');

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

    console.log('[RAG API] RPC 结果:', { hasData: !!result.data, dataLength: result.data?.length, error: result.error });

    if (result.error) {
      console.error('[RAG API] RPC 错误:', result.error);
      throw new Error(result.error.message);
    }

    const context = buildContext(result.data || []);

    return NextResponse.json({ results: result.data, context });
  } catch (error: any) {
    console.error('[RAG API] 错误:', error.response?.data || error.message);
    return NextResponse.json(
      { error: error.message || '检索失败' },
      { status: 500 }
    );
  }
}