# Use rule-driven orchestration with LLM assistance

第一版主 Agent 采用规则驱动编排，并让 LLM 辅助理解和表达。LLM 用于理解用户输入、生成任务草案、步骤建议、可解释摘要和验收说明；任务状态流转、用户批准、高风险动作拦截、Agent 类型约束、审计记录和失败边界由规则代码控制。这个选择牺牲一部分完全自治体验，换取可测试、可审计和可治理的任务闭环。
