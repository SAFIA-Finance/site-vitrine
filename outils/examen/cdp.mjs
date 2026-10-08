// Pilote un Chrome sans interface par le protocole DevTools, sans dépendance :
// Node fournit WebSocket et fetch depuis sa version 22.
//
// POURQUOI PAS L'EXTENSION DU NAVIGATEUR, ni « chrome --screenshot ». Les deux
// ont été essayés le 8 octobre 2026. Dans un onglet que l'on ne regarde pas,
// les captures expirent, les transitions ne tournent pas et le focus clavier
// ne prend pas. Et « --screenshot » ne descend pas sous 500 px de large : une
// capture « à 390 px » est une page de 500 px rognée. Ici l'écran est un vrai
// écran de téléphone, et un appui sur Tab est un vrai appui.
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';

// Chrome d'abord, Edge ensuite : même moteur. La variable CHROME l'emporte.
export function trouverChrome() {
  const candidats = [
    process.env.CHROME,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
  ];
  return candidats.find((c) => c && existsSync(c)) || null;
}

const pause = (ms) => new Promise((r) => setTimeout(r, ms));

export async function lancer({ chrome, port = 9333, profil }) {
  const proc = spawn(chrome, [
    '--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profil}`,
    '--disable-gpu', '--no-first-run', '--hide-scrollbars', '--mute-audio', 'about:blank',
  ], { stdio: 'ignore' });

  let version;
  for (let i = 0; i < 60 && !version; i++) {
    try { version = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json(); } catch { await pause(250); }
  }
  if (!version) throw new Error('Chrome ne répond pas');

  const ws = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0;
  const attente = new Map();
  const ecouteurs = new Map(); // sessionId -> [fn]
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.id && attente.has(d.id)) {
      const { r, j } = attente.get(d.id); attente.delete(d.id);
      d.error ? j(new Error(d.error.message)) : r(d.result);
    } else if (d.method && d.sessionId) {
      (ecouteurs.get(d.sessionId) || []).forEach((fn) => fn(d.method, d.params));
    }
  };
  const envoyer = (method, params = {}, sessionId) => new Promise((r, j) => {
    const n = ++id; attente.set(n, { r, j });
    ws.send(JSON.stringify({ id: n, method, params, ...(sessionId ? { sessionId } : {}) }));
  });

  async function page() {
    const { targetId } = await envoyer('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await envoyer('Target.attachToTarget', { targetId, flatten: true });
    const s = (method, params) => envoyer(method, params, sessionId);
    const journal = { erreurs: [], requetes: [] };
    let charge = null;
    ecouteurs.set(sessionId, [(method, p) => {
      if (method === 'Page.loadEventFired' && charge) { charge(); charge = null; }
      if (method === 'Runtime.exceptionThrown') journal.erreurs.push((p.exceptionDetails.exception?.description || p.exceptionDetails.text || '').slice(0, 200));
      if (method === 'Log.entryAdded' && p.entry.level === 'error') journal.erreurs.push((p.entry.text + ' ' + (p.entry.url || '')).slice(0, 200));
      if (method === 'Network.responseReceived' && p.response.status >= 400) journal.requetes.push(p.response.status + ' ' + p.response.url);
      if (method === 'Network.loadingFailed' && !p.canceled) journal.requetes.push('échec ' + p.errorText);
    }]);
    await s('Page.enable'); await s('Runtime.enable'); await s('Log.enable'); await s('Network.enable');

    const api = {
      journal,
      s,
      async taille(largeur, hauteur, mobile = false) {
        await s('Emulation.setDeviceMetricsOverride', { width: largeur, height: hauteur, deviceScaleFactor: 1, mobile });
        if (mobile) await s('Emulation.setTouchEmulationEnabled', { enabled: true });
      },
      async aller(url, attenteMs = 250) {
        journal.erreurs.length = 0; journal.requetes.length = 0;
        const fini = new Promise((r) => { charge = r; });
        await s('Page.navigate', { url });
        await Promise.race([fini, pause(15000)]);
        await pause(attenteMs);
      },
      async js(expression) {
        const r = await s('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
        if (r.exceptionDetails) throw new Error('JS : ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
        return r.result.value;
      },
      async touche(key, code, keyCode, modifiers = 0) {
        await s('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: keyCode, modifiers });
        await s('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: keyCode, modifiers });
      },
      async souris(type, x, y, extra = {}) { await s('Input.dispatchMouseEvent', { type, x, y, button: 'none', ...extra }); },
      async clic(x, y) {
        await s('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
        await s('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
      },
      async toucher(x, y) {
        await s('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
        await s('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      },
      async capture(fichier, opts = {}) {
        const { data } = await s('Page.captureScreenshot', { format: 'png', ...opts });
        const { writeFileSync } = await import('node:fs');
        writeFileSync(fichier, Buffer.from(data, 'base64'));
      },
      async fermer() { await envoyer('Target.closeTarget', { targetId }); },
    };
    return api;
  }

  return { page, pause, async arreter() { try { await envoyer('Browser.close'); } catch {} proc.kill(); } };
}
