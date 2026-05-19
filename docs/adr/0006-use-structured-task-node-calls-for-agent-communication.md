# Use structured task node calls for agent communication

主 Agent 和被调度 Agent 之间采用结构化 TaskNode 调用协议通信，而不是自由对话式 agent 群聊或 handoff 接管用户会话。简单任务中，被调度 Agent 可以作为 typed tool/runner 被主 Agent 直接调用；复杂任务中，主 Agent 生成任务 DAG，Orchestrator 逐节点调用对应被调度 Agent，并将 TaskNode 状态、结果、产物引用和审计事件写入数据库。这个选择让任务进度、依赖、失败重试、权限判断和用户可见摘要都能被产品系统稳定追踪。
