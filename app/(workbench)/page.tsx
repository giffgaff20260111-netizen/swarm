import React from "react";
import {
  acceptTaskResult,
  approveHighRiskAction,
  createAgentDefinition,
  generateAgentDefinitionDraft,
  getAuditEvents,
  getBusinessDag,
  getExecutionDag,
  getWorkbenchSummary,
  listAgentDefinitions,
  listKnowledgeSources,
  listTasks,
  resetSystem,
  retryTaskNode,
  saveAgentDefinitionDraft,
  seedInitialSystem,
  submitComplexTaskToMainAgent,
  submitTaskToMainAgent,
  uploadMarkdownKnowledgeSource
} from "@/lib/swarm";

export const dynamic = "force-dynamic";

async function buildDemoState() {
  await resetSystem();
  const seeded = await seedInitialSystem();
  const adminId = seeded.admin.id;
  const userId = seeded.user.id;

  await uploadMarkdownKnowledgeSource(adminId, {
    title: "Swarm 产品知识",
    collection: "product",
    content: "# Swarm 产品知识\n\n主 Agent 是唯一用户入口，被调度 Agent 只能通过结构化任务节点协议参与任务。"
  });

  await createAgentDefinition(adminId, {
    name: "知识问答数字员工",
    type: "数字员工",
    responsibility: "回答产品知识问题",
    capabilityTags: ["知识问答"],
    tools: ["mock-knowledge-search"],
    knowledgeScope: ["product"],
    riskLevel: "low",
    inputContract: "问题",
    outputContract: "带引用回答",
    examples: ["解释主 Agent"],
    acceptanceCriteria: ["包含来源引用"]
  });
  await createAgentDefinition(adminId, {
    name: "研究数字员工",
    type: "数字员工",
    responsibility: "调研资料",
    capabilityTags: ["调研"],
    tools: ["mock-research"],
    knowledgeScope: ["product"],
    riskLevel: "low",
    inputContract: "研究问题",
    outputContract: "研究摘要",
    examples: ["调研竞品"],
    acceptanceCriteria: ["包含来源"]
  });
  await createAgentDefinition(adminId, {
    name: "PPT 数字员工",
    type: "数字员工",
    responsibility: "生成演示文稿",
    capabilityTags: ["PPT"],
    tools: ["mock-presentation"],
    knowledgeScope: ["product"],
    riskLevel: "low",
    inputContract: "研究摘要",
    outputContract: "演示文稿",
    examples: ["生成汇报 PPT"],
    acceptanceCriteria: ["包含结构"]
  });
  await createAgentDefinition(adminId, {
    name: "机械臂机器人员工",
    type: "机器人员工",
    responsibility: "执行机械臂动作",
    capabilityTags: ["机械臂控制"],
    tools: ["mock-robot-arm"],
    knowledgeScope: [],
    riskLevel: "high",
    inputContract: "动作描述",
    outputContract: "执行结果",
    examples: ["移动机械臂到安全位置"],
    acceptanceCriteria: ["动作被确认执行"]
  });

  const simple = await submitTaskToMainAgent(userId, {
    message: "解释主 Agent 的定位",
    requiredCapability: "知识问答",
    useKnowledge: true
  });
  await acceptTaskResult(userId, simple.task.id);

  const highRisk = await submitTaskToMainAgent(userId, {
    message: "控制机械臂移动到 A 点",
    requiredCapability: "机械臂控制"
  });
  if (highRisk.approvalRequest) {
    await approveHighRiskAction(userId, highRisk.approvalRequest.id);
  }

  const complex = await submitComplexTaskToMainAgent(userId, {
    message: "调研竞品并生成汇报 PPT",
    requiredCapabilities: ["调研", "PPT"]
  });
  await retryTaskNode(adminId, complex.nodes[1].id);

  const draft = await generateAgentDefinitionDraft(adminId, {
    description: "创建一个能整理会议纪要的数字员工"
  });
  await saveAgentDefinitionDraft(adminId, draft);

  return {
    seeded,
    adminWorkbench: await getWorkbenchSummary(adminId),
    userWorkbench: await getWorkbenchSummary(userId),
    agents: await listAgentDefinitions(),
    tasks: await listTasks(),
    knowledgeSources: await listKnowledgeSources(),
    businessDag: await getBusinessDag(userId, complex.task.id),
    executionDag: await getExecutionDag(adminId, complex.task.id),
    auditEvents: await getAuditEvents(complex.task.id)
  };
}

export default async function WorkbenchPage() {
  const demo = await buildDemoState();
  const primaryTask = demo.tasks[0];
  const highRiskTask = demo.tasks.find((task) => task.title.includes("机械臂"));
  const complexTask = demo.tasks.find((task) => task.kind === "复杂任务");

  return (
    <main className="page">
      <div className="shell">
        <header className="topbar">
          <div className="brand">
            <div className="mark">S</div>
            <div>
              <strong>Swarm</strong>
              <div className="muted">自运行组织系统</div>
            </div>
          </div>
          <nav className="nav" aria-label="主导航">
            {demo.adminWorkbench.navigation.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </nav>
        </header>

        <section className="hero">
          <div>
            <h1>Swarm 任务工作台</h1>
            <p>
              用户只和主 Agent 交互。简单任务直派给一个被调度 Agent，复杂任务拆分为任务 DAG，并由 Orchestrator
              追踪进度、批准、产物和审计。
            </p>
          </div>
          <span className="badge">{demo.userWorkbench.shell.visualLanguage}</span>
        </section>

        <section className="grid" aria-label="核心工作台">
          <div className="panel">
            <div className="tile-head">
              <h2>主 Agent 对话入口</h2>
              <span className="status">单一入口</span>
            </div>
            <div className="chat">
              <div className="bubble primary">解释主 Agent 的定位，并引用组织共享知识库。</div>
              <div className="bubble">{primaryTask?.summary}</div>
              <div className="bubble primary">控制机械臂移动到 A 点。</div>
              <div className="bubble">{highRiskTask?.summary}</div>
            </div>
            <div className="input-row">
              <input aria-label="任务输入" defaultValue="调研竞品并生成汇报 PPT" />
              <button className="button" type="button">发送</button>
            </div>
          </div>

          <div className="panel">
            <div className="tile-head">
              <h2>任务状态面板</h2>
              <span className="status">{complexTask?.status}</span>
            </div>
            <div className="tile">
              <h3>{complexTask?.title}</h3>
              <p className="muted">{complexTask?.summary}</p>
              <div className="node-list">
                {demo.businessDag.nodes.map((node, index) => (
                  <div className="node" key={node.id}>
                    <span className="dot">{index + 1}</span>
                    <span>{node.summary}</span>
                    <span className="status">{node.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="tile-head">
              <h2>完整执行审计日志</h2>
              <span className="status">管理员</span>
            </div>
            <div className="list">
              {demo.executionDag.nodes.map((node) => (
                <div className="row" key={node.id}>
                  <div>
                    <strong>{node.assignedAgentName}</strong>
                    <div className="muted">{node.objective}</div>
                  </div>
                  <span className="status">{node.status}</span>
                </div>
              ))}
              {demo.auditEvents.slice(0, 3).map((event) => (
                <div className="row" key={event.id}>
                  <span>{event.type}</span>
                  <span className="muted">{event.message}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="sections" aria-label="治理模块">
          <div className="panel">
            <div className="tile-head">
              <h2>Agent Registry</h2>
              <span className="status">{demo.agents.length} 个 Agent</span>
            </div>
            <div className="list">
              {demo.agents.slice(0, 5).map((agent) => (
                <div className="row" key={agent.id}>
                  <div>
                    <strong>{agent.name}</strong>
                    <div className="muted">{agent.type} · {agent.capabilityTags.join("、")}</div>
                  </div>
                  <span className="status">{agent.enabled ? "启用" : "禁用"}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="tile-head">
              <h2>组织共享知识库</h2>
              <span className="status">自动知识编译</span>
            </div>
            <div className="list">
              {demo.knowledgeSources.map((source) => (
                <div className="row" key={source.id}>
                  <div>
                    <strong>{source.title}</strong>
                    <div className="muted">{source.collection} · v{source.version}</div>
                  </div>
                  <span className="status">{source.compiledWiki?.active ? "Wiki 已启用" : "未编译"}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="tile-head">
              <h2>运行策略</h2>
              <span className="status">动作级策略</span>
            </div>
            <div className="stack">
              <div className="tile">
                <h3>高风险动作</h3>
                <p className="muted">机械臂、外部消息、第三方写入需要用户批准。</p>
              </div>
              <div className="tile">
                <h3>TaskNode 调用协议</h3>
                <p className="muted">子 Agent 返回结构化结果、产物引用、证据和审计事件。</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
