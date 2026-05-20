import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.knowledgeReference.deleteMany();
  await prisma.compiledWiki.deleteMany();
  await prisma.knowledgeSource.deleteMany();
  await prisma.taskFeedback.deleteMany();
  await prisma.auditEvent.deleteMany();
  await prisma.approvalRequest.deleteMany();
  await prisma.artifact.deleteMany();
  await prisma.taskEdge.deleteMany();
  await prisma.taskNode.deleteMany();
  await prisma.task.deleteMany();
  await prisma.agentDefinition.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  const organization = await prisma.organization.create({
    data: {
      id: "org_swarm",
      name: "Swarm"
    }
  });

  const admin = await prisma.user.create({
    data: {
      id: "user_admin",
      organizationId: organization.id,
      email: "admin@swarm.local",
      name: "预置组织管理员",
      role: "admin",
      passwordHash: "swarm-admin"
    }
  });

  await prisma.user.create({
    data: {
      id: "user_default",
      organizationId: organization.id,
      email: "user@swarm.local",
      name: "普通用户",
      role: "user",
      passwordHash: "swarm-user"
    }
  });

  await prisma.agentDefinition.create({
    data: {
      id: "agent_knowledge",
      organizationId: organization.id,
      name: "知识问答数字员工",
      type: "数字员工",
      responsibility: "回答产品知识问题",
      capabilityTagsJson: JSON.stringify(["知识问答"]),
      toolsJson: JSON.stringify(["mock-knowledge-search"]),
      knowledgeScopeJson: JSON.stringify(["product"]),
      riskLevel: "low",
      inputContract: "问题",
      outputContract: "带引用回答",
      examplesJson: JSON.stringify(["解释主 Agent"]),
      acceptanceJson: JSON.stringify(["包含来源引用"]),
      enabled: true
    }
  });

  const source = await prisma.knowledgeSource.create({
    data: {
      id: "source_product",
      organizationId: organization.id,
      uploadedByUserId: admin.id,
      title: "Swarm 产品知识",
      collection: "product",
      content: "# Swarm 产品知识\n\n主 Agent 是唯一用户入口。",
      version: 1,
      hash: "seed"
    }
  });

  await prisma.compiledWiki.create({
    data: {
      id: "wiki_product",
      sourceId: source.id,
      collection: "product",
      version: 1,
      content: "# Swarm 产品知识\n\n## Agent-readable summary\n\n主 Agent 是唯一用户入口。",
      active: true
    }
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
