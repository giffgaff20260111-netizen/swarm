import { describe, expect, it } from "vitest";
import {
  createAgentDefinition,
  listDispatchableAgents,
  resetSystem,
  seedInitialSystem,
  setAgentEnabled
} from "@/lib/swarm";

describe("Agent Registry 和结构化 Agent 定义", () => {
  it("管理员创建被调度 Agent 后，只有启用的 Agent 会进入可调度查询", async () => {
    await resetSystem();
    const seeded = await seedInitialSystem();

    const agent = await createAgentDefinition(seeded.admin.id, {
      name: "市场研究数字员工",
      type: "数字员工",
      responsibility: "整理市场资料并输出结构化摘要",
      capabilityTags: ["市场研究", "资料整理"],
      tools: ["web-search"],
      knowledgeScope: ["market"],
      riskLevel: "low",
      inputContract: "研究主题和目标市场",
      outputContract: "带来源的市场研究摘要",
      examples: ["分析智能体平台竞品"],
      acceptanceCriteria: ["包含主要玩家", "包含机会判断"]
    });

    expect(agent.enabled).toBe(true);
    expect(agent.type).toBe("数字员工");

    expect(await listDispatchableAgents({ capability: "市场研究" })).toHaveLength(1);

    await setAgentEnabled(seeded.admin.id, agent.id, false);

    expect(await listDispatchableAgents({ capability: "市场研究" })).toHaveLength(0);
  });
});
