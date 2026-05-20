export type UserRole = "admin" | "user";

export type Organization = {
  id: string;
  name: string;
};

export type SwarmUser = {
  id: string;
  organizationId: string;
  email: string;
  name: string;
  role: UserRole;
  password: string;
};

export type WorkbenchSummary = {
  currentUser: Pick<SwarmUser, "id" | "name" | "email" | "role">;
  organization: Organization;
  navigation: string[];
  shell: {
    primarySurface: "主 Agent 对话入口";
    secondarySurface: "任务状态面板";
    visualLanguage: "Apple 工作台视觉语言";
  };
};

export const DEFAULT_ADMIN_CREDENTIALS = {
  email: "admin@swarm.local",
  password: "swarm-admin"
} as const;

export const DEFAULT_USER_CREDENTIALS = {
  email: "user@swarm.local",
  password: "swarm-user"
} as const;

export type AgentType = "员工分身" | "数字员工" | "机器人员工" | "外部智能体";

export type AgentDefinition = {
  id: string;
  organizationId: string;
  name: string;
  type: AgentType;
  responsibility: string;
  capabilityTags: string[];
  tools: string[];
  knowledgeScope: string[];
  riskLevel: "low" | "medium" | "high";
  inputContract: string;
  outputContract: string;
  examples: string[];
  acceptanceCriteria: string[];
  enabled: boolean;
};

export type AgentDefinitionInput = Omit<AgentDefinition, "id" | "organizationId" | "enabled">;

export type TaskStatus = "草拟" | "待确认" | "执行中" | "待验收" | "已完成" | "已取消" | "失败";
export type TaskKind = "简单任务" | "复杂任务";
export type TaskNodeStatus = "待执行" | "阻塞" | "执行中" | "待批准" | "待验收" | "完成" | "失败" | "取消";

export type SwarmTask = {
  id: string;
  organizationId: string;
  createdByUserId: string;
  title: string;
  kind: TaskKind;
  status: TaskStatus;
  summary: string;
};

export type TaskNode = {
  id: string;
  taskId: string;
  objective: string;
  assignedAgentId: string;
  status: TaskNodeStatus;
  summary: string;
};

export type TaskEdge = {
  taskId: string;
  fromNodeId: string;
  toNodeId: string;
};

export type ArtifactRef = {
  id: string;
  taskId: string;
  name: string;
  kind: "markdown" | "presentation" | "log" | "other";
  uri: string;
};

export type TaskExecutionResult = {
  task: SwarmTask;
  nodes: TaskNode[];
  artifacts: ArtifactRef[];
  approvalRequest?: ApprovalRequest;
  adapterResult?: AdapterResult;
  summary: string;
};

export type TaskDagResult = TaskExecutionResult & {
  edges: TaskEdge[];
};

export type TaskHistoryMemory = {
  taskId: string;
  finalStatus: TaskStatus;
  feedback: string[];
};

export type ApprovalRequest = {
  id: string;
  taskId: string;
  nodeId: string;
  requestedByUserId: string;
  status: "pending" | "approved" | "rejected";
  riskReason: string;
};

export type AdapterResult = {
  adapter: "模拟外部执行适配器";
  status: "executed";
  detail: string;
};

export type AuditEvent = {
  id: string;
  taskId: string;
  type: string;
  message: string;
};

export type KnowledgeSource = {
  id: string;
  organizationId: string;
  uploadedByUserId: string;
  title: string;
  collection: string;
  content: string;
  version: number;
  hash: string;
};

export type CompiledWiki = {
  id: string;
  sourceId: string;
  collection: string;
  version: number;
  content: string;
  active: boolean;
};

export type KnowledgeReference = {
  taskId: string;
  sourceId: string;
  wikiId: string;
  collection: string;
  usedCompiledWiki: boolean;
};

type SwarmState = {
  organizations: Organization[];
  users: SwarmUser[];
  agents: AgentDefinition[];
  tasks: SwarmTask[];
  nodes: TaskNode[];
  edges: TaskEdge[];
  artifacts: ArtifactRef[];
  feedback: { taskId: string; userId: string; message: string }[];
  approvals: ApprovalRequest[];
  auditEvents: AuditEvent[];
  knowledgeSources: KnowledgeSource[];
  compiledWikis: CompiledWiki[];
  knowledgeReferences: KnowledgeReference[];
};

const state: SwarmState = {
  organizations: [],
  users: [],
  agents: [],
  tasks: [],
  nodes: [],
  edges: [],
  artifacts: [],
  feedback: [],
  approvals: [],
  auditEvents: [],
  knowledgeSources: [],
  compiledWikis: [],
  knowledgeReferences: []
};

function createId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

export async function resetSystem() {
  state.organizations = [];
  state.users = [];
  state.agents = [];
  state.tasks = [];
  state.nodes = [];
  state.edges = [];
  state.artifacts = [];
  state.feedback = [];
  state.approvals = [];
  state.auditEvents = [];
  state.knowledgeSources = [];
  state.compiledWikis = [];
  state.knowledgeReferences = [];
}

export async function seedInitialSystem() {
  const organization: Organization = {
    id: createId("org"),
    name: "Swarm"
  };
  const admin: SwarmUser = {
    id: createId("user"),
    organizationId: organization.id,
    email: DEFAULT_ADMIN_CREDENTIALS.email,
    name: "预置组织管理员",
    role: "admin",
    password: DEFAULT_ADMIN_CREDENTIALS.password
  };
  const user: SwarmUser = {
    id: createId("user"),
    organizationId: organization.id,
    email: DEFAULT_USER_CREDENTIALS.email,
    name: "普通用户",
    role: "user",
    password: DEFAULT_USER_CREDENTIALS.password
  };

  state.organizations.push(organization);
  state.users.push(admin, user);

  return { organization, admin, user };
}

export async function authenticateUser(email: string, password: string) {
  const user = state.users.find((candidate) => candidate.email === email && candidate.password === password);
  if (!user) {
    throw new Error("用户名或密码错误");
  }
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
}

export async function getWorkbenchSummary(userId: string): Promise<WorkbenchSummary> {
  const user = state.users.find((candidate) => candidate.id === userId);
  if (!user) {
    throw new Error("用户不存在");
  }
  const organization = state.organizations.find((candidate) => candidate.id === user.organizationId);
  if (!organization) {
    throw new Error("组织不存在");
  }

  const navigation = ["主 Agent", "任务", "知识库"];
  if (user.role === "admin") {
    navigation.push("Agent Registry", "运行策略", "完整执行审计日志");
  }

  return {
    currentUser: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    organization,
    navigation,
    shell: {
      primarySurface: "主 Agent 对话入口",
      secondarySurface: "任务状态面板",
      visualLanguage: "Apple 工作台视觉语言"
    }
  };
}

function requireAdmin(userId: string) {
  const user = state.users.find((candidate) => candidate.id === userId);
  if (!user) {
    throw new Error("用户不存在");
  }
  if (user.role !== "admin") {
    throw new Error("需要管理员权限");
  }
  return user;
}

export async function createAgentDefinition(adminUserId: string, input: AgentDefinitionInput) {
  const admin = requireAdmin(adminUserId);
  if (!input.name.trim()) {
    throw new Error("Agent 名称不能为空");
  }
  if (!input.responsibility.trim()) {
    throw new Error("职责边界不能为空");
  }
  if (input.capabilityTags.length === 0) {
    throw new Error("至少需要一个能力标签");
  }

  const agent: AgentDefinition = {
    id: createId("agent"),
    organizationId: admin.organizationId,
    enabled: true,
    ...input
  };
  state.agents.push(agent);
  return agent;
}

export async function generateAgentDefinitionDraft(adminUserId: string, input: { description: string }) {
  requireAdmin(adminUserId);
  const capability = input.description.includes("会议纪要") ? "会议纪要" : "通用任务";
  return {
    name: `${capability}数字员工`,
    type: "数字员工" as AgentType,
    responsibility: `根据管理员描述执行${capability}相关工作`,
    capabilityTags: [capability],
    tools: [`mock-${capability}`],
    knowledgeScope: [],
    riskLevel: "low" as const,
    inputContract: `${capability}任务目标`,
    outputContract: `${capability}结构化结果`,
    examples: [input.description],
    acceptanceCriteria: ["输出可解释摘要", "保留执行审计"]
  };
}

export async function saveAgentDefinitionDraft(adminUserId: string, draft: AgentDefinitionInput) {
  return createAgentDefinition(adminUserId, draft);
}

export async function setAgentEnabled(adminUserId: string, agentId: string, enabled: boolean) {
  requireAdmin(adminUserId);
  const agent = state.agents.find((candidate) => candidate.id === agentId);
  if (!agent) {
    throw new Error("Agent 定义不存在");
  }
  agent.enabled = enabled;
  return agent;
}

export async function listDispatchableAgents(filter: { capability?: string } = {}) {
  return state.agents.filter((agent) => {
    if (!agent.enabled) {
      return false;
    }
    if (filter.capability && !agent.capabilityTags.includes(filter.capability)) {
      return false;
    }
    return true;
  });
}

export async function submitTaskToMainAgent(
  userId: string,
  input: { message: string; requiredCapability?: string; useKnowledge?: boolean }
): Promise<TaskExecutionResult> {
  const user = state.users.find((candidate) => candidate.id === userId);
  if (!user) {
    throw new Error("用户不存在");
  }
  const matchingAgents = await listDispatchableAgents({
    capability: input.requiredCapability
  });
  const assignedAgent = matchingAgents[0];
  if (!assignedAgent) {
    throw new Error("没有可调度的被调度 Agent");
  }

  const isHighRisk = assignedAgent.riskLevel === "high";
  const task: SwarmTask = {
    id: createId("task"),
    organizationId: user.organizationId,
    createdByUserId: user.id,
    title: input.message,
    kind: "简单任务",
    status: isHighRisk ? "待确认" : "待验收",
    summary: isHighRisk
      ? `主 Agent 已识别 ${assignedAgent.name} 的高风险动作，等待用户批准`
      : `主 Agent 已将简单任务直派给 ${assignedAgent.name}`
  };
  const knowledgeReference = input.useKnowledge ? selectKnowledgeReferenceForAgent(task.id, assignedAgent) : undefined;
  const node: TaskNode = {
    id: createId("node"),
    taskId: task.id,
    objective: input.message,
    assignedAgentId: assignedAgent.id,
    status: isHighRisk ? "待批准" : "完成",
    summary: isHighRisk
      ? `${assignedAgent.name} 请求执行高风险动作，等待用户批准。`
      : `${assignedAgent.name} 返回可解释摘要：已根据 ${assignedAgent.responsibility} 完成处理。${
          knowledgeReference ? ` 引用了 ${findSourceTitle(knowledgeReference.sourceId)}。` : ""
        }`
  };

  state.tasks.push(task);
  state.nodes.push(node);
  appendAudit(task.id, "task.created", `主 Agent 创建${task.kind}`);

  if (isHighRisk) {
    const approvalRequest: ApprovalRequest = {
      id: createId("approval"),
      taskId: task.id,
      nodeId: node.id,
      requestedByUserId: user.id,
      status: "pending",
      riskReason: "高风险动作需要用户批准"
    };
    state.approvals.push(approvalRequest);
    appendAudit(task.id, "approval.requested", approvalRequest.riskReason);
    return {
      task,
      nodes: [node],
      artifacts: [],
      approvalRequest,
      summary: node.summary
    };
  }

  const artifact = createAgentArtifact(task.id, assignedAgent.name);
  state.artifacts.push(artifact);
  appendAudit(task.id, "task.completed", node.summary);

  return {
    task,
    nodes: [node],
    artifacts: [artifact],
    summary: node.summary
  };
}

export async function approveHighRiskAction(userId: string, approvalRequestId: string) {
  const approval = findApprovalForUser(userId, approvalRequestId);
  approval.status = "approved";
  const task = findTaskForUser(userId, approval.taskId);
  const node = state.nodes.find((candidate) => candidate.id === approval.nodeId);
  if (!node) {
    throw new Error("任务节点不存在");
  }
  node.status = "完成";
  node.summary = "模拟外部执行适配器已执行高风险动作。";
  task.status = "待验收";
  task.summary = "高风险动作已批准并通过模拟外部执行适配器执行。";
  const adapterResult: AdapterResult = {
    adapter: "模拟外部执行适配器",
    status: "executed",
    detail: node.summary
  };
  appendAudit(task.id, "approval.approved", "用户批准高风险动作");
  appendAudit(task.id, "adapter.executed", adapterResult.detail);
  return { task, adapterResult };
}

export async function rejectHighRiskAction(userId: string, approvalRequestId: string) {
  const approval = findApprovalForUser(userId, approvalRequestId);
  approval.status = "rejected";
  const task = findTaskForUser(userId, approval.taskId);
  task.status = "失败";
  task.summary = "用户拒绝高风险动作，任务停止。";
  const node = state.nodes.find((candidate) => candidate.id === approval.nodeId);
  if (node) {
    node.status = "失败";
  }
  appendAudit(task.id, "approval.rejected", "用户拒绝高风险动作");
  return task;
}

export async function getAuditEvents(taskId: string) {
  return state.auditEvents.filter((event) => event.taskId === taskId);
}

export async function submitComplexTaskToMainAgent(
  userId: string,
  input: { message: string; requiredCapabilities: string[] }
): Promise<TaskDagResult> {
  const user = state.users.find((candidate) => candidate.id === userId);
  if (!user) {
    throw new Error("用户不存在");
  }
  if (input.requiredCapabilities.length < 2) {
    throw new Error("复杂任务至少需要两个能力");
  }

  const task: SwarmTask = {
    id: createId("task"),
    organizationId: user.organizationId,
    createdByUserId: user.id,
    title: input.message,
    kind: "复杂任务",
    status: "待验收",
    summary: "主 Agent 已拆分任务 DAG 并完成业务级执行。"
  };
  state.tasks.push(task);
  appendAudit(task.id, "dag.created", "主 Agent 创建任务 DAG");

  const nodes: TaskNode[] = [];
  const artifacts: ArtifactRef[] = [];
  for (const capability of input.requiredCapabilities) {
    const agent = (await listDispatchableAgents({ capability }))[0];
    if (!agent) {
      throw new Error(`没有可调度的 ${capability} Agent`);
    }
    const node: TaskNode = {
      id: createId("node"),
      taskId: task.id,
      objective: `${capability}: ${input.message}`,
      assignedAgentId: agent.id,
      status: "完成",
      summary: `${agent.name} 完成 ${capability} 节点。`
    };
    nodes.push(node);
    artifacts.push(createAgentArtifact(task.id, agent.name));
    appendAudit(task.id, "node.completed", node.summary);
  }

  const edges: TaskEdge[] = nodes.slice(1).map((node, index) => ({
    taskId: task.id,
    fromNodeId: nodes[index].id,
    toNodeId: node.id
  }));

  state.nodes.push(...nodes);
  state.edges.push(...edges);
  state.artifacts.push(...artifacts);

  return {
    task,
    nodes,
    edges,
    artifacts,
    summary: task.summary
  };
}

export async function getBusinessDag(userId: string, taskId: string) {
  findTaskForUser(userId, taskId);
  return {
    taskId,
    nodes: state.nodes
      .filter((node) => node.taskId === taskId)
      .map((node) => ({
        id: node.id,
        status: node.status,
        summary: node.summary
      })),
    edges: state.edges.filter((edge) => edge.taskId === taskId)
  };
}

export async function getExecutionDag(adminUserId: string, taskId: string) {
  requireAdmin(adminUserId);
  const task = state.tasks.find((candidate) => candidate.id === taskId);
  if (!task) {
    throw new Error("任务不存在");
  }
  return {
    task,
    nodes: state.nodes
      .filter((node) => node.taskId === taskId)
      .map((node) => {
        const agent = state.agents.find((candidate) => candidate.id === node.assignedAgentId);
        return {
          id: node.id,
          status: node.status,
          objective: node.objective,
          summary: node.summary,
          assignedAgentId: node.assignedAgentId,
          assignedAgentName: agent?.name ?? "未知 Agent",
          toolCalls: agent?.tools ?? []
        };
      }),
    edges: state.edges.filter((edge) => edge.taskId === taskId),
    auditEvents: state.auditEvents.filter((event) => event.taskId === taskId)
  };
}

export async function failTaskNode(adminUserId: string, nodeId: string, reason: string) {
  requireAdmin(adminUserId);
  const node = findNode(nodeId);
  node.status = "失败";
  node.summary = reason;
  const task = state.tasks.find((candidate) => candidate.id === node.taskId);
  if (task) {
    task.status = "失败";
    task.summary = reason;
  }
  appendAudit(node.taskId, "node.failed", reason);
  return node;
}

export async function retryTaskNode(adminUserId: string, nodeId: string) {
  requireAdmin(adminUserId);
  const node = findNode(nodeId);
  node.status = "完成";
  node.summary = `节点重试成功：${node.objective}`;
  const task = state.tasks.find((candidate) => candidate.id === node.taskId);
  if (task) {
    task.status = "待验收";
    task.summary = "失败节点已重试完成。";
  }
  appendAudit(node.taskId, "node.retried", node.summary);
  return node;
}

export async function requestTaskReplan(adminUserId: string, taskId: string, reason: string) {
  requireAdmin(adminUserId);
  const task = state.tasks.find((candidate) => candidate.id === taskId);
  if (!task) {
    throw new Error("任务不存在");
  }
  task.status = "执行中";
  task.summary = `主 Agent 已根据管理员要求重规划：${reason}`;
  appendAudit(task.id, "task.replanned", task.summary);
  return task;
}

export async function uploadMarkdownKnowledgeSource(
  userId: string,
  input: { title: string; collection: string; content: string }
) {
  const user = state.users.find((candidate) => candidate.id === userId);
  if (!user) {
    throw new Error("用户不存在");
  }
  const source: KnowledgeSource = {
    id: createId("source"),
    organizationId: user.organizationId,
    uploadedByUserId: user.id,
    title: input.title,
    collection: input.collection,
    content: input.content,
    version: 1,
    hash: await sha256(input.content)
  };
  const wiki: CompiledWiki = {
    id: createId("wiki"),
    sourceId: source.id,
    collection: source.collection,
    version: 1,
    content: compileMarkdownForAgents(source),
    active: true
  };
  state.knowledgeSources.push(source);
  state.compiledWikis.push(wiki);
  return source;
}

export async function getCompiledWiki(sourceId: string) {
  const wiki = state.compiledWikis.find((candidate) => candidate.sourceId === sourceId && candidate.active);
  if (!wiki) {
    throw new Error("编译后 Wiki 不存在");
  }
  return wiki;
}

export async function getKnowledgeReferences(taskId: string) {
  return state.knowledgeReferences.filter((reference) => reference.taskId === taskId);
}

export async function listAgentDefinitions() {
  return [...state.agents];
}

export async function listKnowledgeSources() {
  return state.knowledgeSources.map((source) => {
    const wiki = state.compiledWikis.find((candidate) => candidate.sourceId === source.id && candidate.active);
    return {
      ...source,
      compiledWiki: wiki
    };
  });
}

export async function listTasks() {
  return state.tasks.map((task) => ({
    ...task,
    nodes: state.nodes.filter((node) => node.taskId === task.id),
    artifacts: state.artifacts.filter((artifact) => artifact.taskId === task.id),
    approvals: state.approvals.filter((approval) => approval.taskId === task.id)
  }));
}

export async function acceptTaskResult(userId: string, taskId: string) {
  const task = findTaskForUser(userId, taskId);
  if (task.status !== "待验收") {
    throw new Error("只有待验收任务可以验收");
  }
  task.status = "已完成";
  return task;
}

export async function recordTaskFeedback(userId: string, taskId: string, message: string) {
  findTaskForUser(userId, taskId);
  state.feedback.push({ taskId, userId, message });
}

export async function getTaskHistoryMemory(taskId: string): Promise<TaskHistoryMemory> {
  const task = state.tasks.find((candidate) => candidate.id === taskId);
  if (!task) {
    throw new Error("任务不存在");
  }
  return {
    taskId,
    finalStatus: task.status,
    feedback: state.feedback.filter((entry) => entry.taskId === taskId).map((entry) => entry.message)
  };
}

function findTaskForUser(userId: string, taskId: string) {
  const task = state.tasks.find((candidate) => candidate.id === taskId);
  if (!task) {
    throw new Error("任务不存在");
  }
  const user = state.users.find((candidate) => candidate.id === userId);
  if (!user || user.organizationId !== task.organizationId) {
    throw new Error("无权访问任务");
  }
  return task;
}

function findApprovalForUser(userId: string, approvalRequestId: string) {
  const approval = state.approvals.find((candidate) => candidate.id === approvalRequestId);
  if (!approval) {
    throw new Error("批准请求不存在");
  }
  findTaskForUser(userId, approval.taskId);
  return approval;
}

function findNode(nodeId: string) {
  const node = state.nodes.find((candidate) => candidate.id === nodeId);
  if (!node) {
    throw new Error("任务节点不存在");
  }
  return node;
}

function createAgentArtifact(taskId: string, agentName: string): ArtifactRef {
  return {
    id: createId("artifact"),
    taskId,
    name: `${agentName}-output.md`,
    kind: "markdown",
    uri: `swarm://tasks/${taskId}/artifacts/output`
  };
}

function appendAudit(taskId: string, type: string, message: string) {
  state.auditEvents.push({
    id: createId("audit"),
    taskId,
    type,
    message
  });
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function compileMarkdownForAgents(source: KnowledgeSource) {
  const normalized = source.content
    .replace(/^#+\s*/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return `# ${source.title}\n\n## Agent-readable summary\n\n${normalized}\n\n## Source\n\n- sourceId: ${source.id}\n- collection: ${source.collection}\n- version: ${source.version}`;
}

function selectKnowledgeReferenceForAgent(taskId: string, agent: AgentDefinition) {
  const wiki = state.compiledWikis.find(
    (candidate) => candidate.active && agent.knowledgeScope.includes(candidate.collection)
  );
  if (!wiki) {
    if (state.compiledWikis.some((candidate) => candidate.active)) {
      appendAudit(taskId, "knowledge.denied", `${agent.name} 的知识范围不允许检索现有编译后 Wiki`);
    }
    return undefined;
  }
  const source = state.knowledgeSources.find((candidate) => candidate.id === wiki.sourceId);
  if (!source) {
    return undefined;
  }
  const reference: KnowledgeReference = {
    taskId,
    sourceId: source.id,
    wikiId: wiki.id,
    collection: wiki.collection,
    usedCompiledWiki: true
  };
  state.knowledgeReferences.push(reference);
  appendAudit(taskId, "knowledge.referenced", `引用编译后 Wiki：${source.title}`);
  return reference;
}

function findSourceTitle(sourceId: string) {
  return state.knowledgeSources.find((source) => source.id === sourceId)?.title ?? "组织共享知识库";
}
