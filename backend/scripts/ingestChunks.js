require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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

async function main() {
  console.log('=== 开始导入紫微斗数RAG Chunks ===');
  
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
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n\n=== 导入完成 ===`);
  console.log(`成功: ${successCount}`);
  console.log(`失败: ${failCount}`);
  
  const { data: countData, error: countError } = await supabase
    .from('ziwei_chunks')
    .select('count', { count: 'exact', head: true });
  
  if (!countError) {
    console.log(`数据库中总记录数: ${countData}`);
  }
}

main().catch(error => {
  console.error('导入过程出错:', error);
  process.exit(1);
});