const { createClient } = require('@supabase/supabase-js');

const EMBEDDING_MODEL = 'tongyi-embedding-vision-flash-2026-03-06';
const EMBEDDING_URL = 'https://dashscope.aliyuncs.com/api/v1/services/embeddings/multimodal-embedding/multimodal-embedding';

class RetrievalService {
  constructor() {
    this.supabase = null;
    this.initialized = false;
    this.initializationError = null;
  }

  async initialize() {
    try {
      console.log('初始化检索服务...');

      const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const missingConfig = [];

      if (!supabaseUrl || !supabaseKey) {
        missingConfig.push('SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY');
      }
      if (!process.env.DASHSCOPE_API_KEY) {
        missingConfig.push('DASHSCOPE_API_KEY');
      }
      if (missingConfig.length > 0) {
        throw new Error(`RAG 配置缺失: ${missingConfig.join(', ')}`);
      }

      this.supabase = createClient(supabaseUrl, supabaseKey);
      this.initialized = true;
      this.initializationError = null;
      console.log('检索服务初始化完成');
    } catch (error) {
      this.initialized = false;
      this.supabase = null;
      this.initializationError = error?.message || 'RAG 初始化失败';
      console.error('检索服务初始化失败:', error);
      throw error;
    }
  }

  getStatus() {
    return {
      initialized: this.initialized,
      error: this.initializationError,
    };
  }

  async generateEmbedding(text) {
    const response = await fetch(EMBEDDING_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.DASHSCOPE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: {
          contents: [{ text }],
        },
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = data?.message || data?.error?.message || `DashScope 请求失败: ${response.status}`;
      throw new Error(message);
    }

    const embedding = data?.output?.embeddings?.[0]?.embedding;
    if (!Array.isArray(embedding)) {
      throw new Error('DashScope 返回缺少 embedding');
    }

    return embedding;
  }

  async search(query, options = {}) {
    if (!this.initialized) {
      const error = new Error(this.initializationError || '检索服务未初始化');
      error.statusCode = 503;
      throw error;
    }

    const normalizedOptions = typeof options === 'number'
      ? { count: options }
      : options;
    const {
      count = 3,
      threshold = 0.6,
      topic,
    } = normalizedOptions;

    try {
      console.log(`执行检索: ${query}, count: ${count}, threshold: ${threshold}, topic: ${topic || 'all'}`);

      const embedding = await this.generateEmbedding(query);
      const rpcName = topic ? 'match_ziwei_chunks_by_topic' : 'match_ziwei_chunks';
      const rpcArgs = topic
        ? {
          query_embedding: embedding,
          filter_topic: topic,
          match_threshold: threshold,
          match_count: count,
        }
        : {
          query_embedding: embedding,
          match_threshold: threshold,
          match_count: count,
        };

      const { data, error } = await this.supabase.rpc(rpcName, rpcArgs);

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error('检索失败:', error);
      throw error;
    }
  }

  buildContext(results) {
    if (!results || results.length === 0) {
      return '暂无相关资料';
    }

    const context = results.map((result, index) => {
      const breadcrumb = Array.isArray(result.breadcrumb) ? result.breadcrumb.join(' > ') : '';
      const keywords = Array.isArray(result.keywords) ? result.keywords.join(', ') : '';
      const similarity = typeof result.similarity === 'number'
        ? `\n相似度: ${(result.similarity * 100).toFixed(1)}%`
        : '';

      return `【资料${index + 1}】${breadcrumb}
标题: ${result.title || ''}
内容: ${result.text || result.content || ''}
关键词: ${keywords}${similarity}
---`;
    }).join('\n\n');

    return context;
  }
}

module.exports = RetrievalService;
