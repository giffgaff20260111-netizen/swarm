import { describe, expect, it } from "vitest";
import {
  approveHighRiskAction,
  createAgentDefinition,
  getAuditEvents,
  rejectHighRiskAction,
  resetSystem,
  seedInitialSystem,
  submitTaskToMainAgent
} from "@/lib/swarm";

describe("高风险动作、用户批准和模拟执行适配器", () => {
  it("高风险动作需要用户批准后才通过模拟执行适配器执行", async () => {
    await resetSystem();
    const seeded = await seedInitialSystem();
    await createAgentDefinition(seeded.admin.id, {
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

    const result = await submitTaskToMainAgent(seeded.user.id, {
      message: "控制机械臂移动到 A 点",
      requiredCapability: "机械臂控制"
    });

    expect(result.task.status).toBe("待确认");
    expect(result.approvalRequest?.riskReason).toContain("高风险动作");

    const approved = await approveHighRiskAction(seeded.user.id, result.approvalRequest!.id);

    expect(approved.task.status).toBe("待验收");
    expect(approved.adapterResult?.adapter).toBe("模拟外部执行适配器");
    expect((await getAuditEvents(result.task.id)).map((event) => event.type)).toContain("adapter.executed");
  });

  it("用户拒绝高风险动作后任务进入失败并记录审计", async () => {
    await resetSystem();
    const seeded = await seedInitialSystem();
    await createAgentDefinition(seeded.admin.id, {
      name: "外部消息智能体",
      type: "外部智能体",
      responsibility: "发送外部消息",
      capabilityTags: ["外部消息"],
      tools: ["mock-im"],
      knowledgeScope: [],
      riskLevel: "high",
      inputContract: "消息内容",
      outputContract: "发送结果",
      examples: ["通知客户"],
      acceptanceCriteria: ["消息被发送"]
    });

    const result = await submitTaskToMainAgent(seeded.user.id, {
      message: "给外部客户发送项目延期通知",
      requiredCapability: "外部消息"
    });

    const rejected = await rejectHighRiskAction(seeded.user.id, result.approvalRequest!.id);

    expect(rejected.status).toBe("失败");
    expect((await getAuditEvents(result.task.id)).map((event) => event.type)).toContain("approval.rejected");
  });
});
