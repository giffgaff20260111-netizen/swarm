import { describe, expect, it } from "vitest";
import {
  getCompiledWiki,
  resetSystem,
  seedInitialSystem,
  uploadMarkdownKnowledgeSource
} from "@/lib/swarm";

describe("组织共享知识库：Markdown 原始知识源到自动编译 Wiki", () => {
  it("上传 Markdown 后保留原始知识源并自动生成启用的编译后 Wiki", async () => {
    await resetSystem();
    const seeded = await seedInitialSystem();

    const source = await uploadMarkdownKnowledgeSource(seeded.admin.id, {
      title: "产品介绍",
      collection: "product",
      content: "# 产品介绍\n\nSwarm 用主 Agent 调度被调度 Agent。"
    });
    const wiki = await getCompiledWiki(source.id);

    expect(source.version).toBe(1);
    expect(source.hash).toHaveLength(64);
    expect(wiki.active).toBe(true);
    expect(wiki.version).toBe(1);
    expect(wiki.content).toContain("主 Agent");
    expect(wiki.sourceId).toBe(source.id);
  });
});
