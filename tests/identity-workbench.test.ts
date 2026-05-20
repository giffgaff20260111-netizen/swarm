import { describe, expect, it } from "vitest";
import { authenticateUser, resetSystem, seedInitialSystem, getWorkbenchSummary } from "@/lib/swarm";

describe("登录、组织和任务工作台壳", () => {
  it("初始化后提供预置组织管理员、普通用户和任务工作台摘要", async () => {
    await resetSystem();
    const seeded = await seedInitialSystem();

    expect(seeded.organization.name).toBe("Swarm");
    expect(seeded.admin.role).toBe("admin");
    expect(seeded.user.role).toBe("user");

    const adminWorkbench = await getWorkbenchSummary(seeded.admin.id);
    const userWorkbench = await getWorkbenchSummary(seeded.user.id);

    expect(adminWorkbench.currentUser.role).toBe("admin");
    expect(adminWorkbench.navigation).toContain("完整执行审计日志");
    expect(userWorkbench.currentUser.role).toBe("user");
    expect(userWorkbench.navigation).not.toContain("完整执行审计日志");
    expect(userWorkbench.shell.primarySurface).toBe("主 Agent 对话入口");
    expect(userWorkbench.shell.secondarySurface).toBe("任务状态面板");
  });

  it("默认管理员账号可以用邮箱和密码登录", async () => {
    await resetSystem();
    await seedInitialSystem();

    const admin = await authenticateUser("admin@swarm.local", "swarm-admin");

    expect(admin.role).toBe("admin");
    await expect(authenticateUser("admin@swarm.local", "wrong")).rejects.toThrow("用户名或密码错误");
  });
});
