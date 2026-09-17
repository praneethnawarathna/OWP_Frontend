const http = require('http');

function getTargets() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:9222/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function run() {
  const targets = await getTargets();
  const pageTarget = targets.find(t => t.type === 'page');
  if (!pageTarget) {
    console.log('No page target found');
    return;
  }

  const WebSocket = require('ws');
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

  let id = 1;
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = id++;
      const handler = (data) => {
        const msg = JSON.parse(data);
        if (msg.id === msgId) {
          ws.off('message', handler);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      };
      ws.on('message', handler);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  ws.on('open', async () => {
    try {
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
              details: p.details
            })), null, 2);
          })()
        `,
        returnByValue: true
      });
      console.log('Stored listings in localStorage:');
      console.log(evalRes.result.value);
    } catch (e) {
      console.error(e);
    } finally {
      ws.close();
    }
  });
}

run();
