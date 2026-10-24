<picture>
  <source media="(max-width: 600px) and (prefers-color-scheme: dark)" srcset="../assets/banner-themes/air-traffic-mobile-dark.png">
  <source media="(max-width: 600px) and (prefers-color-scheme: light)" srcset="../assets/banner-themes/air-traffic-mobile-light.png">
  <source media="(prefers-color-scheme: dark)" srcset="../assets/push-my-tabs-air-traffic.png">
  <source media="(prefers-color-scheme: light)" srcset="../assets/banner-themes/air-traffic-light.png">
  <img src="../assets/push-my-tabs-air-traffic.png" alt="Push My Tabs" width="100%">
</picture>

[English](../../README.md) · [Deutsch](README.de.md) · [简体中文](README.zh-CN.md) · 日本語 · [Español](README.es.md) · [한국어](README.ko.md) · [Português (Brasil)](README.pt-BR.md) · [Français](README.fr.md)

> この翻訳は機械翻訳の支援を受けて作成され、母語話者による確認はまだ行われていません。内容に相違がある場合は、[英語版 README](../../README.md) を正とします。

# Push My Tabs

**タブの並びに合わせて切り替え、移動。**

横並び・縦並びのタブをキーボードで操作したい方へ。

## インストール

- [Chrome ウェブストア](https://chromewebstore.google.com/detail/bagfcickffpfkgecknaepmfleikeojik)：Chrome 127 以降
- [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/push-my-tabs/)：Firefox 142 以降

[ウェブサイト](https://pengusto.github.io/push-my-tabs/)

## 自分に合う操作へ

![タブを切り替え → アクティブなタブを移動](../assets/penguin/tabs-demo.gif)

*適応型プリセットの動作を示すイラストです。画面録画ではありません。画像内の文字は英語です。方向は拡張機能のコマンドを表します。キーの組み合わせはブラウザーで設定してください。*

[静止画を見る](../assets/penguin/tabs-demo-poster.png)

| 横並びのタブ | 縦並びのタブ |
| :--- | :--- |
| **左 / 右** → タブを切り替え | **上 / 下** → タブを切り替え |
| **上 / 下** → アクティブなタブを移動 | **左 / 右** → アクティブなタブを移動 |

クイック操作：複製、固定、ミュート、最初・最後のタブへの切り替え、新しいウィンドウへの移動。レイアウト、プリセット、任意のショートカットを設定できます。

<p align="center"><img src="../assets/penguin/mascot.png" width="132" alt="矢印付きのタブを持つペンギン"></p>

## 使い始める

1. 上のストアリンクから拡張機能をインストールします。
2. ナビゲーションで4方向の操作を確認します。サイドバーには TabLoop、配置、キー割り当て、設定もあります。
3. キー割り当ては Firefox で直接、Chrome では専用エディターで変更します。Mac の記号と Windows/Linux の表記は自動で切り替わります。適応型プリセットから始め、必要なら配置を手動で指定します。

Chrome はウィンドウの形状からレイアウトを推定します。サイドパネルが開いていると判定に影響する場合があります。Firefox 142 以降は縦型タブの設定を直接読み取ります。

## タブの情報は手元に

アカウント、解析、広告、リモートコードはありません。設定はブラウザー内に保存されます。Chrome はローカルのレイアウトプロファイルに一時的な `activeTab` アクセスを使います。Firefox は `storage` と `browserSettings` を使い、ページデータは読み取りません。

[プライバシー](../../PRIVACY.md) · [サポート](https://github.com/pengusto/push-my-tabs/issues) · [リリース](https://github.com/pengusto/push-my-tabs/releases) · [変更履歴](../../CHANGELOG.md)

<details>
<summary><strong>言語・開発・リリースの詳細</strong></summary>

## 現在の状態

Chrome と Firefox のリリースパッケージは、同じテスト済みソースを使用します。Firefox 142 以降では、ブラウザーの正確な垂直タブ設定を使用し、対応するコマンドのショートカットを設定ページから直接編集できます。

ポップアップと設定ページは5つの画面を共有します。ナビゲーションには方向操作とその他のタブ操作があります。TabLoop はウィンドウをまたいで、開いているタブを最近使った順に切り替えます。配置では全体のモードと保存済みの確認を管理し、キー割り当てではコマンド、プリセット、独自の操作対応を設定します。設定には言語、動作、プライベートウィンドウへのアクセスがあります。

## 言語

Chrome と Firefox はブラウザーの表示言語から拡張機能の言語を自動選択します。設定ページで手動選択もできます。Push My Tabs は、英語、ドイツ語、スペイン語、フランス語、ブラジルポルトガル語、イタリア語、ポーランド語、トルコ語、日本語、簡体字中国語、アラビア語、ロシア語、ウクライナ語、クルド語（クルマンジー）、ダリー語に対応しています。未対応のブラウザー言語では英語を使用します。

## Chrome でのローカルテスト

最初に展開済みの開発用コピーを作成します。

リポジトリのルートで実行します。Node.js 22、`zip`、`unzip` が必要です。パッケージのインストール手順はありません。

```sh
./scripts/build-chrome-dev.sh
```

1. `chrome://extensions` を開きます。
2. **デベロッパーモード**を有効にします。
3. **パッケージ化されていない拡張機能を読み込む**を選び、`dist/chrome-dev` を指定します。
4. 4 方向のショートカットを確認し、必要な任意コマンドを `chrome://extensions/shortcuts` で割り当てます。
5. シークレットモードで使う場合は拡張機能の詳細を開き、**シークレット モードでの実行を許可する**を有効にします。設定がない場合はポップアップに説明が表示されます。`⌘T` は Chrome 標準の新規タブ用ショートカットです。タブの配置には、割り当てた新規タブコマンド（推奨：`⌥T`）を使用してください。

## チェック

```sh
node tests/layout.test.mjs
node tests/api.test.mjs
node tests/background.test.mjs
node tests/firefox.test.mjs
node tests/i18n.test.mjs
node tests/ui.test.mjs
node tests/ui-flow.test.mjs
node tests/shortcuts.test.mjs
jq empty manifests/chrome.json manifests/firefox.json
```

## Chrome リリース

Node.js 22、`zip`、`unzip` が必要です。クリーンなチェックアウトで次のコマンドを実行すると、すべてのチェックを行い、`dist/push-my-tabs-chrome-<version>.zip` を作成します。

```sh
./scripts/build-chrome.sh
```

開発版を継続して読み込む場合は、`chrome://extensions` で `dist/chrome-dev` を一度選択し、`./scripts/build-chrome-dev.sh` の実行後に更新してください。

## Firefox リリース

Firefox 142 以降、Node.js 22、`npx`、`zip`、`unzip` が必要です。ビルドでは、バージョン固定済みの Mozilla `web-ext` lint を実行します。Firefox パッケージが要求する権限は `storage` と `browserSettings` だけで、データを収集または送信しないことを宣言しています。

```sh
./scripts/build-firefox.sh
```

## GitHub Release の手動作成

プッシュのたびに Release が作成されることはありません。GitHub Actions の **Create release** ワークフローで対象のブランチまたはコミットを選択し、両方のマニフェストに一致するタグ（例：`v1.2.0`）を入力します。必要に応じてプレリリースに設定してください。ワークフローは両方のパッケージをビルドし、Chrome と Firefox の ZIP を 1 つの GitHub Release に添付します。

ストアへの公開は別の手動作業です。Chrome ウェブストアと Firefox Add-ons が対応するアーカイブを審査して公開した後、ブラウザーがユーザーの更新を管理します。

タグ付き Release と対応する Chrome、Firefox のアーカイブは [GitHub Releases ページ](https://github.com/pengusto/push-my-tabs/releases)にあります。

参加方法は [CONTRIBUTING.md](../../CONTRIBUTING.md)、脆弱性を非公開で報告する方法は [SECURITY.md](../../SECURITY.md) を参照してください。

この拡張機能は、ホスト権限、コンテンツスクリプト、アカウント、分析、広告、リモートコードを使用しません。Chrome の `activeTab` 権限は、ショートカットまたはポップアップ操作の後に現在のタブだけを一時的に公開し、そのオリジンまたは正確なパスにローカルのジオメトリープロファイルを適用できるようにします。Firefox はこの権限を要求せず、ページデータを読み取りません。

</details>

## ライセンス

[MIT](../../LICENSE) · [README 画像の出典](../assets/README.md)
