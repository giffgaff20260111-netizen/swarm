# Use structured agent definitions for dispatch

子 Agent 创建同时支持表单和交互式 Agent 创建助手，但两者最终都产出结构化 Agent 定义，并进入 Agent Registry 后才能被主 Agent 调度。主 Agent 的调度依据 Agent 定义、能力匹配、运行策略和审计事实，而不是让管理员自由编辑主 Agent system prompt 来驱动业务编排。这个选择减少 prompt 漂移和隐式权限绕过，代价是需要维护明确的 Agent 定义 schema 和调度规则。
