# SVG 编辑器 CLI · Lab1 Phase 1

TypeScript 面向对象实现，包含六种图形、组合树、命令历史和 SVG 读写。

## 运行

需要 Node.js 22 或更新版本以及 npm。

```sh
npm ci
npm run cli
```

输入 `help` 查看语法；输入流结束退出（Windows：Ctrl+Z 后回车）。

```text
init
create g scene
create rect r1 10 20 100 50 #4a90d9 in scene
create text t1 20 50 "Hello SVG" in scene
move scene 30 0
undo
tree
save demo.svg
```

浏览器打开保存的 SVG 即可预览。

## 验证与示例

```sh
npm test
```

PowerShell 回放需求中的两节点流程图：

```powershell
Get-Content -Encoding utf8 examples/flowchart.txt | npm run cli
```

生成 `examples/flowchart.svg`。其他 shell 可用 `npm run cli < examples/flowchart.txt`。

架构、设计决策、真实过程记录、自查和范围说明见 [doc/README.md](doc/README.md)。原始要求保留在 [phase_cli_1.md](phase_cli_1.md)。
