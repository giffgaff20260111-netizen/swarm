import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import WorkbenchPage from "@/app/(workbench)/page";
import { resetSystem } from "@/lib/swarm";

describe("任务工作台 UI", () => {
  it("展示主 Agent、任务状态面板、Agent Registry、知识库和审计入口", async () => {
    await resetSystem();
    render(await WorkbenchPage());

    expect(screen.getByRole("heading", { name: "Swarm 任务工作台" })).toBeInTheDocument();
    expect(screen.getByText("主 Agent 对话入口")).toBeInTheDocument();
    expect(screen.getByText("任务状态面板")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Agent Registry" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "组织共享知识库" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "完整执行审计日志" })).toBeInTheDocument();
  });
});
