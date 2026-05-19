# Use OpenAI Agents SDK for agent runtime

第一版采用 OpenAI Agents SDK TypeScript 作为主 Agent 和被调度 Agent 的运行时。它负责 agent、tools、handoffs、guardrails 和 tracing 等应用内 Agent 能力；Claude Code 这类编码代理不作为 Swarm 的主运行时，只能在未来作为外部智能体或执行适配器接入。这个选择把组织任务编排留在产品系统内，避免把主流程绑定到面向代码修改和命令执行的 CLI/harness。
