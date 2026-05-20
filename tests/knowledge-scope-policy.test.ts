import { describe, expect, it } from "vitest";
import {
  createAgentDefinition,
  getAuditEvents,
  getKnowledgeReferences,
  resetSystem,
  seedInitialSystem,
  submitTaskToMainAgent,
  uploadMarkdownKnowledgeSource
} from "@/lib/swarm";

describe("Agent 知识范围和访问策略", () => {
  it("Agent 只能引用知识范围内的编译后 Wiki，越权检索会被审计", async () => {
    await resetSystem();
    const seeded = await seedInitialSystem();
    await uploadMarkdownKnowledgeSource(seeded.admin.id, {
      title: "财务制度",
      collection: "finance",
      content: "# 财务制度\n\n敏感预算信息。"
    });
    await createAgentDefinition(seeded.admin.id, {
      name: "产品问答数字员工",
      type: "数字员工",
      responsibility: "回答产品问题",
      capabilityTags: ["知识问答"],
      tools: ["mock-knowledge-search"],
      knowledgeScope: ["product"],
      riskLevel: "low",
      inputContract: "问题",
      outputContract: "回答",
      examples: ["解释产品"],
      acceptanceCriteria: ["不越权"]
    });

    const result = await submitTaskToMainAgent(seeded.user.id, {
      message: "读取财务制度",
      requiredCapability: "知识问答",
      useKnowledge: true
    });

    expect(await getKnowledgeReferences(result.task.id)).toHaveLength(0);
    expect((await getAuditEvents(result.task.id)).map((event) => event.type)).toContain("knowledge.denied");
  });
});
