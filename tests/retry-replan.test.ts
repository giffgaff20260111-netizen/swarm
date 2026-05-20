import { describe, expect, it } from "vitest";
import {
  createAgentDefinition,
  failTaskNode,
  getAuditEvents,
  resetSystem,
  requestTaskReplan,
  retryTaskNode,
  seedInitialSystem,
  submitComplexTaskToMainAgent
} from "@/lib/swarm";

describe("节点失败、节点重试和任务重规划", () => {
  it("管理员可以重试失败节点，也可以要求主 Agent 重规划任务", async () => {
    await resetSystem();
    const seeded = await seedInitialSystem();
    await createAgentDefinition(seeded.admin.id, {
      name: "研究数字员工",
      type: "数字员工",
      responsibility: "调研资料",
      capabilityTags: ["调研"],
      tools: ["mock-research"],
      knowledgeScope: [],
      riskLevel: "low",
      inputContract: "研究问题",
      outputContract: "研究摘要",
      examples: ["调研竞品"],
      acceptanceCriteria: ["包含来源"]
    });
    await createAgentDefinition(seeded.admin.id, {
      name: "PPT 数字员工",
      type: "数字员工",
      responsibility: "生成演示文稿",
      capabilityTags: ["PPT"],
      tools: ["mock-presentation"],
      knowledgeScope: [],
      riskLevel: "low",
      inputContract: "研究摘要",
      outputContract: "演示文稿",
      examples: ["生成汇报 PPT"],
      acceptanceCriteria: ["包含结构"]
    });
    const result = await submitComplexTaskToMainAgent(seeded.user.id, {
      message: "调研竞品并生成汇报 PPT",
      requiredCapabilities: ["调研", "PPT"]
    });

    await failTaskNode(seeded.admin.id, result.nodes[1].id, "PPT 生成器临时失败");
    const retried = await retryTaskNode(seeded.admin.id, result.nodes[1].id);
    const replanned = await requestTaskReplan(seeded.admin.id, result.task.id, "改为先生成大纲再生成 PPT");

    expect(retried.status).toBe("完成");
    expect(replanned.summary).toContain("重规划");
    expect((await getAuditEvents(result.task.id)).map((event) => event.type)).toEqual(
      expect.arrayContaining(["node.failed", "node.retried", "task.replanned"])
    );
  });
});
