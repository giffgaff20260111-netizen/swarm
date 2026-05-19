# Issue tracker: GitHub

这个仓库的 issues 和 PRDs 存放在 GitHub Issues 中。所有 issue 相关操作都使用 `gh` CLI。

## 约定

- **创建 issue**：`gh issue create --title "..." --body "..."`
  - 多行正文使用 heredoc，避免手动转义换行。
- **读取 issue**：`gh issue view <number> --comments`
  - 需要时同时读取 labels，并用 `jq` 过滤 comments。
- **列出 issues**：
  - `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'`
  - 按需要增加 `--label` 和 `--state` 过滤条件。
- **评论 issue**：`gh issue comment <number> --body "..."`
- **添加 / 移除 labels**：
  - `gh issue edit <number> --add-label "..."`
  - `gh issue edit <number> --remove-label "..."`
- **关闭 issue**：`gh issue close <number> --comment "..."`

在仓库 clone 中运行时，`gh` 会根据 `git remote -v` 自动识别 GitHub 仓库。

## 当技能说 “publish to the issue tracker”

创建一个 GitHub issue。

## 当技能说 “fetch the relevant ticket”

运行 `gh issue view <number> --comments`。
