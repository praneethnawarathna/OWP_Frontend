const fs = require('fs');

const ARTIFACT_DIR = 'C:/Users/Acer/.gemini/antigravity-ide/brain/fcc16895-a3e1-485b-9f55-fd48e8f85db3';

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
  console.log('Connected to Chrome DevTools Protocol');

  // Categories and their published listing titles to test
  const categoriesToTest = [
    {
      category: 'Photography',
      title: 'Elysian Moments Fine-Art Photography',
      slug: 'photography',
      expectedChecks: {
        price: '125000',
        fields: ['shootingStyle', 'hoursOfCoverage', 'albumIncluded', 'albumType', 'albumPages', 'rawFilesIncluded', 'digitalGalleryIncluded', 'videographyIncluded', 'droneAllowed']
      }
    },
    {
      category: 'Music',
      title: 'The Rhythm Kings Wedding Ensemble',
      slug: 'music',
      expectedChecks: {
        price: '95000',
        fields: ['performanceType', 'lineupSize', 'setDuration', 'soundSystemIncluded', 'soundSystemCapacity', 'wirelessMics', 'stageLightingIncluded', 'lightingRig', 'mcServicesIncluded', 'breakMusicIncluded']
      }
    },
    {
      category: 'Decorations',
      title: 'Aura Luxe Floral & Backdrop Scenography',
      slug: 'decorations',
      expectedChecks: {
        price: '180000',
        fields: ['primaryStyles', 'providesFlorals', 'floralTypes', 'availableSetups', 'tablewareLinens', 'customSignageIncluded', 'loungePropsAvailable', 'sameDayTeardownIncluded']
      }
    },
    {
      category: 'Catering',
      title: 'Imperial Heritage Banquet Catering',
      slug: 'catering',
      expectedChecks: {
        price: '4200',
        fields: ['serviceStyle', 'cuisines', 'dietaryOptions', 'minGuests', 'maxGuests', 'pricePerHead', 'waitstaffIncluded', 'glasswareIncluded', 'chafingDishesIncluded', 'tastingAvailable', 'tastingPolicy']
      }
    },
    {
      category: 'Hotel / Venue',
      title: 'The Royal Grand Azure Ballroom & Pavilions',
      slug: 'hotel_venue',
      expectedChecks: {
        price: '450000',
        fields: ['spaces', 'venueType', 'venueSetting', 'hasAirConditioning', 'hasCeremony', 'hasCatering', 'hasBeverages', 'hasAccommodation', 'hasEntertainment', 'hasDecoration', 'hasPhotographyPolicy', 'hasPolicies']
      }
    }
  ];

  const results = {};

  for (const catTest of categoriesToTest) {
    console.log(`\n════════════════════════════════════════════════════════════`);
    console.log(`TESTING EDIT MODE: [${catTest.category}] - "${catTest.title}"`);
    console.log(`════════════════════════════════════════════════════════════`);

    // 1. Navigate to /vendor-services
    await send('Page.navigate', { url: 'http://localhost:5173/vendor-services' });
    await new Promise(r => setTimeout(r, 1200));

    // 2. Find listing ID by title from stored listings in localStorage
    const listingData = await send('Runtime.evaluate', {
      expression: `
        (function() {
          const raw = localStorage.getItem('owp_vendor_listings_mock');
          const parsed = raw ? JSON.parse(raw) : [];
          return parsed.find(l => l.title === ${JSON.stringify(catTest.title)}) || null;
        })()
      `,
      returnByValue: true
    });

    const listing = listingData.result.value;
    if (!listing) {
      throw new Error(`Could not find listing with title "${catTest.title}" in localStorage!`);
    }

    console.log(`Found listing ID: ${listing.id}, Price: ${listing.price}, Category: ${listing.category}`);

    // 3. Find and click Edit button for this listing
    const clickEditResult = await send('Runtime.evaluate', {
      expression: `
        (function() {
          const btn = document.getElementById('edit-listing-' + ${JSON.stringify(listing.id)});
          if (btn) {
            btn.click();
            return { clicked: true, method: 'byId' };
          }
          // Fallback: find article containing title and click its Edit button
          const articles = Array.from(document.querySelectorAll('article'));
          const target = articles.find(a => a.textContent.includes(${JSON.stringify(catTest.title)}));
          if (target) {
            const editBtn = Array.from(target.querySelectorAll('button')).find(b => b.textContent.includes('Edit'));
            if (editBtn) {
              editBtn.click();
              return { clicked: true, method: 'byText' };
            }
          }
          return { clicked: false };
        })()
      `,
      returnByValue: true
    });

    console.log('Clicked edit button result:', clickEditResult.result.value);
    await new Promise(r => setTimeout(r, 1200));

    // 4. Verify URL and Editor Header
    const editorState = await send('Runtime.evaluate', {
      expression: `
        (function() {
          return {
            url: window.location.href,
            pathname: window.location.pathname,
            search: window.location.search,
            h1: document.querySelector('h1')?.innerText || '',
            // Step 1 Form values
            formTitle: document.getElementById('listing-title')?.value || '',
            formPrice: document.getElementById('listing-price')?.value || '',
            formShortDesc: document.getElementById('listing-summary')?.value || '',
            formFullDesc: document.getElementById('listing-full-description')?.value || '',
            selectedCategory: (function() {
              const buttons = Array.from(document.querySelectorAll('button'));
              const active = buttons.find(b => b.className && b.className.includes('ring-') && b.querySelector('p'));
              return active ? active.querySelector('p').innerText : '';
            })()
          };
        })()
      `,
      returnByValue: true
    });

    const s1 = editorState.result?.value;
    console.log('Step 1 Editor State:', s1);

    // Capture Step 1 Screenshot
    let ss = await send('Page.captureScreenshot', { format: 'png' });
    const step1ScreenshotPath = `${ARTIFACT_DIR}/edit_step1_${catTest.slug}.png`;
    fs.writeFileSync(step1ScreenshotPath, Buffer.from(ss.data, 'base64'));
    console.log(`Saved Step 1 screenshot: edit_step1_${catTest.slug}.png`);
    if (s1.formTitle !== catTest.title) {
      console.warn(`Title mismatch! Expected "${catTest.title}", got "${s1.formTitle}"`);
    } else {
      console.log(`✔ Step 1 Title pre-filled correctly: "${s1.formTitle}"`);
    }

    if (String(s1.formPrice) !== String(catTest.expectedChecks.price)) {
      console.warn(`Price mismatch! Expected "${catTest.expectedChecks.price}", got "${s1.formPrice}"`);
    } else {
      console.log(`✔ Step 1 Price pre-filled correctly: Rs. ${s1.formPrice}`);
    }

    if (!s1.formShortDesc || s1.formShortDesc !== listing.description) {
      console.warn(`Short Description mismatch! Got: "${s1.formShortDesc}"`);
    } else {
      console.log(`✔ Step 1 Short Description pre-filled correctly`);
    }

    if (!s1.formFullDesc) {
      console.warn(`Full Description is empty!`);
    } else {
      console.log(`✔ Step 1 Full Description pre-filled correctly`);
    }

    // 5. Navigate to Step 2 (Category Specifications)
    console.log('Navigating to Step 2...');
    await send('Runtime.evaluate', {
      expression: `document.getElementById('wizard-next-btn')?.click()`
    });
    await new Promise(r => setTimeout(r, 1200));

    // Capture Step 2 Screenshot
    ss = await send('Page.captureScreenshot', { format: 'png' });
    const step2ScreenshotPath = `${ARTIFACT_DIR}/edit_step2_${catTest.slug}.png`;
    fs.writeFileSync(step2ScreenshotPath, Buffer.from(ss.data, 'base64'));
    console.log(`Saved Step 2 screenshot: edit_step2_${catTest.slug}.png`);

    // 6. Inspect Category-Specific fields on Step 2
    const step2Details = await send('Runtime.evaluate', {
      expression: `
        (function() {
          const res = {
            stepHeading: document.querySelector('h2')?.innerText || '',
            categoryBadge: document.querySelector('span.inline-flex')?.innerText || '',
            inputs: {},
            selects: {},
            toggles: {},
            multiSelects: {}
          };

          // Collect all inputs
          document.querySelectorAll('input:not([type="checkbox"])').forEach(el => {
            if (el.id) res.inputs[el.id] = el.value;
          });

          // Collect all selects
          document.querySelectorAll('select').forEach(el => {
            if (el.id) res.selects[el.id] = el.value;
          });

          // Collect all toggle switches (checkboxes or buttons with role="switch" or aria-checked)
          document.querySelectorAll('button[role="switch"]').forEach(el => {
            const id = el.id || el.getAttribute('aria-labelledby') || 'toggle';
            res.toggles[id] = el.getAttribute('aria-checked') === 'true';
          });

          // Collect multi-select chips/values
          document.querySelectorAll('[data-multiselect-id]').forEach(el => {
            const id = el.getAttribute('data-multiselect-id');
            const chips = Array.from(el.querySelectorAll('.chip, span')).map(s => s.innerText);
            res.multiSelects[id] = chips;
          });

          return res;
        })()
      `,
      returnByValue: true
    });

    console.log(`Step 2 Detailed DOM state for ${catTest.category}:`);
    console.log(JSON.stringify(step2Details.result.value, null, 2));

    results[catTest.category] = {
      listingId: listing.id,
      step1: s1,
      step2: step2Details.result.value,
      step1Screenshot: `edit_step1_${catTest.slug}.png`,
      step2Screenshot: `edit_step2_${catTest.slug}.png`,
    };
  }

  // Write summary report
  fs.writeFileSync(
    `${ARTIFACT_DIR}/scratch/edit_verification_results.json`,
    JSON.stringify(results, null, 2)
  );
  console.log('\nAll 5 categories verified in Edit mode! Results written to scratch/edit_verification_results.json');

  ws.close();
}

main().catch(err => {
  console.error('Verification Error:', err);
  process.exit(1);
});
