# Use Next.js full-stack MVP architecture

第一版采用 Next.js App Router、TypeScript、Prisma、SQLite 起步和 Tailwind 来交付全栈 Web MVP。这个选择优先服务主 Agent 任务闭环的快速验证：同仓库减少前后端协作成本，TypeScript 约束任务和策略模型，Prisma 保留未来迁移 Postgres 的空间，SQLite 降低本地开发门槛；暂不采用微服务、Kubernetes、多数据库或插件运行时，因为这些会在核心闭环验证前引入过多基础设施复杂度。
