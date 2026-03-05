# 紫微斗数项目克隆方案 - 实施计划

## [x] Task 1: 克隆项目到ziwei_project/cursor目录
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 复制e:\TraeFile\ziwei_project目录下的所有文件和子目录到e:\TraeFile\ziwei_project\cursor
  - 排除node_modules、.git和.venv目录，避免复制大型依赖文件
  - 确保所有项目文件都被正确复制
- **Acceptance Criteria Addressed**: AC-1, AC-2
- **Test Requirements**:
  - `programmatic` TR-1.1: 验证ziwei_project/cursor目录存在且包含所有必要的项目文件
  - `programmatic` TR-1.2: 验证ziwei_project/cursor目录结构与原项目一致
- **Notes**: 排除node_modules目录以节省空间和时间，克隆后需要重新安装依赖

## [x] Task 2: 克隆项目到ziwei_project/trae目录
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 复制e:\TraeFile\ziwei_project目录下的所有文件和子目录到e:\TraeFile\ziwei_project\trae
  - 排除node_modules、.git和.venv目录，避免复制大型依赖文件
  - 确保所有项目文件都被正确复制
- **Acceptance Criteria Addressed**: AC-1, AC-2
- **Test Requirements**:
  - `programmatic` TR-2.1: 验证ziwei_project/trae目录存在且包含所有必要的项目文件
  - `programmatic` TR-2.2: 验证ziwei_project/trae目录结构与原项目一致
- **Notes**: 排除node_modules目录以节省空间和时间，克隆后需要重新安装依赖

## [x] Task 3: 安装依赖并验证项目可运行性
- **Priority**: P1
- **Depends On**: Task 1, Task 2
- **Description**: 
  - 在ziwei_project/cursor目录中安装依赖
  - 在ziwei_project/trae目录中安装依赖
  - 验证两个项目都能正常启动
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `programmatic` TR-3.1: 验证ziwei_project/cursor目录中的依赖安装成功
  - `programmatic` TR-3.2: 验证ziwei_project/trae目录中的依赖安装成功
  - `programmatic` TR-3.3: 验证两个项目都能正常启动
- **Notes**: 使用npm install命令安装依赖，然后尝试启动项目验证其可运行性
  - 安装依赖步骤：
    1. 在cursor目录中运行：npm install
    2. 在cursor/frontend目录中运行：npm install
    3. 在trae目录中运行：npm install
    4. 在trae/frontend目录中运行：npm install
  - 启动项目步骤：
    1. 在cursor目录中运行：node src/server.js
    2. 在cursor/frontend目录中运行：npm run dev
    3. 在trae目录中运行：node src/server.js
    4. 在trae/frontend目录中运行：npm run dev