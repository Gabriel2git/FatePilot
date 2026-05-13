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

def test_embedding():
    print("\n=== 测试 DashScope Embedding ===")
    try:
        text = "紫微斗數命宮"
        input_data = [{'text': text}]
        resp = dashscope.MultiModalEmbedding.call(
            model="tongyi-embedding-vision-flash-2026-03-06",
            input=input_data
        )
        print(f"API状态码: {resp.status_code}")
        if hasattr(resp, 'output') and resp.output:
            embedding = resp.output['embeddings'][0]['embedding']
            print(f"Embedding长度: {len(embedding)}")
            return embedding
        else:
            print(f"API响应类型: {type(resp)}")
            print(f"API响应: {resp}")
            return None
    except Exception as e:
        print(f"测试失败: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

def test_supabase_connection():
    print("\n=== 测试 Supabase 连接 ===")
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        response = supabase.table('ziwei_chunks').select('*').limit(1).execute()
        print(f"响应类型: {type(response)}")
        print(f"响应数据: {response.data}")
        print(f"响应属性: {dir(response)}")
        return supabase
    except Exception as e:
        print(f"连接失败: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

def test_insert_chunk(supabase, embedding):
    print("\n=== 测试插入单条数据 ===")
    try:
        test_chunk = {
            'chunk_id': 'test_chunk_001',
            'parent_id': None,
            'level': 0,
            'breadcrumb': ['测试', '测试数据'],
            'topic': 'test',
            'title': '测试标题',
            'text': '测试内容',
            'embedding_text': '测试嵌入文本',
            'keywords': ['测试', 'demo'],
            'source_refs': ['TEST_SOURCE'],
            'embedding': embedding
        }
        
        response = supabase.table('ziwei_chunks').upsert(test_chunk, on_conflict='chunk_id').execute()
        print(f"响应类型: {type(response)}")
        print(f"响应数据: {response.data}")
        print(f"响应属性: {dir(response)}")
        
        if hasattr(response, 'error') and response.error:
            print(f"错误信息: {response.error}")
        else:
            print("插入成功!")
            
    except Exception as e:
        print(f"插入失败: {str(e)}")
        import traceback
        traceback.print_exc()

def main():
    embedding = test_embedding()
    if not embedding:
        print("\n❌ Embedding测试失败")
        return
    
    supabase = test_supabase_connection()
    if not supabase:
        print("\n❌ Supabase连接失败")
        return
    
    test_insert_chunk(supabase, embedding)
    
    print("\n=== 测试完成 ===")

if __name__ == '__main__':
    main()