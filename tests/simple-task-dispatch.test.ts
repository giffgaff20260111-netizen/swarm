import { describe, expect, it } from "vitest";
import {
  createAgentDefinition,
  resetSystem,
  seedInitialSystem,
  submitTaskToMainAgent
} from "@/lib/swarm";

describe("简单任务直派：主 Agent 到被调度 Agent", () => {
  it("主 Agent 将简单任务直派给匹配的被调度 Agent 并返回可解释摘要", async () => {
    await resetSystem();
    const seeded = await seedInitialSystem();
    const agent = await createAgentDefinition(seeded.admin.id, {
      name: "文档整理数字员工",
      type: "数字员工",
      responsibility: "整理文档并输出摘要",
      capabilityTags: ["文档整理"],
      tools: ["mock-document-tool"],
      knowledgeScope: [],
      riskLevel: "low",
      inputContract: "文档整理目标",
      outputContract: "结构化摘要",
      examples: ["总结会议纪要"],
      acceptanceCriteria: ["给出摘要", "列出下一步"]
    });

    const result = await submitTaskToMainAgent(seeded.user.id, {
      message: "请整理这份项目说明，输出摘要和下一步",
      requiredCapability: "文档整理"
    });

    expect(result.task.kind).toBe("简单任务");
    expect(result.task.status).toBe("待验收");
    expect(result.nodes).toHaveLength(1);
    expect(result.nodes[0].assignedAgentId).toBe(agent.id);
    expect(result.nodes[0].status).toBe("完成");
    expect(result.summary).toContain("文档整理数字员工");
    expect(result.summary).toContain("可解释摘要");
  });
});
