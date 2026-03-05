# 紫微斗数项目克隆方案 - 产品需求文档

## Overview
- **Summary**: 为紫微斗数项目创建两个独立的开发环境，分别用于Cursor IDE和Trae IDE，实现并行开发和测试。
- **Purpose**: 允许在不同IDE中同时开发和测试项目，提高开发效率和灵活性。
- **Target Users**: 项目开发者，需要在不同IDE环境中工作的团队成员。

## Goals
- 创建两个独立的项目副本，分别命名为ziwei_project_cursor和ziwei_project_trae
- 确保两个副本包含完整的项目文件和结构
- 保持项目的功能完整性，确保两个副本都能正常运行
- 提供清晰的目录结构，便于识别和管理不同IDE的开发环境

## Non-Goals (Out of Scope)
- 修改项目的核心功能或代码结构
- 集成新的依赖或功能
- 部署或发布项目
- 处理版本控制或分支管理

## Background & Context
- 当前项目位于e:\TraeFile\ziwei_project目录
- 需要为不同IDE创建独立的开发环境，避免IDE之间的配置冲突
- 保持项目结构一致，便于代码同步和管理

## Functional Requirements
- **FR-1**: 克隆现有项目到新目录ziwei_project/cursor
- **FR-2**: 克隆现有项目到新目录ziwei_project/trae
- **FR-3**: 确保两个克隆副本包含完整的项目文件和目录结构
- **FR-4**: 验证两个副本的可运行性

## Non-Functional Requirements
- **NFR-1**: 克隆过程应保持文件完整性，不丢失任何文件
- **NFR-2**: 克隆后的项目结构应与原项目保持一致
- **NFR-3**: 操作应在合理时间内完成，避免过长的等待时间

## Constraints
- **Technical**: 操作系统为Windows，文件系统路径使用Windows格式
- **Dependencies**: 依赖于文件系统的复制功能

## Assumptions
- 原项目目录结构完整，包含所有必要的文件
- 目标目录不存在，需要创建
- 系统有足够的磁盘空间来存储两个项目副本

## Acceptance Criteria

### AC-1: 项目克隆完成
- **Given**: 原项目位于e:\TraeFile\ziwei_project
- **When**: 执行克隆操作
- **Then**: 两个新目录ziwei_project_cursor和ziwei_project_trae被创建，包含完整的项目文件
- **Verification**: `programmatic`

### AC-2: 目录结构一致性
- **Given**: 克隆操作完成
- **When**: 检查新目录的结构
- **Then**: 新目录的结构与原项目完全一致
- **Verification**: `programmatic`

### AC-3: 项目可运行性
- **Given**: 克隆操作完成
- **When**: 尝试启动项目
- **Then**: 两个克隆副本都能正常启动和运行
- **Verification**: `programmatic`

## Open Questions
- [ ] 是否需要复制node_modules目录，还是在克隆后重新安装依赖？
- [ ] 是否需要修改任何配置文件以适应新的目录结构？