[English](README.md) · [Deutsch](README.de.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [Español](README.es.md) · [한국어](README.ko.md) · Português (Brasil) · [Français](README.fr.md)

> Esta tradução foi produzida com assistência automática e ainda não foi revisada por uma pessoa fluente. Em caso de diferença, o [README em inglês](README.md) prevalece.

# Push My Tabs

Atalhos de teclado que entendem o layout e ações rápidas para abas no Chrome e Firefox usando o mesmo núcleo.

Consulte [CHANGELOG.md](CHANGELOG.md) para ver as mudanças voltadas aos usuários.

- [Privacidade](PRIVACY.md) · [Suporte](https://github.com/pengusto/push-my-tabs/issues) · [Site](https://pengusto.github.io/push-my-tabs/)

## Instalação

- [Chrome Web Store](https://chromewebstore.google.com/detail/bagfcickffpfkgecknaepmfleikeojik) para Chrome 127 ou mais recente
- [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/push-my-tabs/) para Firefox 142 ou mais recente

## Estado atual

Os pacotes do Chrome e Firefox usam o mesmo código testado. No Firefox 142 ou mais recente, a extensão usa a configuração exata de abas verticais do navegador e permite editar os atalhos compatíveis na página de configurações.

O popup e as configurações mostram os quatro atalhos de direção e suas atribuições atuais. Os atalhos opcionais ficam em uma seção recolhida. O popup também permite ir à primeira ou última aba, além de mover, duplicar, fixar, silenciar ou enviar a aba atual para uma nova janela.

## Idiomas

Chrome e Firefox escolhem o idioma da extensão com base na interface do navegador. Você também pode alterá-lo nas configurações. Push My Tabs inclui inglês, alemão, espanhol, francês, português do Brasil, italiano, polonês, turco, japonês, chinês simplificado, árabe, russo, ucraniano, curdo kurmanji e persa dari. Idiomas não compatíveis usam inglês.

## Teste local no Chrome

1. Abra `chrome://extensions` e ative o **Modo do desenvolvedor**.
2. Escolha **Carregar sem compactação** e selecione este diretório.
3. Confirme os quatro atalhos de direção e atribua os opcionais em `chrome://extensions/shortcuts`.
4. Para usar no modo anônimo, abra os detalhes e ative **Permitir no modo anônimo**. `⌘T` continua sendo o atalho nativo para uma nova aba; use o comando atribuído (recomendado: `⌥T`) para posicioná-la.

## Verificações

```sh
node layout.test.mjs
node api.test.mjs
node background.test.mjs
node firefox.test.mjs
node i18n.test.mjs
node ui.test.mjs
jq empty manifest.json manifest.firefox.json
```

## Versões para Chrome e Firefox

O Chrome exige Node.js 22, `zip` e `unzip`. O Firefox também exige `npx` e Firefox 142 ou mais recente. O pacote do Firefox executa uma versão fixada do Mozilla `web-ext` e solicita apenas `storage` e `browserSettings`; nenhum dado é coletado ou transmitido.

```sh
./scripts/build-chrome.sh
./scripts/build-firefox.sh
```

Para manter uma cópia de desenvolvimento no Chrome, carregue `dist/chrome-dev` uma vez e atualize-a após executar `./scripts/build-chrome-dev.sh`.

## Publicação manual no GitHub

No fluxo **Create release** do GitHub Actions, escolha o branch ou commit exato e informe uma tag correspondente aos dois manifestos, como `v1.2.0`. O fluxo gera os dois pacotes e anexa os arquivos ZIP a uma única publicação. A publicação na Chrome Web Store e no Firefox Add-ons continua sendo uma etapa manual separada.

As versões com tag ficam em [GitHub Releases](https://github.com/pengusto/push-my-tabs/releases). Consulte [CONTRIBUTING.md](CONTRIBUTING.md) para contribuir e [SECURITY.md](SECURITY.md) para relatar uma vulnerabilidade em particular.

A extensão não usa permissões de host, scripts de conteúdo, contas, análise, publicidade ou código remoto. A permissão `activeTab` do Chrome expõe temporariamente apenas a aba atual após um atalho ou ação do popup para aplicar perfis locais de geometria à origem ou ao caminho exato. O Firefox não solicita essa permissão nem lê dados da página.
