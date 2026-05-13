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

function getApiUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  return baseUrl ? `${baseUrl}${path}` : path;
}

function normalizeChunkResult(result: any): ChunkResult | null {
  if (!result || typeof result !== 'object') return null;

  return {
    chunk_id: String(result.chunk_id || result.id || ''),
    title: String(result.title || result.document?.fileName || '未命名资料'),
    text: String(result.text || result.content || result.chunk || ''),
    topic: String(result.topic || ''),
    level: Number(result.level || 0),
    breadcrumb: Array.isArray(result.breadcrumb) ? result.breadcrumb : [],
    similarity: Number(result.similarity ?? result.score ?? result.relevance_score ?? 0),
    keywords: Array.isArray(result.keywords) ? result.keywords : [],
    source_refs: Array.isArray(result.source_refs) ? result.source_refs : [],
  };
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

  try {
    const response = await fetch(getApiUrl('/api/rag/search'), {
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
    return Array.isArray(data.results)
      ? data.results.map(normalizeChunkResult).filter(Boolean) as ChunkResult[]
      : [];
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
    const breadcrumb = Array.isArray(result.breadcrumb) ? result.breadcrumb.join(' > ') : '';
    const keywords = Array.isArray(result.keywords) ? result.keywords.join(', ') : '';
    const similarity = Number.isFinite(result.similarity) ? result.similarity : 0;
    return `【资料${index + 1}】${breadcrumb}\n标题: ${result.title || ''}\n内容: ${result.text || ''}\n关键词: ${keywords}\n相似度: ${(similarity * 100).toFixed(1)}%\n---`;
  }).join('\n\n');
}
