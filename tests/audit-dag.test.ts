import { describe, expect, it } from "vitest";
import {
  createAgentDefinition,
  getExecutionDag,
  resetSystem,
  seedInitialSystem,
  submitComplexTaskToMainAgent
} from "@/lib/swarm";

describe("执行级 DAG 和完整执行审计日志", () => {
  it("管理员能查看执行级 DAG，普通用户不能查看完整审计", async () => {
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

    const executionDag = await getExecutionDag(seeded.admin.id, result.task.id);

    expect(executionDag.nodes[0].assignedAgentName).toBe("研究数字员工");
    expect(executionDag.auditEvents.map((event) => event.type)).toContain("dag.created");
    expect(executionDag.auditEvents.map((event) => event.message).join("\n")).not.toContain("hidden chain-of-thought");

    await expect(getExecutionDag(seeded.user.id, result.task.id)).rejects.toThrow("需要管理员权限");
  });
});
