#!/usr/bin/env python3
import os
from dotenv import load_dotenv
import dashscope
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
DASHSCOPE_API_KEY = os.getenv('DASHSCOPE_API_KEY')

dashscope.api_key = DASHSCOPE_API_KEY

def embed_text(text: str) -> list:
    input_data = [{'text': text}]
    resp = dashscope.MultiModalEmbedding.call(
        model="tongyi-embedding-vision-flash-2026-03-06",
        input=input_data
    )
    return resp.output['embeddings'][0]['embedding']

def search_chunks(query: str, threshold=0.7, count=5):
    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    
    embedding = embed_text(query)
    print(f"查询: {query}")
    print(f"Embedding长度: {len(embedding)}")
    
    result = supabase.rpc('match_ziwei_chunks', {
        'query_embedding': embedding,
        'match_threshold': threshold,
        'match_count': count
    }).execute()
    
    return result.data

def main():
    print('=== 测试向量检索 ===\n')
    
    test_queries = [
        '紫微斗數命宮',
        '紫微星',
        '四化',
        '夫妻宮',
        '財帛宮'
    ]
    
    for query in test_queries:
        print('=' * 50)
        results = search_chunks(query, threshold=0.6, count=3)
        
        if results:
            for i, result in enumerate(results, 1):
                print(f"\n结果 {i}:")
                print(f"标题: {result['title']}")
                print(f"主题: {result['topic']}")
                print(f"相似度: {(result['similarity'] * 100):.1f}%")
                print(f"内容摘要: {result['text'][:100]}...")
                print(f"关键词: {', '.join(result['keywords'])}")
        else:
            print("无匹配结果")
        
        print()

if __name__ == '__main__':
    main()