# Swarm

Swarm 是一个自运行组织系统 MVP。用户只和主 Agent 交互；简单任务直派给一个被调度 Agent，复杂任务拆成任务 DAG，由 Orchestrator 追踪任务节点、批准、产物、知识引用和审计。

## 本地运行

```bash
npm install
npm run dev
```

访问 `http://localhost:3000`。

默认账号：

| 角色 | 用户名 | 密码 |
| --- | --- | --- |
| 管理员 | `admin@swarm.local` | `swarm-admin` |
| 普通用户 | `user@swarm.local` | `swarm-user` |

登录页：`http://localhost:3000/login`

## 验证

```bash
npm test
npm run build
```

当前测试覆盖 13 个 implementation issue 的核心行为：本地账号、任务工作台、Agent Registry、简单任务直派、产物验收、高风险批准、复杂任务 DAG、执行审计、节点重试/重规划、自动知识编译、知识检索、知识范围策略和 Agent 创建助手。

## SQLite / Prisma

Prisma schema 位于 `prisma/schema.prisma`，迁移 SQL 位于 `prisma/migrations/0001_init/migration.sql`。

初始化本地 SQLite：

```bash
DATABASE_URL="file:./dev.db" npx prisma generate
sqlite3 prisma/dev.db < prisma/migrations/0001_init/migration.sql
DATABASE_URL="file:./dev.db" npm run seed
```

应用服务当前通过内存态 deep module 跑通 MVP 行为；Prisma schema 和 seed 已建立持久化模型基线，后续可以把 `lib/swarm.ts` 的 state adapter 替换为 Prisma adapter。
