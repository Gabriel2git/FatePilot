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

export async function matchZiweiChunks(
  query: string,
  options: {
    threshold?: number;
    count?: number;
    topic?: string;
  } = {}
): Promise<ChunkResult[]> {
  const { threshold = 0.7, count = 5, topic } = options;
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  console.log('[RAG] 开始检索:', { query: query.substring(0, 50), threshold, count, topic });

  try {
    const response = await fetch(`${API_BASE_URL}/api/rag/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        threshold,
        count,
        topic,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data?.error || `RAG 请求失败: ${response.status}`);
    }

    console.log('[RAG] 检索成功:', { dataLength: data.results?.length });
    return (data.results || []) as ChunkResult[];
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
