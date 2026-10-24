import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

if (!process.env.PLAYWRIGHT_MODULE) throw new Error('Set PLAYWRIGHT_MODULE.');
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE));
const out = resolve('brag-output/store-images');
await mkdir(out, { recursive: true });
const data = async file => `data:image/png;base64,${(await readFile(file)).toString('base64')}`;
const logo = await data('src/assets/icons/icon-1024.png');
const views = [
  { id: 'navigation', title: 'Deine Tabs.<br>Im Fluss.', body: 'Wechseln und verschieben.<br>Mit vier einfachen Richtungen.', note: 'Navigation', accent: '← &nbsp; ↑ &nbsp; ↓ &nbsp; →' },
  { id: 'tabloop', title: 'Zurück zum<br>letzten Gedanken.', body: 'Mit TabLoop durch zuletzt verwendete,<br>noch offene Tabs wechseln.', note: 'TabLoop', accent: 'Einfach zurückspringen.' },
  { id: 'layout', title: 'So angeordnet,<br>wie du arbeitest.', body: 'Horizontal oder vertikal.<br>Erkennung und Vorgaben klar im Blick.', note: 'Anordnung', accent: 'Nativ · Geschätzt · Manuell' },
  { id: 'shortcuts', title: 'Deine Tasten.<br>Dein System.', body: 'Aktuelle Belegungen sehen.<br>Passend zu Mac, Windows und Linux.', note: 'Tastenbelegung', accent: '' },
  { id: 'settings', title: 'Klein im Popup.<br>Ganz bei dir.', body: 'Sprache und Tab-Verhalten einstellen.<br>Deine Einstellungen bleiben lokal.', note: 'Einstellungen', accent: 'Ohne Konto. Ohne Tracking.' },
];
const style = `*{box-sizing:border-box}html,body{margin:0;width:1280px;height:800px;overflow:hidden;background:#14131b;color:#f4f2fa;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.canvas{position:relative;width:1280px;height:800px;display:grid;grid-template-columns:1fr 464px;gap:60px;padding:65px 84px}.copy{display:flex;flex-direction:column;justify-content:center;padding-bottom:36px}.identity{display:flex;gap:14px;align-items:center;margin-bottom:40px;font-weight:600;font-size:22px;letter-spacing:-.5px}.identity img{width:43px;height:43px}h1{margin:0 0 24px;font-size:56px;line-height:1.1;letter-spacing:-2.3px;font-weight:650}p{margin:0;color:#b4b0c4;font-size:20px;line-height:1.65}.accent{margin-top:33px;color:#b9aaff;font-size:20px;font-weight:550}.panel{align-self:center;width:464px;height:650px;border:1px solid #443e54;border-radius:16px;overflow:hidden;box-shadow:0 24px 65px #0005;background:#14131b}.panel img{display:block;width:464px;height:650px}.footer{position:absolute;bottom:30px;left:84px;right:84px;display:flex;justify-content:space-between;color:#b4b0c4;font-size:14px}.keys{margin-top:28px;display:grid;grid-template-columns:90px 1fr;align-items:center;gap:11px 10px;color:#b4b0c4;font-size:16px}.keys kbd{justify-self:start;border:1px solid #4c455d;background:#211f2a;border-radius:7px;padding:8px 15px;color:#f4f2fa;font:18px -apple-system,BlinkMacSystemFont,sans-serif}.example{font-size:12px;color:#b4b0c4;margin-top:12px}`;
const browser = await chromium.launch({headless:true});
try {
  const page = await browser.newPage({viewport:{width:1280,height:800},deviceScaleFactor:1});
  for (const view of views) {
    const screen = await data(`brag-output/composition/assets/screens/${view.id}.png`);
    const extra = view.id === 'shortcuts' ? '<div class="keys"><span>Mac</span><kbd>⌥⇧→</kbd><span>Windows</span><kbd>Alt+Shift+→</kbd><span>Linux</span><kbd>Alt+Shift+→</kbd></div><div class="example">Darstellungsbeispiel · Belegungen frei wählbar</div>' : `<div class="accent">${view.accent}</div>`;
    const html = `<!doctype html><html lang="de"><meta charset="utf-8"><title>Push My Tabs — ${view.note}</title><style>${style}</style><div class="canvas"><div class="copy"><div class="identity"><img src="${logo}" alt="">Push My Tabs</div><h1>${view.title}</h1><p>${view.body}</p>${extra}</div><div class="panel"><img src="${screen}" alt="${view.note} — echte Chrome-Aufnahme"></div><div class="footer"><span>Für Chrome & Firefox</span><span>${view.note}</span></div></div></html>`;
    await writeFile(`${out}/${view.id}.html`, html);
    await page.setContent(html);
    await page.evaluate(()=>document.fonts.ready);
    await page.screenshot({path:`${out}/${view.id}.png`});
  }
  const thumbs = await Promise.all(views.map(async v=>`<figure><img src="${await data(`${out}/${v.id}.png`)}"><figcaption>${v.note}</figcaption></figure>`));
  await page.setViewportSize({width:1920,height:300});
  await page.setContent(`<!doctype html><style>*{box-sizing:border-box}body{margin:0;background:#eae7f0;padding:16px;display:flex;gap:12px;font:15px sans-serif;color:#282131}figure{margin:0;flex:1;min-width:0}img{width:100%;border-radius:8px}figcaption{padding:12px 0;text-align:center}</style>${thumbs.join('')}`);
  await page.screenshot({path:`${out}/all-five.png`});
  console.log('Exported five 1280 × 800 store images and all-five.png.');
} finally { await browser.close(); }
