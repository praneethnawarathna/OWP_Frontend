const fs = require('fs');

async function main() {
  const tabs = await fetch('http://127.0.0.1:9222/json/list').then(r => r.json());
  const pageTab = tabs.find(t => t.type === 'page');

  const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
  let id = 1;
  const pending = new Map();

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = id++;
      pending.set(msgId, { resolve, reject });
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) {
      const { resolve, reject } = pending.get(data.id);
      pending.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    }
  };

  await new Promise(r => ws.onopen = r);

  const evalRes = await send('Runtime.evaluate', {
    expression: `
      (function() {
        return JSON.stringify({
          origin: window.location.origin,
          href: window.location.href,
          keys: Object.keys(localStorage),
          token: localStorage.getItem('token'),
          mock: localStorage.getItem('owp_vendor_listings_mock')
        }, null, 2);
      })()
    `,
    returnByValue: true
  });

  console.log(evalRes.result.value);
  ws.close();
}

main().catch(console.error);
