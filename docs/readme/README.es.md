[English](../../README.md) · [Deutsch](README.de.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · Español · [한국어](README.ko.md) · [Português (Brasil)](README.pt-BR.md) · [Français](README.fr.md)

> Esta traducción se generó con ayuda automática y aún no la ha revisado una persona nativa. Si hay diferencias, prevalece el [README en inglés](../../README.md).

# Push My Tabs

Atajos de teclado que se adaptan al diseño y acciones rápidas para pestañas en Chrome y Firefox desde un núcleo compartido.

Consulta [CHANGELOG.md](../../CHANGELOG.md) para ver los cambios dirigidos a usuarios.

- [Privacidad](../../PRIVACY.md) · [Soporte](https://github.com/pengusto/push-my-tabs/issues) · [Sitio web](https://pengusto.github.io/push-my-tabs/)

## Instalación

- [Chrome Web Store](https://chromewebstore.google.com/detail/bagfcickffpfkgecknaepmfleikeojik) para Chrome 127 o posterior
- [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/push-my-tabs/) para Firefox 142 o posterior

## Estado actual

Los paquetes de Chrome y Firefox comparten el mismo código probado. Firefox 142 o posterior usa el ajuste exacto de pestañas verticales del navegador y permite editar los atajos compatibles desde la página de configuración.

La ventana emergente y la configuración muestran los cuatro atajos de dirección con sus asignaciones actuales. Los atajos opcionales permanecen en una sección plegada. La ventana emergente también permite ir a la primera o última pestaña, mover, duplicar, fijar o silenciar la pestaña actual, o enviarla a una ventana nueva.

## Idiomas

Chrome y Firefox eligen el idioma según la interfaz del navegador. También puedes cambiarlo en la configuración. Push My Tabs incluye inglés, alemán, español, francés, portugués de Brasil, italiano, polaco, turco, japonés, chino simplificado, árabe, ruso, ucraniano, kurdo kurmanji y persa darí. Los idiomas no compatibles usan inglés.

## Prueba local en Chrome

Primero crea la copia de desarrollo descomprimida:

```sh
./scripts/build-chrome-dev.sh
```

1. Abre `chrome://extensions` y activa el **Modo desarrollador**.
2. Elige **Cargar descomprimida** y selecciona `dist/chrome-dev`.
3. Comprueba los cuatro atajos de dirección y asigna los opcionales en `chrome://extensions/shortcuts`.
4. Para usar el modo incógnito, abre los detalles y activa **Permitir en incógnito**. `⌘T` sigue siendo el atajo nativo para una pestaña nueva; usa el comando asignado (recomendado: `⌥T`) para colocarla.

## Comprobaciones

```sh
node tests/layout.test.mjs
node tests/api.test.mjs
node tests/background.test.mjs
node tests/firefox.test.mjs
node tests/i18n.test.mjs
node tests/ui.test.mjs
jq empty manifests/chrome.json manifests/firefox.json
```

## Versiones para Chrome y Firefox

Chrome requiere Node.js 22, `zip` y `unzip`. Firefox requiere además `npx` y Firefox 142 o posterior. El paquete de Firefox ejecuta una versión fija de Mozilla `web-ext` y solo solicita `storage` y `browserSettings`; no recopila ni transmite datos.

```sh
./scripts/build-chrome.sh
./scripts/build-firefox.sh
```

Para una copia de desarrollo de Chrome, carga `dist/chrome-dev` una vez y actualízala después de ejecutar `./scripts/build-chrome-dev.sh`.

## Publicación manual en GitHub

En el flujo **Create release** de GitHub Actions, selecciona la rama o el commit exacto e introduce una etiqueta que coincida con ambos manifiestos, por ejemplo `v1.2.0`. El flujo crea ambos paquetes y adjunta los ZIP a una sola publicación. La publicación en Chrome Web Store y Firefox Add-ons sigue siendo un paso manual independiente.

Las versiones etiquetadas están en [GitHub Releases](https://github.com/pengusto/push-my-tabs/releases). Consulta [CONTRIBUTING.md](../../CONTRIBUTING.md) para colaborar y [SECURITY.md](../../SECURITY.md) para informar de una vulnerabilidad en privado.

La extensión no usa permisos de host, scripts de contenido, cuentas, analítica, publicidad ni código remoto. El permiso `activeTab` de Chrome expone temporalmente solo la pestaña actual después de un atajo o una acción emergente para aplicar perfiles geométricos locales a su origen o ruta exacta. Firefox no solicita ese permiso ni lee datos de la página.
