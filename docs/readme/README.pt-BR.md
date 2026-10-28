<picture>
  <source media="(max-width: 600px) and (prefers-color-scheme: dark)" srcset="../assets/banner-themes/air-traffic-mobile-dark.png">
  <source media="(max-width: 600px) and (prefers-color-scheme: light)" srcset="../assets/banner-themes/air-traffic-mobile-light.png">
  <source media="(prefers-color-scheme: dark)" srcset="../assets/push-my-tabs-air-traffic.png">
  <source media="(prefers-color-scheme: light)" srcset="../assets/banner-themes/air-traffic-light.png">
  <img src="../assets/push-my-tabs-air-traffic.png" alt="Push My Tabs" width="100%">
</picture>

[English](../../README.md) · [Deutsch](README.de.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [Español](README.es.md) · [한국어](README.ko.md) · Português (Brasil) · [Français](README.fr.md)

> Esta tradução foi produzida com assistência automática e ainda não foi revisada por uma pessoa fluente. Em caso de diferença, o [README em inglês](../../README.md) prevalece.

# Push My Tabs

**Alterne e mova abas conforme sua disposição.**

Para quem navega pelo teclado com abas horizontais ou verticais.

## Instalação

- [Chrome Web Store](https://chromewebstore.google.com/detail/bagfcickffpfkgecknaepmfleikeojik) para Chrome 127 ou mais recente
- [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/push-my-tabs/) para Firefox 142 ou mais recente

[Site](https://pengusto.github.io/push-my-tabs/)

## Encontre seu ritmo

![Alternar abas → Mover a aba ativa](../assets/penguin/tabs-demo.gif)

*Ilustração da predefinição adaptativa, não uma gravação de tela. A imagem contém texto em inglês; as direções indicam comandos da extensão. Atribua seus atalhos no navegador.*

[Ilustração estática](../assets/penguin/tabs-demo-poster.png)

| Abas horizontais | Abas verticais |
| :--- | :--- |
| **Esquerda / Direita** → Alternar abas | **Cima / Baixo** → Alternar abas |
| **Cima / Baixo** → Mover a aba ativa | **Esquerda / Direita** → Mover a aba ativa |

Ações rápidas: duplicar, fixar, silenciar, ir à primeira ou última aba ou mover para uma nova janela. O layout, a predefinição e os atalhos opcionais são configuráveis.

<p align="center"><img src="../assets/penguin/mascot.png" width="132" alt="Um pinguim segura uma aba com uma seta"></p>

## Primeiros passos

1. Instale a extensão usando um dos links das lojas acima.
2. Abra Navegação para ver as quatro ações direcionais. A barra lateral também contém TabLoop, Layout, Atalhos e Configurações.
3. Altere os atalhos diretamente no Firefox ou pelo editor do Chrome. Os símbolos do Mac e os rótulos do Windows/Linux aparecem automaticamente. Comece com a predefinição adaptativa e escolha um layout manual se necessário.

O Chrome estima o layout pela geometria da janela; um painel lateral aberto pode afetar a detecção. O Firefox 142+ lê diretamente sua configuração de abas verticais.

## Suas abas continuam suas

Sem contas, análises, publicidade ou código remoto. As configurações ficam no navegador. O Chrome usa acesso temporário `activeTab` para perfis locais; o Firefox usa `storage` e `browserSettings` sem ler dados das páginas.

[Privacidade](../../PRIVACY.md) · [Suporte](https://github.com/pengusto/push-my-tabs/issues) · [Versões](https://github.com/pengusto/push-my-tabs/releases) · [Histórico de alterações](../../CHANGELOG.md)

<details>
<summary><strong>Idiomas, desenvolvimento e versões</strong></summary>

## Estado atual

Os pacotes do Chrome e Firefox usam o mesmo código testado. No Firefox 142 ou mais recente, a extensão usa a configuração exata de abas verticais do navegador e permite editar os atalhos compatíveis na página de configurações.

O popup e as opções compartilham cinco telas. Navegação oferece ações direcionais e outras ações de abas. TabLoop percorre abas abertas pela ordem de uso recente entre janelas. Layout gerencia o modo global e as confirmações salvas; Atalhos contém comandos, predefinições e mapeamentos personalizados. Configurações reúne idioma, comportamento e acesso a janelas privativas.

## Idiomas

Chrome e Firefox escolhem o idioma da extensão com base na interface do navegador. Você também pode alterá-lo nas configurações. Push My Tabs inclui inglês, alemão, espanhol, francês, português do Brasil, italiano, polonês, turco, japonês, chinês simplificado, árabe, russo, ucraniano, curdo kurmanji e persa dari. Idiomas não compatíveis usam inglês.

## Teste local no Chrome

Primeiro, gere a cópia de desenvolvimento descompactada:

Na raiz do repositório, são necessários Node.js 22, `zip` e `unzip`. Não há etapa de instalação de pacotes.

```sh
./scripts/build-chrome-dev.sh
```

1. Abra `chrome://extensions` e ative o **Modo do desenvolvedor**.
2. Escolha **Carregar sem compactação** e selecione `dist/chrome-dev`.
3. Confirme os quatro atalhos de direção e atribua os opcionais em `chrome://extensions/shortcuts`.
4. Para usar no modo anônimo, abra os detalhes e ative **Permitir no modo anônimo**. `⌘T` continua sendo o atalho nativo para uma nova aba; use o comando atribuído (recomendado: `⌥T`) para posicioná-la.

## Verificações

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

## Versões para Chrome e Firefox

O Chrome exige Node.js 22, `zip` e `unzip`. O Firefox também exige `npx` e Firefox 142 ou mais recente. O pacote do Firefox executa uma versão fixada do Mozilla `web-ext` e solicita apenas `storage` e `browserSettings`; nenhum dado é coletado ou transmitido.

```sh
./scripts/build-chrome.sh
./scripts/build-firefox.sh
```

Para manter uma cópia de desenvolvimento no Chrome, carregue `dist/chrome-dev` uma vez e atualize-a após executar `./scripts/build-chrome-dev.sh`.

## Publicação automatizada

Execute **Actions → Create release** em `main`, informe a próxima tag (por exemplo `v1.3.0`) e mantenha o envio às lojas ativado. O fluxo prepara versões e changelog, valida e gera ambos os pacotes e cria uma publicação no GitHub. Após conectar as contas uma vez, envia os mesmos pacotes ao Chrome e Firefox. A revisão das lojas é assíncrona. [Configuração e novas tentativas](../releasing.md).

As versões com tag ficam em [GitHub Releases](https://github.com/pengusto/push-my-tabs/releases). Consulte [CONTRIBUTING.md](../../CONTRIBUTING.md) para contribuir e [SECURITY.md](../../SECURITY.md) para relatar uma vulnerabilidade em particular.

A extensão não usa permissões de host, scripts de conteúdo, contas, análise, publicidade ou código remoto. A permissão `activeTab` do Chrome expõe temporariamente apenas a aba atual após um atalho ou ação do popup para aplicar perfis locais de geometria à origem ou ao caminho exato. O Firefox não solicita essa permissão nem lê dados da página.

</details>

## Licença

[MIT](../../LICENSE) · [Origem das ilustrações](../assets/README.md)

## Apoie o desenvolvimento

Se o Push My Tabs é útil para você, pode [apoiar meu trabalho de código aberto](https://github.com/sponsors/pengusto).
