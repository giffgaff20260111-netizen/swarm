import { describe, expect, it } from "vitest";
import {
  createAgentDefinition,
  getKnowledgeReferences,
  resetSystem,
  seedInitialSystem,
  submitTaskToMainAgent,
  uploadMarkdownKnowledgeSource
} from "@/lib/swarm";

describe("知识检索索引和任务引用知识", () => {
  it("任务默认引用编译后 Wiki，并记录可回查原始知识源的引用", async () => {
    await resetSystem();
    const seeded = await seedInitialSystem();
    const source = await uploadMarkdownKnowledgeSource(seeded.admin.id, {
      title: "Swarm 产品知识",
      collection: "product",
      content: "# Swarm 产品知识\n\n主 Agent 是唯一用户入口。"
    });
    await createAgentDefinition(seeded.admin.id, {
      name: "知识问答数字员工",
      type: "数字员工",
      responsibility: "回答产品知识问题",
      capabilityTags: ["知识问答"],
      tools: ["mock-knowledge-search"],
      knowledgeScope: ["product"],
      riskLevel: "low",
      inputContract: "问题",
      outputContract: "带引用回答",
      examples: ["解释主 Agent"],
      acceptanceCriteria: ["包含来源引用"]
    });

    const result = await submitTaskToMainAgent(seeded.user.id, {
      message: "解释主 Agent 的定位",
      requiredCapability: "知识问答",
      useKnowledge: true
    });
    const references = await getKnowledgeReferences(result.task.id);

    expect(result.summary).toContain("Swarm 产品知识");
    expect(references[0]).toMatchObject({
      taskId: result.task.id,
      sourceId: source.id,
      collection: "product",
      usedCompiledWiki: true
    });
  });
});
