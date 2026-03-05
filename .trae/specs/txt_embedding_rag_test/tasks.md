# 紫微斗数项目 - TXT文件向量化与RAG测试窗口实现计划

## [ ] Task 1: 测试TXT文件处理功能
- **Priority**: P0
- **Depends On**: None
- **Description**:
  - 运行文档处理脚本，测试TXT文件的解析功能
  - 验证所有TXT文件都能被正确解析和分割
  - 检查文本分割结果是否合理
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic` TR-1.1: 所有TXT文件能够被正确解析
  - `programmatic` TR-1.2: 解析后的文本能够被正确分割
- **Notes**:
  - 文本分割长度建议500-1000字符

## [ ] Task 2: 测试TXT文件向量化
- **Priority**: P0
- **Depends On**: Task 1
- **Description**:
  - 运行向量化脚本，处理所有TXT文件
  - 验证TXT文件内容能够成功向量化
  - 检查向量存储文件是否包含所有TXT文件的向量
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `programmatic` TR-2.1: TXT文件内容成功向量化
  - `programmatic` TR-2.2: 向量存储文件包含所有TXT文件的向量
- **Notes**:
  - 使用阿里云百炼multimodal-embedding-v1模型进行向量化

## [ ] Task 3: 实现RAG测试窗口后端API
- **Priority**: P1
- **Depends On**: Task 2
- **Description**:
  - 在后端服务器中添加RAG测试API端点
  - 实现检索功能，返回检索结果和生成的prompt
  - 确保API能够处理用户查询并返回相关资料
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `programmatic` TR-3.1: API端点能够正常响应
  - `programmatic` TR-3.2: API能够返回检索结果和生成的prompt
- **Notes**:
  - API应返回与LLM模型相同格式的prompt

## [ ] Task 4: 实现RAG测试窗口前端界面
- **Priority**: P1
- **Depends On**: Task 3
- **Description**:
  - 创建一个独立的测试页面
  - 实现用户输入界面和结果展示界面
  - 集成后端API，展示检索结果和生成的prompt
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `human-judgment` TR-4.1: 测试窗口界面美观易用
  - `programmatic` TR-4.2: 前端能够正确调用后端API
- **Notes**:
  - 测试窗口应独立于现有LLM集成，仅测试RAG功能

## [ ] Task 5: 测试和优化
- **Priority**: P2
- **Depends On**: Task 4
- **Description**:
  - 测试TXT文件的向量化效果
  - 测试RAG测试窗口的功能
  - 优化系统性能和用户体验
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3, AC-4
- **Test Requirements**:
  - `human-judgment` TR-5.1: RAG测试窗口功能正常
  - `programmatic` TR-5.2: TXT文件向量化效果良好
- **Notes**:
  - 测试不同类型的查询，验证检索结果的相关性
