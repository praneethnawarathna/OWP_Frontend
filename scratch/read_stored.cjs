const fs = require('fs');

async function main() {
  const tabs = await fetch('http://127.0.0.1:9222/json/list').then(r => r.json());
  const pageTab = tabs.find(t => t.type === 'page');
  console.log('Using tab:', pageTab.id, pageTab.url);

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
        const raw = localStorage.getItem('owp_vendor_listings_mock');
        const parsed = raw ? JSON.parse(raw) : [];
        return JSON.stringify(parsed.map(p => ({
          id: p.id,
          title: p.title,
          category: p.category,
          price: p.price,
          hasDetails: !!p.details,
          detailsSummary: p.details ? {
            keysCount: Object.keys(p.details).length,
            // photography keys
            shootingStyle: p.details.shootingStyle,
            albumIncluded: p.details.albumIncluded,
            rawFilesIncluded: p.details.rawFilesIncluded,
            // music keys
            performanceType: p.details.performanceType,
            soundSystemIncluded: p.details.soundSystemIncluded,
            // decorations keys
            primaryStyles: p.details.primaryStyles,
            providesFlorals: p.details.providesFlorals,
            // catering keys
            serviceStyle: p.details.serviceStyle,
            waitstaffIncluded: p.details.waitstaffIncluded,
            tastingAvailable: p.details.tastingAvailable
          } : null
        })), null, 2);
      })()
    `,
    returnByValue: true
  });

  console.log('Stored listings details:');
  console.log(evalRes.result.value);
  ws.close();
}

main().catch(console.error);
