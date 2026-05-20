import { describe, expect, it } from "vitest";
import {
  createAgentDefinition,
  getBusinessDag,
  resetSystem,
  seedInitialSystem,
  submitComplexTaskToMainAgent
} from "@/lib/swarm";

describe("复杂任务 DAG：拆分、依赖和业务级进度", () => {
  it("主 Agent 将复杂任务拆成带依赖的 DAG 并展示业务级进度", async () => {
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

    expect(result.task.kind).toBe("复杂任务");
    expect(result.nodes).toHaveLength(2);
    expect(result.edges[0]).toMatchObject({ fromNodeId: result.nodes[0].id, toNodeId: result.nodes[1].id });

    const dag = await getBusinessDag(seeded.user.id, result.task.id);
    expect(dag.nodes.map((node) => node.status)).toEqual(["完成", "完成"]);
    expect(dag.nodes[0].summary).toContain("研究数字员工");
    expect(dag.nodes[1].summary).toContain("PPT 数字员工");
  });
});
