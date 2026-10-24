<picture>
  <source media="(max-width: 600px) and (prefers-color-scheme: dark)" srcset="../assets/banner-themes/air-traffic-mobile-dark.png">
  <source media="(max-width: 600px) and (prefers-color-scheme: light)" srcset="../assets/banner-themes/air-traffic-mobile-light.png">
  <source media="(prefers-color-scheme: dark)" srcset="../assets/push-my-tabs-air-traffic.png">
  <source media="(prefers-color-scheme: light)" srcset="../assets/banner-themes/air-traffic-light.png">
  <img src="../assets/push-my-tabs-air-traffic.png" alt="Push My Tabs" width="100%">
</picture>

[English](../../README.md) · [Deutsch](README.de.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · Español · [한국어](README.ko.md) · [Português (Brasil)](README.pt-BR.md) · [Français](README.fr.md)

> Esta traducción se generó con ayuda automática y aún no la ha revisado una persona nativa. Si hay diferencias, prevalece el [README en inglés](../../README.md).

# Push My Tabs

**Cambia y mueve pestañas según su disposición.**

Para quienes navegan con el teclado, con pestañas horizontales o verticales.

## Instalación

- [Chrome Web Store](https://chromewebstore.google.com/detail/bagfcickffpfkgecknaepmfleikeojik) para Chrome 127 o posterior
- [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/push-my-tabs/) para Firefox 142 o posterior

[Sitio web](https://pengusto.github.io/push-my-tabs/)

## Encuentra tu ritmo

![Cambiar de pestaña → Mover la pestaña activa](../assets/penguin/tabs-demo.gif)

*Ilustración del preajuste adaptativo, no una grabación de pantalla. La imagen tiene texto en inglés; las direcciones indican comandos de la extensión. Asigna tus propios atajos en el navegador.*

[Ilustración estática](../assets/penguin/tabs-demo-poster.png)

| Pestañas horizontales | Pestañas verticales |
| :--- | :--- |
| **Izquierda / Derecha** → Cambiar de pestaña | **Arriba / Abajo** → Cambiar de pestaña |
| **Arriba / Abajo** → Mover la pestaña activa | **Izquierda / Derecha** → Mover la pestaña activa |

Acciones rápidas: duplicar, fijar, silenciar, ir a la primera o última pestaña o moverla a una ventana nueva. Puedes configurar la disposición, el preajuste y los atajos opcionales.

<p align="center"><img src="../assets/penguin/mascot.png" width="132" alt="Un pingüino sostiene una pestaña con una flecha"></p>

## Primeros pasos

1. Instala la extensión desde uno de los enlaces de las tiendas de arriba.
2. Abre Navegación para ver las cuatro acciones direccionales. La barra lateral también incluye TabLoop, Disposición, Atajos y Configuración.
3. Cambia las asignaciones en Atajos, directamente en Firefox o con el editor de Chrome. Los símbolos de Mac y las etiquetas de Windows/Linux se muestran automáticamente. Empieza con el preajuste adaptativo y elige una disposición manual si es necesario.

Chrome estima la disposición a partir de la geometría de la ventana; un panel lateral abierto puede afectar la detección. Firefox 142+ lee directamente su ajuste de pestañas verticales.

## Tus pestañas siguen siendo tuyas

Sin cuentas, analíticas, publicidad ni código remoto. Los ajustes permanecen en el navegador. Chrome usa acceso temporal `activeTab` para perfiles locales; Firefox usa `storage` y `browserSettings` sin leer datos de las páginas.

[Privacidad](../../PRIVACY.md) · [Ayuda](https://github.com/pengusto/push-my-tabs/issues) · [Versiones](https://github.com/pengusto/push-my-tabs/releases) · [Registro de cambios](../../CHANGELOG.md)

<details>
<summary><strong>Idiomas, desarrollo y versiones</strong></summary>

## Estado actual

Los paquetes de Chrome y Firefox comparten el mismo código probado. Firefox 142 o posterior usa el ajuste exacto de pestañas verticales del navegador y permite editar los atajos compatibles desde la página de configuración.

El panel y las opciones comparten cinco vistas. Navegación ofrece acciones direccionales y otras acciones de pestañas. TabLoop recorre las pestañas abiertas por uso reciente entre ventanas. Disposición gestiona el modo global y las confirmaciones guardadas; Atajos contiene los comandos, preajustes y asignaciones personalizadas. Configuración incluye idioma, comportamiento y acceso a ventanas privadas.

## Idiomas

Chrome y Firefox eligen el idioma según la interfaz del navegador. También puedes cambiarlo en la configuración. Push My Tabs incluye inglés, alemán, español, francés, portugués de Brasil, italiano, polaco, turco, japonés, chino simplificado, árabe, ruso, ucraniano, kurdo kurmanji y persa darí. Los idiomas no compatibles usan inglés.

## Prueba local en Chrome

Primero crea la copia de desarrollo descomprimida:

Desde la raíz del repositorio, necesitas Node.js 22, `zip` y `unzip`. No hay un paso de instalación de paquetes.

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
node tests/ui-flow.test.mjs
node tests/shortcuts.test.mjs
node tests/release.test.mjs
node tests/store-publishing.test.mjs
jq empty manifests/chrome.json manifests/firefox.json
```

## Versiones para Chrome y Firefox

Chrome requiere Node.js 22, `zip` y `unzip`. Firefox requiere además `npx` y Firefox 142 o posterior. El paquete de Firefox ejecuta una versión fija de Mozilla `web-ext` y solo solicita `storage` y `browserSettings`; no recopila ni transmite datos.

```sh
./scripts/build-chrome.sh
./scripts/build-firefox.sh
```

Para una copia de desarrollo de Chrome, carga `dist/chrome-dev` una vez y actualízala después de ejecutar `./scripts/build-chrome-dev.sh`.

## Publicación automatizada

Ejecuta **Actions → Create release** en `main`, introduce la siguiente etiqueta (por ejemplo `v1.3.0`) y mantén activado el envío a las tiendas. El flujo prepara versiones y registro de cambios, valida y construye ambos paquetes y crea una publicación en GitHub. Tras conectar las cuentas una vez, envía los mismos paquetes a Chrome y Firefox. La revisión de las tiendas es asíncrona. [Configuración y reintentos](../releasing.md).

Las versiones etiquetadas están en [GitHub Releases](https://github.com/pengusto/push-my-tabs/releases). Consulta [CONTRIBUTING.md](../../CONTRIBUTING.md) para colaborar y [SECURITY.md](../../SECURITY.md) para informar de una vulnerabilidad en privado.

La extensión no usa permisos de host, scripts de contenido, cuentas, analítica, publicidad ni código remoto. El permiso `activeTab` de Chrome expone temporalmente solo la pestaña actual después de un atajo o una acción emergente para aplicar perfiles geométricos locales a su origen o ruta exacta. Firefox no solicita ese permiso ni lee datos de la página.

</details>

## Licencia

[MIT](../../LICENSE) · [Procedencia de las ilustraciones](../assets/README.md)
