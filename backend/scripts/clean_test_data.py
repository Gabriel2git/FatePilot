#!/usr/bin/env python3
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

result = supabase.table('ziwei_chunks').delete().eq('chunk_id', 'test_chunk_001').execute()
print(f"删除测试数据: {result.data}")

count_result = supabase.table('ziwei_chunks').select('*', count='exact').execute()
print(f"清理后总记录数: {count_result.count}")