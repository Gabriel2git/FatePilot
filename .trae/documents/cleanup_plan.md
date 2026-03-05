# 紫微斗数项目清理计划

## 项目功能分析

### 核心功能
1. **紫微斗数排盘** - 完整的命盘计算与展示，包括主星、辅星、小星等信息
2. **AI 命理师** - 基于 AI 模型的智能命理分析
3. **响应式设计** - 完美适配电脑端和手机端
4. **真太阳时校验** - 基于经度的真太阳时计算
5. **四化计算** - 完整的四化（禄、权、科、忌）计算
6. **大运流年** - 包含大限和流年信息

### 项目结构
- **frontend/** - React + Next.js 前端
- **src/** - Node.js 后端
- **配置文件** - package.json, .gitignore 等
- **文档** - README.md, DEVLOG.md 等
- **.trae/** - 项目文档和规格文件

## 清理计划

### [x] Task 1: 分析前端目录结构
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 分析 frontend 目录下的所有文件和子目录
  - 识别核心功能相关的文件
  - 识别可能不必要的文件
- **Success Criteria**: 
  - 明确前端目录中每个文件的功能
  - 识别出可删除的文件
- **Test Requirements**: 
  - `human-judgement` TR-1.1: 确认所有核心功能文件都被保留
  - `human-judgement` TR-1.2: 确认可删除的文件不影响核心功能
- **Notes**: 重点关注测试文件和临时文件
  - 核心功能文件：src/app、src/components、src/hooks、src/lib、src/types 目录下的文件
  - 可删除的文件：test-*.js 文件（测试文件）

### [x] Task 2: 分析后端目录结构
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 分析 src 目录下的所有文件
  - 识别核心功能相关的文件
  - 识别可能不必要的文件
- **Success Criteria**: 
  - 明确后端目录中每个文件的功能
  - 识别出可删除的文件
- **Test Requirements**: 
  - `human-judgement` TR-2.1: 确认所有核心功能文件都被保留
  - `human-judgement` TR-2.2: 确认可删除的文件不影响核心功能
- **Notes**: 重点关注测试文件和临时文件
  - 核心功能文件：server.js（后端服务入口）
  - 可删除的文件：无

### [x] Task 3: 分析根目录文件
- **Priority**: P1
- **Depends On**: None
- **Description**: 
  - 分析根目录下的所有文件
  - 识别核心功能相关的文件
  - 识别可能不必要的文件
- **Success Criteria**: 
  - 明确根目录中每个文件的功能
  - 识别出可删除的文件
- **Test Requirements**: 
  - `human-judgement` TR-3.1: 确认所有核心功能文件都被保留
  - `human-judgement` TR-3.2: 确认可删除的文件不影响核心功能
- **Notes**: 重点关注配置文件和文档
  - 核心功能文件：package.json、package-lock.json、README.md、.gitignore
  - 可删除的文件：requirements.txt（Python依赖文件，项目现在使用Node.js）

### [x] Task 4: 删除不必要的文件
- **Priority**: P1
- **Depends On**: Task 1, Task 2, Task 3
- **Description**: 
  - 根据前面的分析，删除不必要的文件
  - 确保删除的文件不影响核心功能
- **Success Criteria**: 
  - 成功删除不必要的文件
  - 项目仍然可以正常运行
- **Test Requirements**: 
  - `programmatic` TR-4.1: 项目可以正常启动
  - `programmatic` TR-4.2: 核心功能仍然正常工作
- **Notes**: 删除前备份重要文件
  - 删除的文件：frontend/test-*.js 文件和根目录的 requirements.txt

### [x] Task 5: 验证项目功能
- **Priority**: P0
- **Depends On**: Task 4
- **Description**: 
  - 启动项目并验证所有核心功能
  - 确保删除文件后项目仍然正常运行
- **Success Criteria**: 
  - 项目可以正常启动
  - 所有核心功能正常工作
- **Test Requirements**: 
  - `programmatic` TR-5.1: 后端服务正常启动
  - `programmatic` TR-5.2: 前端服务正常启动
  - `human-judgement` TR-5.3: 核心功能正常工作
- **Notes**: 测试紫微斗数排盘和AI命理分析功能
  - 后端服务已成功启动：http://localhost:3001
  - 前端服务已成功启动：http://localhost:3000
  - 项目可以正常运行