# 紫微斗数项目 - PDF向量化问题修复与RAG测试窗口实现计划

## [ ] Task 1: 更换PDF解析库
- **Priority**: P0
- **Depends On**: None
- **Description**:
  - 选择并安装一个可靠的PDF解析库
  - 替换当前的pdf-parse库
  - 确保新库能够正确解析PDF文件内容
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic` TR-1.1: 新PDF解析库能够正确安装
  - `programmatic` TR-1.2: 新PDF解析库能够解析测试PDF文件
- **Notes**:
  - 建议使用pdfjs-dist或xpdf等成熟的PDF解析库

## [ ] Task 2: 修复PDF文件处理功能
- **Priority**: P0
- **Depends On**: Task 1
- **Description**:
  - 修改documentProcessor.js文件，使用新的PDF解析库
  - 确保PDF文件能够被正确解析和处理
  - 测试基础理论目录下的PDF文件
- **Acceptance Criteria Addressed**: AC-1, AC-2
- **Test Requirements**:
  - `programmatic` TR-2.1: 系统能够正确解析PDF文件内容
  - `programmatic` TR-2.2: 解析后的PDF内容能够被正确分割
- **Notes**:
  - 确保PDF解析结果的格式与TXT文件一致

## [ ] Task 3: 测试PDF文件向量化
- **Priority**: P0
- **Depends On**: Task 2
- **Description**:
  - 运行文档处理脚本，处理基础理论目录下的PDF文件
  - 验证PDF文件内容能够成功向量化
  - 检查向量存储文件是否包含PDF文件的向量
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `programmatic` TR-3.1: PDF文件内容成功向量化
  - `programmatic` TR-3.2: 向量存储文件包含PDF文件的向量
- **Notes**:
  - 可能需要调整向量存储的保存方式，以处理更大的文件

## [ ] Task 4: 实现RAG测试窗口后端API
- **Priority**: P1
- **Depends On**: Task 3
- **Description**:
  - 在后端服务器中添加RAG测试API端点
  - 实现检索功能，返回检索结果和生成的prompt
  - 确保API能够处理用户查询并返回相关资料
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `programmatic` TR-4.1: API端点能够正常响应
  - `programmatic` TR-4.2: API能够返回检索结果和生成的prompt
- **Notes**:
  - API应返回与LLM模型相同格式的prompt

## [ ] Task 5: 实现RAG测试窗口前端界面
- **Priority**: P1
- **Depends On**: Task 4
- **Description**:
  - 创建一个独立的测试页面
  - 实现用户输入界面和结果展示界面
  - 集成后端API，展示检索结果和生成的prompt
- **Acceptance Criteria Addressed**: AC-3, AC-4
- **Test Requirements**:
  - `human-judgment` TR-5.1: 测试窗口界面美观易用
  - `programmatic` TR-5.2: 前端能够正确调用后端API
- **Notes**:
  - 测试窗口应独立于现有LLM集成，仅测试RAG功能

## [ ] Task 6: 测试和优化
- **Priority**: P2
- **Depends On**: Task 5
- **Description**:
  - 测试PDF文件的向量化效果
  - 测试RAG测试窗口的功能
  - 优化系统性能和用户体验
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3, AC-4
- **Test Requirements**:
  - `human-judgment` TR-6.1: RAG测试窗口功能正常
  - `programmatic` TR-6.2: PDF文件向量化效果良好
- **Notes**:
  - 测试不同类型的查询，验证检索结果的相关性