const fs = require('fs');

const ARTIFACT_DIR = 'C:/Users/Acer/.gemini/antigravity-ide/brain/fcc16895-a3e1-485b-9f55-fd48e8f85db3';

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

  // Set window & device viewport to large desktop resolution so full forms are captured
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 1800,
    deviceScaleFactor: 1,
    mobile: false
  });

  const categories = [
    { name: 'Photography', title: 'Elysian Moments Fine-Art Photography', slug: 'photography' },
    { name: 'Music', title: 'The Rhythm Kings Wedding Ensemble', slug: 'music' },
    { name: 'Decorations', title: 'Aura Luxe Floral & Backdrop Scenography', slug: 'decorations' },
    { name: 'Catering', title: 'Imperial Heritage Banquet Catering', slug: 'catering' }
  ];

  for (const cat of categories) {
    // Navigate to vendor services
    await send('Page.navigate', { url: 'http://localhost:5173/vendor-services' });
    await new Promise(r => setTimeout(r, 1000));

    // Get listing ID
    const listingIdRes = await send('Runtime.evaluate', {
      expression: `
        (function() {
          const raw = localStorage.getItem('owp_vendor_listings_mock');
          const parsed = JSON.parse(raw || '[]');
          const item = parsed.find(l => l.title === ${JSON.stringify(cat.title)});
          return item ? item.id : null;
        })()
      `,
      returnByValue: true
    });

    const listingId = listingIdRes.result.value;
    console.log(`\nCapturing Edit Mode for [${cat.name}]: id=${listingId}`);

    // Click Edit button
    await send('Runtime.evaluate', {
      expression: `document.getElementById('edit-listing-' + ${JSON.stringify(listingId)})?.click()`
    });
    await new Promise(r => setTimeout(r, 1000));

    // Scroll down slightly so Step 1 fields are fully visible
    await send('Runtime.evaluate', {
      expression: `window.scrollTo(0, 200)`
    });
    await new Promise(r => setTimeout(r, 300));

    // Capture Step 1
    let ss = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
    fs.writeFileSync(`${ARTIFACT_DIR}/edit_step1_${cat.slug}_full.png`, Buffer.from(ss.data, 'base64'));
    console.log(`Saved edit_step1_${cat.slug}_full.png`);

    // Click next to Step 2
    await send('Runtime.evaluate', {
      expression: `document.getElementById('wizard-next-btn')?.click()`
    });
    await new Promise(r => setTimeout(r, 1000));

    // Scroll down to show category specifications and gated sections
    await send('Runtime.evaluate', {
      expression: `window.scrollTo(0, 200)`
    });
    await new Promise(r => setTimeout(r, 400));

    // Capture Step 2
    ss = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
    fs.writeFileSync(`${ARTIFACT_DIR}/edit_step2_${cat.slug}_full.png`, Buffer.from(ss.data, 'base64'));
    console.log(`Saved edit_step2_${cat.slug}_full.png`);
  }

  ws.close();
}

main().catch(console.error);
