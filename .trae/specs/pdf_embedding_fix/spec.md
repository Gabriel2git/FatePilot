# 紫微斗数项目 - PDF向量化问题修复与RAG测试窗口实现产品需求文档

## Overview
- **Summary**: 修复基础理论目录下PDF文件的向量化问题，并实现一个单独的测试窗口来验证RAG功能，无需接入LLM模型，仅测试检索结果和生成的prompt。
- **Purpose**: 解决PDF文件无法被正确处理和向量化的问题，确保所有紫微斗数相关资料都能被纳入RAG系统，同时提供一个独立的测试窗口来验证RAG功能的效果。
- **Target Users**: 紫微斗数项目的开发人员和测试人员。

## Goals
- 修复PDF文件的解析和向量化问题
- 确保基础理论目录下所有PDF文件能被正确处理
- 实现一个独立的RAG测试窗口
- 验证RAG检索结果的准确性和相关性

## Non-Goals (Out of Scope)
- 实现完整的资料管理后台系统
- 支持除PDF和TXT外的其他文档格式
- 接入新的LLM模型

## Background & Context
- 项目已实现基本的RAG功能，但PDF文件处理存在问题
- 基础理论目录下有两个PDF文件需要处理：大德山人-紫微斗数精成.pdf 和 陆斌兆紫微斗数斗数讲义评注.pdf
- 当前系统只能处理TXT文件，PDF文件被跳过

## Functional Requirements
- **FR-1**: PDF文件解析功能 - 能够正确解析PDF文件内容
- **FR-2**: PDF文件向量化功能 - 能够将PDF文件内容向量化并存储
- **FR-3**: RAG测试窗口 - 实现一个独立的测试界面，用于测试RAG功能
- **FR-4**: 检索结果展示 - 在测试窗口中展示检索结果和生成的prompt

## Non-Functional Requirements
- **NFR-1**: 性能要求 - PDF解析和向量化过程应在合理时间内完成
- **NFR-2**: 可靠性 - 系统能够处理不同类型的PDF文件
- **NFR-3**: 可扩展性 - 支持后续添加更多PDF文件

## Constraints
- **Technical**: 使用Node.js和现有的向量存储系统
- **Dependencies**: 需要一个可靠的PDF解析库

## Assumptions
- PDF文件内容是可解析的，没有加密或损坏
- 服务器有足够的内存和处理能力来处理PDF文件

## Acceptance Criteria

### AC-1: PDF文件解析功能
- **Given**: 系统中有PDF格式的紫微斗数资料
- **When**: 运行文档处理脚本
- **Then**: 系统能够正确解析PDF文件内容
- **Verification**: `programmatic`
- **Notes**: 解析结果应包含PDF中的文本内容

### AC-2: PDF文件向量化功能
- **Given**: PDF文件已解析完成
- **When**: 执行向量化操作
- **Then**: PDF文件内容成功向量化并存储
- **Verification**: `programmatic`
- **Notes**: 向量应与TXT文件的向量格式一致

### AC-3: RAG测试窗口
- **Given**: 系统已启动
- **When**: 访问测试窗口
- **Then**: 测试窗口能够正常显示并接受用户输入
- **Verification**: `human-judgment`
- **Notes**: 测试窗口应包含输入框和结果展示区域

### AC-4: 检索结果展示
- **Given**: 用户在测试窗口中输入查询
- **When**: 系统执行检索操作
- **Then**: 测试窗口能够展示检索结果和生成的prompt
- **Verification**: `human-judgment`
- **Notes**: 展示内容应包括检索到的资料片段和最终生成的prompt

## Open Questions
- [ ] 选择哪种PDF解析库来替代当前的pdf-parse？
- [ ] 测试窗口应该集成到现有的前端界面中还是作为独立页面？