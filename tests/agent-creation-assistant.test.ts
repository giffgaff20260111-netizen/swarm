import { describe, expect, it } from "vitest";
import {
  generateAgentDefinitionDraft,
  listDispatchableAgents,
  resetSystem,
  saveAgentDefinitionDraft,
  seedInitialSystem
} from "@/lib/swarm";

describe("Agent 创建助手：交互式生成 Agent 定义草案", () => {
  it("创建助手生成草案，只有管理员保存后才进入可调度 Agent Registry", async () => {
    await resetSystem();
    const seeded = await seedInitialSystem();

    const draft = await generateAgentDefinitionDraft(seeded.admin.id, {
      description: "创建一个能整理会议纪要的数字员工"
    });

    expect(draft.name).toContain("会议纪要");
    expect(draft.type).toBe("数字员工");
    expect(await listDispatchableAgents({ capability: "会议纪要" })).toHaveLength(0);

    const saved = await saveAgentDefinitionDraft(seeded.admin.id, draft);

    expect(saved.enabled).toBe(true);
    expect(await listDispatchableAgents({ capability: "会议纪要" })).toHaveLength(1);
  });
});
