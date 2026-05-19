# Domain Docs

工程技能在探索代码库时，按此文件约定读取这个仓库的领域文档。

## 探索前优先读取

- 根目录的 `CONTEXT.md`
- 如果根目录存在 `CONTEXT-MAP.md`，则按其中指向读取相关 context 的 `CONTEXT.md`
- `docs/adr/` 中与当前工作区域相关的 ADR
- 如果以后变成 multi-context repo，也检查 `src/<context>/docs/adr/` 中的 context-scoped ADR

如果这些文件不存在，静默继续。不要因为缺失这些文件而阻塞工作，也不要预先建议创建它们。生产这些文档的技能会在术语或决策真正需要沉淀时再创建。

## 文件结构

当前采用 single-context 布局：

```text
/
├── CONTEXT.md
├── docs/adr/
│   ├── 0001-example-decision.md
│   └── 0002-example-decision.md
└── src/
```

如果以后切换为 multi-context 布局，则根目录应有 `CONTEXT-MAP.md`：

```text
/
├── CONTEXT-MAP.md
├── docs/adr/
└── src/
    ├── frontend/
    │   ├── CONTEXT.md
    │   └── docs/adr/
    └── backend/
        ├── CONTEXT.md
        └── docs/adr/
```

## 使用 glossary 中的词汇

当输出中需要命名领域概念时，例如 issue 标题、重构建议、假设、测试名，优先使用 `CONTEXT.md` 中定义的术语。不要随意替换成 glossary 明确避免的同义词。

如果需要的概念还没有出现在 glossary 中，这通常说明两种情况之一：要么是在发明项目并不使用的语言，需要重新考虑；要么是真有文档缺口，可以留给 `/grill-with-docs` 后续处理。

## 标出 ADR 冲突

如果输出内容和已有 ADR 冲突，要明确指出，而不是静默覆盖：

> Contradicts ADR-0007 (...) - but worth reopening because...
