#!/usr/bin/env python3
import json
import os
import sys
from dotenv import load_dotenv
import dashscope
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
DASHSCOPE_API_KEY = os.getenv('DASHSCOPE_API_KEY')

dashscope.api_key = DASHSCOPE_API_KEY

def embed_text(text: str) -> list:
    try:
        input_data = [{'text': text}]
        resp = dashscope.MultiModalEmbedding.call(
            model="tongyi-embedding-vision-flash-2026-03-06",
            input=input_data
        )
        if resp.status_code == 200 and hasattr(resp, 'output') and resp.output:
            return resp.output['embeddings'][0]['embedding']
        else:
            print(f"Embedding API调用失败: {resp}")
            raise Exception(f"API Error")
    except Exception as e:
        print(f"生成Embedding失败: {str(e)}")
        raise

def import_chunk(supabase: Client, chunk: dict) -> str:
    embedding = embed_text(chunk['embedding_text'])
    
    data = {
        'chunk_id': chunk['chunk_id'],
        'parent_id': chunk['parent_id'],
        'level': chunk['level'],
        'breadcrumb': chunk['breadcrumb'],
        'topic': chunk['topic'],
        'title': chunk['title'],
        'text': chunk['text'],
        'embedding_text': chunk['embedding_text'],
        'keywords': chunk['keywords'],
        'source_refs': chunk['source_refs'],
        'embedding': embedding
    }
    
    response = supabase.table('ziwei_chunks').upsert(data, on_conflict='chunk_id').execute()
    
    if not response.data:
        print(f"导入失败 {chunk['chunk_id']}")
        raise Exception("插入无返回数据")
    
    return chunk['chunk_id']

def main():
    print('=== 开始导入紫微斗数RAG Chunks ===')
    
    chunks_path = os.path.join(os.path.dirname(__file__), '../../zi_wei_dou_shu_rag_chunks.json')
    if not os.path.exists(chunks_path):
        print(f"文件不存在: {chunks_path}")
        sys.exit(1)
    
    with open(chunks_path, 'r', encoding='utf-8') as f:
        chunks_data = json.load(f)
    
    chunks = chunks_data['chunks']
    
    print(f"\n数据集信息:")
    print(f"- 版本: {chunks_data.get('version', '未知')}")
    print(f"- 语言: {chunks_data.get('language', '未知')}")
    print(f"- 总Chunks数: {len(chunks)}")
    
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        print("错误: 请配置 SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY")
        sys.exit(1)
    
    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    
    batch_size = 10
    success_count = 0
    fail_count = 0
    
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i:i+batch_size]
        
        print(f"\n处理批次 {i//batch_size + 1}/{(len(chunks)-1)//batch_size + 1}")
        print(f"处理范围: {i + 1} - {min(i + batch_size, len(chunks))}")
        
        for chunk in batch:
            try:
                import_chunk(supabase, chunk)
                success_count += 1
                print('.', end='', flush=True)
            except Exception as e:
                fail_count += 1
                print('x', end='', flush=True)
        
        import time
        time.sleep(1)
    
    print(f"\n\n=== 导入完成 ===")
    print(f"成功: {success_count}")
    print(f"失败: {fail_count}")
    
    try:
        count_response = supabase.table('ziwei_chunks').select('*', count='exact').execute()
        print(f"数据库中总记录数: {count_response.count}")
    except Exception as e:
        print(f"查询记录数失败: {str(e)}")

if __name__ == '__main__':
    main()
