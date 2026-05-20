import { describe, expect, it } from "vitest";
import {
  acceptTaskResult,
  createAgentDefinition,
  getTaskHistoryMemory,
  recordTaskFeedback,
  resetSystem,
  seedInitialSystem,
  submitTaskToMainAgent
} from "@/lib/swarm";

describe("任务结果、产物、验收和反馈闭环", () => {
  it("用户验收任务后可以提交反馈并形成任务历史记忆", async () => {
    await resetSystem();
    const seeded = await seedInitialSystem();
    await createAgentDefinition(seeded.admin.id, {
      name: "报告数字员工",
      type: "数字员工",
      responsibility: "生成报告产物",
      capabilityTags: ["报告生成"],
      tools: ["mock-report-tool"],
      knowledgeScope: [],
      riskLevel: "low",
      inputContract: "报告主题",
      outputContract: "报告文件",
      examples: ["生成周报"],
      acceptanceCriteria: ["包含结论"]
    });

    const result = await submitTaskToMainAgent(seeded.user.id, {
      message: "生成一份项目周报",
      requiredCapability: "报告生成"
    });

    expect(result.artifacts[0].name).toBe("报告数字员工-output.md");

    const accepted = await acceptTaskResult(seeded.user.id, result.task.id);
    expect(accepted.status).toBe("已完成");

    await recordTaskFeedback(seeded.user.id, result.task.id, "摘要可用，但下一版需要更短。");
    const memory = await getTaskHistoryMemory(result.task.id);

    expect(memory.feedback.join("\n")).toContain("下一版需要更短");
    expect(memory.finalStatus).toBe("已完成");
  });
});
