# 紫微斗数项目 - RAG 功能集成实现计划

## 1. 项目现状分析
- **当前技术栈**：Next.js 14.1.0 + React 18 + TypeScript (前端)，Node.js + Express (后端)
- **核心功能**：紫微斗数排盘、AI 命理分析
- **AI 集成**：已集成基本的 AI 聊天功能

## 2. RAG 功能需求
- **资料类型**：PDF 和 TXT 格式的紫微斗数相关资料
- **功能目标**：让 AI 能够基于这些资料提供更准确、更专业的命理分析
- **集成时机**：在现有 AI 聊天功能基础上进行增强

## [x] Task 1: 资料存储结构设计
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 设计资料存储目录结构
  - 确定资料分类方式
  - 建立资料管理机制
- **Success Criteria**:
  - 资料存储结构清晰，便于管理和访问
  - 支持 PDF 和 TXT 格式的资料
- **Test Requirements**:
  - `programmatic` TR-1.1: 资料存储目录结构正确创建
  - `human-judgment` TR-1.2: 资料分类逻辑合理
- **Notes**:
  - 建议在 `backend/data/documents/` 目录下存储资料
  - 按主题分类存储，如 `基础理论`、`实战案例`、`名家解读` 等

## [x] Task 2: 文档处理模块实现
- **Priority**: P0
- **Depends On**: Task 1
- **Description**:
  - 实现 PDF 文档解析功能
  - 实现 TXT 文档解析功能
  - 文本分割和预处理
- **Success Criteria**:
  - 能够正确解析 PDF 和 TXT 文档内容
  - 文本分割合理，适合向量存储
- **Test Requirements**:
  - `programmatic` TR-2.1: PDF 文档内容正确提取
  - `programmatic` TR-2.2: TXT 文档内容正确提取
  - `human-judgment` TR-2.3: 文本分割结果合理
- **Notes**:
  - 可使用 `pdf-parse` 或 `pdfjs` 处理 PDF
  - 文本分割长度建议 500-1000 字符

## [x] Task 3: 向量存储实现
- **Priority**: P0
- **Depends On**: Task 2
- **Description**:
  - 选择向量数据库
  - 实现文本向量化
  - 构建向量索引
- **Success Criteria**:
  - 文本成功向量化并存储
  - 向量索引构建完成
- **Test Requirements**:
  - `programmatic` TR-3.1: 文本向量化成功
  - `programmatic` TR-3.2: 向量索引构建完成
- **Notes**:
  - 使用模拟向量和余弦相似度计算
  - 集成阿里云百炼的重排序 API

## [x] Task 4: 检索功能实现
- **Priority**: P0
- **Depends On**: Task 3
- **Description**:
  - 实现相似度搜索
  - 实现上下文构建
  - 实现检索结果排序
- **Success Criteria**:
  - 能够根据用户查询检索相关资料
  - 检索结果排序合理
- **Test Requirements**:
  - `programmatic` TR-4.1: 检索结果相关性高
  - `human-judgment` TR-4.2: 检索结果排序合理
- **Notes**:
  - 检索结果数量建议 3-5 条
  - 可使用余弦相似度进行排序

## [/] Task 5: 与现有 AI 功能集成
- **Priority**: P0
- **Depends On**: Task 4
- **Description**:
  - 修改现有 AI 聊天接口
  - 集成 RAG 检索结果
  - 优化提示词模板
- **Success Criteria**:
  - AI 能够基于检索到的资料回答问题
  - 回答质量显著提升
- **Test Requirements**:
  - `human-judgment` TR-5.1: AI 回答包含资料中的相关信息
  - `human-judgment` TR-5.2: 回答质量优于之前版本
- **Notes**:
  - 在 `lib/ai.ts` 中修改提示词生成逻辑
  - 将检索结果作为上下文添加到提示词中

## [ ] Task 6: 测试和优化
- **Priority**: P1
- **Depends On**: Task 5
- **Description**:
  - 测试 RAG 功能的准确性
  - 优化检索算法
  - 优化向量存储性能
- **Success Criteria**:
  - RAG 功能稳定运行
  - 回答准确性和相关性高
- **Test Requirements**:
  - `human-judgment` TR-6.1: 回答准确性高
  - `programmatic` TR-6.2: 响应时间合理
- **Notes**:
  - 测试不同类型的问题
  - 优化向量存储和检索性能

## [ ] Task 7: 资料管理界面
- **Priority**: P2
- **Depends On**: Task 5
- **Description**:
  - 实现资料上传界面
  - 实现资料管理功能
  - 实现资料更新机制
- **Success Criteria**:
  - 用户能够方便地上传和管理资料
  - 资料更新后向量存储自动更新
- **Test Requirements**:
  - `human-judgment` TR-7.1: 界面易用性好
  - `programmatic` TR-7.2: 资料上传功能正常
- **Notes**:
  - 在前端添加资料管理页面
  - 实现资料版本控制

## 3. 集成时机
- **开发阶段**：在完成 Task 1-5 后，即可集成到现有代码中
- **测试阶段**：在本地环境进行测试，确保功能正常
- **部署阶段**：功能稳定后部署到生产环境

## 4. 测试资料建议
- **PDF 资料**：紫微斗数相关书籍、论文、研究报告
- **TXT 资料**：命理案例、实战经验、名家解读
- **测试方法**：
  1. 将测试资料放入 `backend/data/documents/` 目录
  2. 运行文档处理脚本生成向量存储
  3. 启动应用进行测试
  4. 验证 AI 回答是否包含资料中的相关信息

## 5. 技术栈建议
- **文档处理**：pdf-parse, fs (Node.js)
- **文本向量化**：模拟向量 + 余弦相似度计算
- **向量存储**：内存存储 + JSON 文件持久化
- **检索算法**：余弦相似度 + 阿里云百炼重排序 API
- **集成方式**：修改现有 AI 聊天接口，添加检索步骤

## 6. 阿里云百炼 API 配置
- **API Key**：从环境变量 `DASHSCOPE_API_KEY` 获取
- **重排序 API**：`https://dashscope.aliyuncs.com/api/v1/services/rerank/text-rerank/text-rerank`
- **模型**：`qwen3-vl-rerank`
- **请求格式**：
  ```json
  {
    "model": "qwen3-vl-rerank",
    "input": {
      "query": "查询文本",
      "documents": ["文档1", "文档2", ...]
    },
    "parameters": {
      "return_documents": true,
      "top_n": 5
    }
  }
  ```

## 7. 预期效果
- AI 能够基于专业资料提供更准确的命理分析
- 回答内容更加丰富和专业
- 用户体验显著提升
- 系统能够持续学习和更新知识
