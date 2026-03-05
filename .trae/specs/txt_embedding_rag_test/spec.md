# 紫微斗数项目 - TXT文件向量化与RAG测试窗口实现产品需求文档

## Overview
- **Summary**: 为紫微斗数项目实现TXT文件的向量化功能，并创建一个单独的RAG测试窗口，用于测试RAG功能的检索效果和生成的prompt。
- **Purpose**: 解决PDF文件解析的复杂性，专注于TXT文件的处理，并提供一个专门的测试界面来验证RAG功能的效果。
- **Target Users**: 紫微斗数爱好者、命理分析师、对紫微斗数感兴趣的用户。

## Goals
- 实现TXT文件的向量化功能
- 创建一个单独的RAG测试窗口
- 验证RAG功能的检索效果
- 确保系统能够处理所有TXT文件

## Non-Goals (Out of Scope)
- 处理PDF文件
- 实现资料管理的完整后台系统
- 支持除TXT外的其他文档格式

## Background & Context
- 项目已集成基本的RAG功能
- 用户已将所有资料替换为TXT格式
- 需要一个专门的测试界面来验证RAG功能的效果

## Functional Requirements
- **FR-1**: TXT文件处理功能 - 能够解析和处理TXT格式的紫微斗数相关资料
- **FR-2**: 向量存储功能 - 能够将TXT文件向量化并存储，支持相似度搜索
- **FR-3**: RAG测试窗口后端API - 提供API端点用于测试RAG功能
- **FR-4**: RAG测试窗口前端界面 - 提供一个单独的界面用于测试RAG功能

## Non-Functional Requirements
- **NFR-1**: 性能要求 - 检索响应时间不超过2秒
- **NFR-2**: 可靠性 - 系统能够处理文档解析和API调用失败的情况
- **NFR-3**: 可扩展性 - 支持后续添加更多资料和优化检索算法
- **NFR-4**: 安全性 - API密钥安全存储，不暴露在代码中

## Constraints
- **Technical**: 使用Node.js和Express作为后端，Next.js作为前端
- **Business**: 利用现有的阿里云百炼API进行向量化和重排序
- **Dependencies**: 依赖multimodal-embedding-v1模型进行向量化

## Assumptions
- 用户已将所有资料替换为TXT格式
- 测试资料已准备就绪并放置在指定目录
- 现有RAG功能正常运行

## Acceptance Criteria

### AC-1: TXT文件处理功能
- **Given**: 系统中有TXT格式的紫微斗数资料
- **When**: 运行文档处理脚本
- **Then**: 系统能够正确解析文档内容并分割成合理的文本块
- **Verification**: `programmatic`
- **Notes**: 文本分割长度建议500-1000字符

### AC-2: 向量存储功能
- **Given**: 文档已解析完成
- **When**: 执行向量化操作
- **Then**: 文本成功向量化并存储，向量索引构建完成
- **Verification**: `programmatic`
- **Notes**: 使用阿里云百炼multimodal-embedding-v1模型进行向量化

### AC-3: RAG测试窗口后端API
- **Given**: 向量存储已构建完成
- **When**: 用户输入查询
- **Then**: API能够返回检索结果和生成的prompt
- **Verification**: `programmatic`
- **Notes**: API应返回与LLM模型相同格式的prompt

### AC-4: RAG测试窗口前端界面
- **Given**: 后端API已实现
- **When**: 用户访问测试窗口
- **Then**: 界面能够显示检索结果和生成的prompt
- **Verification**: `human-judgment`
- **Notes**: 测试窗口应独立于现有LLM集成，仅测试RAG功能

## Open Questions
- [ ] 如何处理大量TXT文件的向量化？
- [ ] RAG测试窗口的具体设计和布局？
- [ ] 如何优化检索结果的相关性？