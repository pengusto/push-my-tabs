[English](../../README.md) · [Deutsch](README.de.md) · 简体中文 · [日本語](README.ja.md) · [Español](README.es.md) · [한국어](README.ko.md) · [Português (Brasil)](README.pt-BR.md) · [Français](README.fr.md)

> 本译文由机器辅助生成，尚未经过母语使用者审校。如有差异，请以[英文 README](../../README.md) 为准。

<table>
  <tr>
    <td width="184" align="center">
      <img src="../assets/molebyte-pixel.gif" alt="Molebyte 挥手并拿着一个浏览器标签页" width="168">
    </td>
    <td>
      <h1>Push My Tabs</h1>
      <p>为 Chrome 和 Firefox 提供可感知布局的键盘快捷键与快捷标签页操作，共用同一套核心代码。</p>
    </td>
  </tr>
</table>

面向用户的更新记录请参阅 [CHANGELOG.md](../../CHANGELOG.md)。

- [隐私](../../PRIVACY.md)
- [支持](https://github.com/pengusto/push-my-tabs/issues)
- [网站](https://pengusto.github.io/push-my-tabs/)

## 安装

- [Chrome 网上应用店](https://chromewebstore.google.com/detail/bagfcickffpfkgecknaepmfleikeojik)，支持 Chrome 127 及更高版本
- [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/push-my-tabs/)，支持 Firefox 142 及更高版本

## 当前状态

Chrome 和 Firefox 发布包使用同一套经过测试的源代码。Firefox 142 及更高版本会读取浏览器准确的垂直标签页设置，并允许用户直接在设置页编辑受支持命令的快捷键。

弹出窗口和设置页会显示四个方向快捷键及其当前浏览器分配。可选快捷键放在单独的折叠区域中。弹出窗口还提供快捷操作，可切换到第一个或最后一个标签页，以及移动、复制、固定、静音当前标签页，或将其移到新窗口。

## 语言

Chrome 和 Firefox 会根据浏览器界面语言自动选择扩展语言，也可以在设置页手动选择。Push My Tabs 支持英语、德语、西班牙语、法语、巴西葡萄牙语、意大利语、波兰语、土耳其语、日语、简体中文、阿拉伯语、俄语、乌克兰语、库尔德语（库尔曼吉语）和达里波斯语。不支持的浏览器语言将回退到英语。

## 在本地测试 Chrome 版本

请先生成解压后的开发版本：

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

## 手动创建 GitHub Release

系统不会在每次推送时创建 Release。请在 GitHub Actions 的 **Create release** 工作流中选择准确的分支或提交，输入与两个清单版本一致的标签（例如 `v1.2.0`），并按需标记为预发布版本。工作流会构建两个包，并把 Chrome 和 Firefox ZIP 附加到同一个 GitHub Release。

应用商店发布仍是单独的手动步骤。Chrome 网上应用店和 Firefox Add-ons 审核并发布对应归档后，浏览器会管理用户更新。

带标签的 Release 及对应的 Chrome 和 Firefox 归档位于 [GitHub Releases 页面](https://github.com/pengusto/push-my-tabs/releases)。

参与项目请参阅 [CONTRIBUTING.md](../../CONTRIBUTING.md)，私下报告安全漏洞请参阅 [SECURITY.md](../../SECURITY.md)。

本扩展不使用主机权限、内容脚本、账户、分析、广告或远程代码。Chrome 的 `activeTab` 权限仅在用户触发快捷键或弹出窗口操作后短暂公开当前标签页，以便为其来源或准确路径应用本地几何配置。Firefox 不申请此权限，也不读取页面数据。
