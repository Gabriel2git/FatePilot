# Vercel部署修复计划

## 问题分析

### 错误信息
```
抱歉，AI服务调用失败。请确保环境变量配置正确或稍后重试。
错误详情: 流读取超时: 超过最大尝试次数
```

### 可能的原因
1. **环境变量配置问题** - Vercel上可能缺少必要的环境变量
2. **后端服务问题** - 后端服务可能无法从Vercel访问
3. **API调用问题** - 阿里云百炼API可能无法从Vercel环境访问
4. **网络连接问题** - Vercel与后端服务之间的网络连接可能存在问题

## 修复计划

### [/] Task 1: 检查Vercel环境变量配置
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 检查Vercel项目的环境变量配置
  - 确保DASHSCOPE_API_KEY已正确设置
  - 确保NEXT_PUBLIC_API_URL指向正确的后端地址
- **Success Criteria**: 
  - 所有必要的环境变量都已正确配置
- **Test Requirements**: 
  - `programmatic` TR-1.1: Vercel环境变量配置完整
- **Notes**: 环境变量需要在Vercel控制面板中设置

### [ ] Task 2: 检查后端服务状态
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 检查Render上的后端服务是否正常运行
  - 验证后端API是否可以正常访问
  - 测试健康检查接口
- **Success Criteria**: 
  - 后端服务正常运行
  - API可以正常访问
- **Test Requirements**: 
  - `programmatic` TR-2.1: 后端服务健康检查通过
  - `programmatic` TR-2.2: API接口可以正常响应
- **Notes**: 使用curl或Postman测试后端API

### [ ] Task 3: 检查前端API调用配置
- **Priority**: P0
- **Depends On**: Task 1, Task 2
- **Description**: 
  - 检查前端代码中的API调用配置
  - 确保API_BASE_URL指向正确的后端地址
  - 检查AI API调用的超时设置
- **Success Criteria**: 
  - 前端API调用配置正确
  - 超时设置合理
- **Test Requirements**: 
  - `programmatic` TR-3.1: 前端API配置正确
  - `programmatic` TR-3.2: 超时设置合理
- **Notes**: 检查frontend/src/lib/ai.ts中的API调用配置

### [ ] Task 4: 优化API调用和错误处理
- **Priority**: P1
- **Depends On**: Task 3
- **Description**: 
  - 优化API调用的错误处理
  - 添加超时设置和重试机制
  - 改进错误提示信息
- **Success Criteria**: 
  - API调用更加健壮
  - 错误处理更加完善
- **Test Requirements**: 
  - `programmatic` TR-4.1: API调用可以处理网络错误
  - `programmatic` TR-4.2: 错误提示信息清晰
- **Notes**: 重点优化getLLMResponse函数

### [ ] Task 5: 测试Vercel部署
- **Priority**: P1
- **Depends On**: Task 4
- **Description**: 
  - 重新部署前端到Vercel
  - 测试AI服务调用
  - 验证所有功能是否正常
- **Success Criteria**: 
  - Vercel部署成功
  - AI服务调用正常
  - 所有功能正常工作
- **Test Requirements**: 
  - `programmatic` TR-5.1: Vercel部署成功
  - `programmatic` TR-5.2: AI服务调用成功
  - `human-judgement` TR-5.3: 所有功能正常工作
- **Notes**: 测试时使用真实的命盘数据