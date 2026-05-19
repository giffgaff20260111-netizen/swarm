# Use raw sources, compiled wiki, and retrieval index for knowledge

第一版组织知识库采用 Raw Sources、Compiled Wiki 和 Retrieval Index 三层结构。用户上传或接入的原始材料保留为可追溯事实来源，系统用 LLM 自动编译成面向 Agent 阅读的 Wiki 页面并直接启用，同时维护检索索引用于任务执行时引用相关片段。这个选择比直接把原始目录注入 Agent 或只做原始 RAG 更重，也不设置管理员审核发布流程；它依靠版本、引用、审计、重新编译和回滚能力来治理自动编译带来的误读风险。
