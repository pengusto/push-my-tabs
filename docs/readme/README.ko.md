[English](../../README.md) · [Deutsch](README.de.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [Español](README.es.md) · 한국어 · [Português (Brasil)](README.pt-BR.md) · [Français](README.fr.md)

> 이 번역은 기계의 도움으로 작성되었으며 아직 원어민 검수를 받지 않았습니다. 내용이 다를 경우 [영문 README](../../README.md)를 기준으로 합니다.

# Push My Tabs

하나의 공통 코어로 Chrome과 Firefox에서 레이아웃을 인식하는 키보드 단축키와 빠른 탭 작업을 제공합니다.

사용자 대상 변경 사항은 [CHANGELOG.md](../../CHANGELOG.md)를 확인하세요.

- [개인정보 보호](../../PRIVACY.md) · [지원](https://github.com/pengusto/push-my-tabs/issues) · [웹사이트](https://pengusto.github.io/push-my-tabs/)

## 설치

- Chrome 127 이상: [Chrome 웹 스토어](https://chromewebstore.google.com/detail/bagfcickffpfkgecknaepmfleikeojik)
- Firefox 142 이상: [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/push-my-tabs/)

## 현재 상태

Chrome과 Firefox 릴리스 패키지는 테스트된 동일한 소스를 사용합니다. Firefox 142 이상에서는 브라우저의 정확한 세로 탭 설정을 사용하고 설정 페이지에서 지원되는 명령 단축키를 직접 편집할 수 있습니다.

팝업과 설정 페이지에는 네 방향 단축키와 현재 브라우저 할당이 표시됩니다. 선택 단축키는 별도의 접힌 영역에 있습니다. 팝업에서 첫 번째나 마지막 탭으로 이동하고, 현재 탭을 이동, 복제, 고정, 음소거하거나 새 창으로 옮길 수도 있습니다.

## 언어

Chrome과 Firefox는 브라우저 UI 언어에 따라 확장 프로그램 언어를 자동으로 선택합니다. 설정에서 직접 바꿀 수도 있습니다. Push My Tabs는 영어, 독일어, 스페인어, 프랑스어, 브라질 포르투갈어, 이탈리아어, 폴란드어, 터키어, 일본어, 중국어 간체, 아랍어, 러시아어, 우크라이나어, 쿠르드어(쿠르만지), 다리어를 지원합니다. 지원하지 않는 언어는 영어로 표시됩니다.

## Chrome 로컬 테스트

먼저 압축 해제된 개발 사본을 만듭니다.

```sh
./scripts/build-chrome-dev.sh
```

1. `chrome://extensions`를 열고 **개발자 모드**를 켭니다.
2. **압축해제된 확장 프로그램을 로드합니다**를 선택하고 `dist/chrome-dev`를 지정합니다.
3. 네 방향 단축키를 확인하고 `chrome://extensions/shortcuts`에서 필요한 선택 단축키를 할당합니다.
4. 시크릿 모드에서 사용하려면 확장 프로그램 세부정보에서 **시크릿 모드에서 허용**을 켭니다. `⌘T`는 Chrome의 기본 새 탭 단축키이므로 탭 위치 지정에는 할당된 새 탭 명령(권장: `⌥T`)을 사용하세요.

## 검사

```sh
node tests/layout.test.mjs
node tests/api.test.mjs
node tests/background.test.mjs
node tests/firefox.test.mjs
node tests/i18n.test.mjs
node tests/ui.test.mjs
jq empty manifests/chrome.json manifests/firefox.json
```

## Chrome 및 Firefox 릴리스

Chrome 빌드에는 Node.js 22, `zip`, `unzip`이 필요합니다. Firefox 빌드에는 `npx`와 Firefox 142 이상도 필요합니다. Firefox 패키지는 고정된 Mozilla `web-ext` 린트를 실행하며 `storage`와 `browserSettings`만 요청합니다. 데이터는 수집하거나 전송하지 않습니다.

```sh
./scripts/build-chrome.sh
./scripts/build-firefox.sh
```

Chrome 개발 사본은 `dist/chrome-dev`를 한 번 로드한 뒤 `./scripts/build-chrome-dev.sh` 실행 후 새로고침하세요.

## 수동 GitHub 릴리스

GitHub Actions의 **Create release** 워크플로에서 정확한 브랜치나 커밋을 선택하고 두 매니페스트와 일치하는 태그(예: `v1.2.0`)를 입력합니다. 워크플로는 두 패키지를 빌드해 하나의 GitHub Release에 ZIP 파일을 첨부합니다. Chrome 웹 스토어와 Firefox Add-ons 게시는 별도의 수동 단계입니다.

태그된 릴리스는 [GitHub Releases](https://github.com/pengusto/push-my-tabs/releases)에서 확인할 수 있습니다. 기여 방법은 [CONTRIBUTING.md](../../CONTRIBUTING.md), 비공개 취약점 신고 방법은 [SECURITY.md](../../SECURITY.md)를 참고하세요.

이 확장 프로그램은 호스트 권한, 콘텐츠 스크립트, 계정, 분석, 광고 또는 원격 코드를 사용하지 않습니다. Chrome의 `activeTab` 권한은 단축키나 팝업 작업 후 현재 탭만 잠시 노출해 출처나 정확한 경로에 로컬 위치 프로필을 적용합니다. Firefox는 이 권한을 요청하거나 페이지 데이터를 읽지 않습니다.
