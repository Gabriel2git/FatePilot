# 紫微斗数项目 - RAG 功能集成实现计划

## [x] Task 1: 资料存储结构设计
- **Priority**: P0
- **Depends On**: None
- **Description**:
  - 设计资料存储目录结构
  - 确定资料分类方式
  - 建立资料管理机制
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic` TR-1.1: 资料存储目录结构正确创建
  - `human-judgment` TR-1.2: 资料分类逻辑合理
- **Notes**:
  - 在 `backend/data/documents/` 目录下存储资料
  - 按主题分类存储，如 `基础理论`、`实战案例`、`名家解读` 等

## [x] Task 2: 文档处理模块实现
- **Priority**: P0
- **Depends On**: Task 1
- **Description**:
  - 实现 PDF 文档解析功能
  - 实现 TXT 文档解析功能
  - 文本分割和预处理
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic` TR-2.1: PDF 文档内容正确提取
  - `programmatic` TR-2.2: TXT 文档内容正确提取
  - `human-judgment` TR-2.3: 文本分割结果合理
- **Notes**:
  - 使用 `pdf-parse` 处理 PDF
  - 文本分割长度建议 500-1000 字符

## [x] Task 3: 向量存储实现
- **Priority**: P0
- **Depends On**: Task 2
- **Description**:
  - 实现文本向量化功能
  - 构建向量索引
  - 实现相似度计算
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `programmatic` TR-3.1: 文本向量化成功
  - `programmatic` TR-3.2: 向量索引构建完成
- **Notes**:
  - 使用阿里云百炼multimodal-embedding-v1模型进行向量化
  - 实现余弦相似度计算

## [x] Task 4: 检索功能实现
- **Priority**: P0
- **Depends On**: Task 3
- **Description**:
  - 实现相似度搜索
  - 实现上下文构建
  - 实现检索结果排序
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `programmatic` TR-4.1: 检索结果相关性高
  - `human-judgment` TR-4.2: 检索结果排序合理
- **Notes**:
  - 检索结果数量建议 3-5 条
  - 集成阿里云百炼重排序 API

## [x] Task 5: 与现有 AI 功能集成
- **Priority**: P0
- **Depends On**: Task 4
- **Description**:
  - 修改现有 AI 聊天接口
  - 集成 RAG 检索结果
  - 优化提示词模板
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `human-judgment` TR-5.1: AI 回答包含资料中的相关信息
  - `human-judgment` TR-5.2: 回答质量优于之前版本
- **Notes**:
  - 在 `lib/ai.ts` 中修改提示词生成逻辑
  - 将检索结果作为上下文添加到提示词中

## [x] Task 6: 测试和优化
- **Priority**: P1
- **Depends On**: Task 5
- **Description**:
  - 测试 RAG 功能的准确性
  - 优化检索算法
  - 优化向量存储性能
- **Acceptance Criteria Addressed**: AC-3, AC-4, AC-5
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
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `human-judgment` TR-7.1: 界面易用性好
  - `programmatic` TR-7.2: 资料上传功能正常
- **Notes**:
  - 在前端添加资料管理页面
  - 实现资料版本控制