# 紫微斗数项目 - RAG 功能集成产品需求文档

## Overview
- **Summary**: 为紫微斗数项目集成RAG（检索增强生成）功能，使AI能够基于PDF和TXT格式的专业资料提供更准确、更专业的命理分析。
- **Purpose**: 解决现有AI聊天功能缺乏专业领域知识的问题，通过检索相关资料提升回答的准确性和专业性。
- **Target Users**: 紫微斗数爱好者、命理分析师、对紫微斗数感兴趣的用户。

## Goals
- 实现PDF和TXT文档的解析和处理
- 构建文本向量存储和检索系统
- 集成RAG功能到现有AI聊天接口
- 提升AI回答的准确性和专业性

## Non-Goals (Out of Scope)
- 实现资料管理的完整后台系统
- 支持除PDF和TXT外的其他文档格式
- 实现实时资料更新和增量向量索引

## Background & Context
- 项目已集成基本的AI聊天功能
- 现有的AI模型缺乏紫微斗数领域的专业知识
- 需要通过RAG技术增强AI的知识储备和回答质量

## Functional Requirements
- **FR-1**: 文档处理功能 - 能够解析PDF和TXT格式的紫微斗数相关资料
- **FR-2**: 向量存储功能 - 能够将文本向量化并存储，支持相似度搜索
- **FR-3**: 检索功能 - 能够根据用户查询检索相关资料并排序
- **FR-4**: RAG集成功能 - 将检索结果集成到现有AI聊天接口
- **FR-5**: 资料存储管理 - 提供合理的资料存储结构和分类机制

## Non-Functional Requirements
- **NFR-1**: 性能要求 - 检索响应时间不超过2秒
- **NFR-2**: 可靠性 - 系统能够处理文档解析和API调用失败的情况
- **NFR-3**: 可扩展性 - 支持后续添加更多资料和优化检索算法
- **NFR-4**: 安全性 - API密钥安全存储，不暴露在代码中

## Constraints
- **Technical**: 使用Node.js和Express作为后端，Next.js作为前端
- **Business**: 利用现有的阿里云百炼API进行重排序
- **Dependencies**: 依赖pdf-parse库处理PDF文档，axios库进行API调用

## Assumptions
- 用户已获取阿里云百炼API密钥
- 测试资料已准备就绪并放置在指定目录
- 现有AI聊天功能正常运行

## Acceptance Criteria

### AC-1: 文档处理功能
- **Given**: 系统中有PDF和TXT格式的紫微斗数资料
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

### AC-3: 检索功能
- **Given**: 向量存储已构建完成
- **When**: 用户输入查询
- **Then**: 系统能够检索相关资料并按相关性排序
- **Verification**: `human-judgment`
- **Notes**: 检索结果数量建议3-5条

### AC-4: RAG集成功能
- **Given**: 检索功能正常运行
- **When**: 用户向AI提问
- **Then**: AI能够基于检索到的资料提供准确的回答
- **Verification**: `human-judgment`
- **Notes**: 回答质量应明显优于未集成RAG之前

### AC-5: 系统稳定性
- **Given**: 系统运行中出现API调用失败或文档解析错误
- **When**: 系统遇到异常情况
- **Then**: 系统能够优雅处理错误并返回合理的结果
- **Verification**: `programmatic`
- **Notes**: 实现错误处理和降级机制

## Open Questions
- [ ] 资料更新后如何自动更新向量存储？
- [ ] 是否需要支持更多文档格式？
- [ ] 如何评估RAG功能的效果提升？