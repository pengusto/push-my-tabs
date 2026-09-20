[English](README.md) · [Deutsch](README.de.md) · [简体中文](README.zh-CN.md) · 日本語 · [Español](README.es.md) · [한국어](README.ko.md) · [Português (Brasil)](README.pt-BR.md) · [Français](README.fr.md)

> この翻訳は機械翻訳の支援を受けて作成され、母語話者による確認はまだ行われていません。内容に相違がある場合は、[英語版 README](README.md) を正とします。

<table>
  <tr>
    <td width="184" align="center">
      <img src="docs/assets/molebyte-pixel.gif" alt="ブラウザータブを持って手を振る Molebyte" width="168">
    </td>
    <td>
      <h1>Push My Tabs</h1>
      <p>Chrome と Firefox で共通のコアを使う、レイアウト対応キーボードショートカットとタブのクイック操作。</p>
    </td>
  </tr>
</table>

ユーザー向けの変更点は [CHANGELOG.md](CHANGELOG.md) を参照してください。

- [プライバシー](PRIVACY.md)
- [サポート](https://github.com/pengusto/push-my-tabs/issues)
- [ウェブサイト](https://pengusto.github.io/push-my-tabs/)

## インストール

- [Chrome ウェブストア](https://chromewebstore.google.com/detail/bagfcickffpfkgecknaepmfleikeojik)：Chrome 127 以降
- [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/push-my-tabs/)：Firefox 142 以降

## 現在の状態

Chrome と Firefox のリリースパッケージは、同じテスト済みソースを使用します。Firefox 142 以降では、ブラウザーの正確な垂直タブ設定を使用し、対応するコマンドのショートカットを設定ページから直接編集できます。

ポップアップと設定ページには、4 方向のショートカットと現在のブラウザー割り当てが表示されます。任意のショートカットは、別の折りたたみセクションにまとまっています。ポップアップから、先頭または末尾のタブへの移動、現在のタブの移動、複製、ピン留め、ミュート、新しいウィンドウへの移動も実行できます。

## 言語

Chrome と Firefox はブラウザーの表示言語から拡張機能の言語を自動選択します。設定ページで手動選択もできます。Push My Tabs は、英語、ドイツ語、スペイン語、フランス語、ブラジルポルトガル語、イタリア語、ポーランド語、トルコ語、日本語、簡体字中国語、アラビア語、ロシア語、ウクライナ語、クルド語（クルマンジー）、ダリー語に対応しています。未対応のブラウザー言語では英語を使用します。

## Chrome でのローカルテスト

1. `chrome://extensions` を開きます。
2. **デベロッパーモード**を有効にします。
3. **パッケージ化されていない拡張機能を読み込む**を選び、このディレクトリを指定します。
4. 4 方向のショートカットを確認し、必要な任意コマンドを `chrome://extensions/shortcuts` で割り当てます。
5. シークレットモードで使う場合は拡張機能の詳細を開き、**シークレット モードでの実行を許可する**を有効にします。設定がない場合はポップアップに説明が表示されます。`⌘T` は Chrome 標準の新規タブ用ショートカットです。タブの配置には、割り当てた新規タブコマンド（推奨：`⌥T`）を使用してください。

## チェック

```sh
node layout.test.mjs
node api.test.mjs
node background.test.mjs
node firefox.test.mjs
node i18n.test.mjs
node ui.test.mjs
jq empty manifest.json manifest.firefox.json
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

参加方法は [CONTRIBUTING.md](CONTRIBUTING.md)、脆弱性を非公開で報告する方法は [SECURITY.md](SECURITY.md) を参照してください。

この拡張機能は、ホスト権限、コンテンツスクリプト、アカウント、分析、広告、リモートコードを使用しません。Chrome の `activeTab` 権限は、ショートカットまたはポップアップ操作の後に現在のタブだけを一時的に公開し、そのオリジンまたは正確なパスにローカルのジオメトリープロファイルを適用できるようにします。Firefox はこの権限を要求せず、ページデータを読み取りません。
