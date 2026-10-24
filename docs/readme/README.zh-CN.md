<picture>
  <source media="(max-width: 600px) and (prefers-color-scheme: dark)" srcset="../assets/banner-themes/air-traffic-mobile-dark.png">
  <source media="(max-width: 600px) and (prefers-color-scheme: light)" srcset="../assets/banner-themes/air-traffic-mobile-light.png">
  <source media="(prefers-color-scheme: dark)" srcset="../assets/push-my-tabs-air-traffic.png">
  <source media="(prefers-color-scheme: light)" srcset="../assets/banner-themes/air-traffic-light.png">
  <img src="../assets/push-my-tabs-air-traffic.png" alt="Push My Tabs" width="100%">
</picture>

[English](../../README.md) · [Deutsch](README.de.md) · 简体中文 · [日本語](README.ja.md) · [Español](README.es.md) · [한국어](README.ko.md) · [Português (Brasil)](README.pt-BR.md) · [Français](README.fr.md)

> 本译文由机器辅助生成，尚未经过母语使用者审校。如有差异，请以[英文 README](../../README.md) 为准。

# Push My Tabs

**按照标签页的排列方式切换和移动。**

适合希望用键盘操作横向或纵向标签页的用户。

## 安装

- [Chrome 网上应用店](https://chromewebstore.google.com/detail/bagfcickffpfkgecknaepmfleikeojik)，支持 Chrome 127 及更高版本
- [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/push-my-tabs/)，支持 Firefox 142 及更高版本

[网站](https://pengusto.github.io/push-my-tabs/)

## 找到你的操作节奏

![切换标签页 → 移动当前标签页](../assets/penguin/tabs-demo.gif)

*这是自适应预设的功能示意图，不是屏幕录像。图中文字为英文；方向代表扩展命令。请在浏览器中分配自己喜欢的快捷键。*

[查看静态示意图](../assets/penguin/tabs-demo-poster.png)

| 横向标签页 | 纵向标签页 |
| :--- | :--- |
| **左 / 右** → 切换标签页 | **上 / 下** → 切换标签页 |
| **上 / 下** → 移动当前标签页 | **左 / 右** → 移动当前标签页 |

快捷操作：复制、固定、静音、切换到首个或末个标签页，或移至新窗口。可以配置布局、预设和可选快捷键。

<p align="center"><img src="../assets/penguin/mascot.png" width="132" alt="企鹅拿着带方向箭头的标签页"></p>

## 开始使用

1. 通过上方商店链接安装扩展。
2. 打开“导航”查看四个方向操作。侧边栏还包含 TabLoop、排列、快捷键绑定和设置。
3. 在“快捷键绑定”中直接修改 Firefox 快捷键，或打开 Chrome 快捷键编辑器。Mac 符号与 Windows/Linux 标签会自动切换。从自适应预设开始，必要时手动选择排列。

Chrome 根据窗口几何信息估算布局；打开侧边栏可能影响识别。Firefox 142 及以上直接读取其纵向标签页设置。

## 标签页信息留在本地

无需账户，无分析、广告或远程代码。设置保存在浏览器中。Chrome 使用临时 `activeTab` 权限处理本地布局配置；Firefox 使用 `storage` 和 `browserSettings`，不读取页面数据。

[隐私](../../PRIVACY.md) · [支持](https://github.com/pengusto/push-my-tabs/issues) · [发布版本](https://github.com/pengusto/push-my-tabs/releases) · [更新日志](../../CHANGELOG.md)

<details>
<summary><strong>语言、开发与发布详情</strong></summary>

## 当前状态

Chrome 和 Firefox 发布包使用同一套经过测试的源代码。Firefox 142 及更高版本会读取浏览器准确的垂直标签页设置，并允许用户直接在设置页编辑受支持命令的快捷键。

弹出面板和设置页共用五个视图。导航提供方向操作和其他标签页操作。TabLoop 按最近使用顺序在不同窗口的已打开标签页间切换。排列管理全局模式和已保存的确认；快捷键绑定包含全部命令、预设和自定义映射。设置包含语言、行为和隐私窗口访问。

## 语言

Chrome 和 Firefox 会根据浏览器界面语言自动选择扩展语言，也可以在设置页手动选择。Push My Tabs 支持英语、德语、西班牙语、法语、巴西葡萄牙语、意大利语、波兰语、土耳其语、日语、简体中文、阿拉伯语、俄语、乌克兰语、库尔德语（库尔曼吉语）和达里波斯语。不支持的浏览器语言将回退到英语。

## 在本地测试 Chrome 版本

请先生成解压后的开发版本：

在仓库根目录运行，需要 Node.js 22、`zip` 和 `unzip`，无需安装依赖包。

```sh
./scripts/build-chrome-dev.sh
```

1. 打开 `chrome://extensions`。
2. 启用**开发者模式**。
3. 选择**加载已解压的扩展程序**，然后选择 `dist/chrome-dev`。
4. 确认四个方向快捷键，并在 `chrome://extensions/shortcuts` 中为需要的可选命令分配快捷键。
5. 如需在无痕模式中使用，请打开扩展详情并启用**在无痕模式下启用**。缺少此设置时，弹出窗口会给出说明。`⌘T` 仍是 Chrome 原生的新建标签页快捷键；请使用已分配的新建标签页命令（建议：`⌥T`）控制标签页位置。

## 检查

```sh
node tests/layout.test.mjs
node tests/api.test.mjs
node tests/background.test.mjs
node tests/firefox.test.mjs
node tests/i18n.test.mjs
node tests/ui.test.mjs
node tests/ui-flow.test.mjs
node tests/shortcuts.test.mjs
node tests/release.test.mjs
node tests/store-publishing.test.mjs
jq empty manifests/chrome.json manifests/firefox.json
```

## Chrome 发布包

需要 Node.js 22、`zip` 和 `unzip`。在干净的检出中运行一个命令即可执行全部检查并创建 `dist/push-my-tabs-chrome-<version>.zip`：

```sh
./scripts/build-chrome.sh
```

若要长期加载开发版本，请在 `chrome://extensions` 中选择一次 `dist/chrome-dev`，之后每次运行 `./scripts/build-chrome-dev.sh` 后刷新该扩展。

## Firefox 发布包

需要 Firefox 142 或更高版本、Node.js 22、`npx`、`zip` 和 `unzip`。构建过程会运行固定版本的 Mozilla `web-ext` 检查。Firefox 包仅申请 `storage` 和 `browserSettings` 权限，并声明不收集或传输数据。

```sh
./scripts/build-firefox.sh
```

## 自动发布

在 `main` 上运行 **Actions → Create release**，输入下一个标签（如 `v1.3.0`），并保持商店提交选项启用。工作流会准备版本和变更日志、验证并构建两个包，然后创建 GitHub Release。一次性连接账号后，会将相同的包提交到 Chrome 和 Firefox。商店审核是异步进行的。[配置与重试](../releasing.md)。

带标签的 Release 及对应的 Chrome 和 Firefox 归档位于 [GitHub Releases 页面](https://github.com/pengusto/push-my-tabs/releases)。

参与项目请参阅 [CONTRIBUTING.md](../../CONTRIBUTING.md)，私下报告安全漏洞请参阅 [SECURITY.md](../../SECURITY.md)。

本扩展不使用主机权限、内容脚本、账户、分析、广告或远程代码。Chrome 的 `activeTab` 权限仅在用户触发快捷键或弹出窗口操作后短暂公开当前标签页，以便为其来源或准确路径应用本地几何配置。Firefox 不申请此权限，也不读取页面数据。

</details>

## 许可证

[MIT](../../LICENSE) · [README 图片来源](../assets/README.md)
