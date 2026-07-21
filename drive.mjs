import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
page.on('console', (msg) => console.log('CONSOLE', msg.type(), msg.text()));
page.on('pageerror', (err) => console.log('PAGEERROR', err.message));

await page.goto('http://localhost:5175', { waitUntil: 'networkidle' });

await page.locator('#salesRepNameField').dispatchEvent('input');
await page.evaluate(() => { document.querySelector('#getStartedButton').disabled = false; });
await page.click('button.welcome-get-started-button');
await page.waitForSelector('.products-grid', { timeout: 5000 });
await page.screenshot({ path: 'shots/02-products.png' });

await page.click('button.product-card:has-text("Avaira Vitality Toric")');
await page.waitForSelector('.product-modal', { timeout: 5000 });
await page.screenshot({ path: 'shots/03-modal.png' });

await page.click('button.product-modal-action:has-text("Fit set")');
await page.waitForSelector('.fitset-page', { timeout: 5000 });
await page.waitForTimeout(500);
await page.screenshot({ path: 'shots/04-fitset-top.png' });

const cyl175Banner = page.locator('.fitset-full-row-banner', { hasText: 'Cyl -1.25' });
if (await cyl175Banner.count() > 0) {
    await cyl175Banner.first().scrollIntoViewIfNeeded();
    await page.screenshot({ path: 'shots/05-fitset-banner.png' });
}

// click a couple cards to test selection
const cards = page.locator('.fitset-card:not(.fitset-card--empty)');
await cards.nth(0).click();
await cards.nth(5).click();
await page.screenshot({ path: 'shots/06-fitset-selected.png' });

console.log('summary text:', await page.locator('.fitset-selection-summary').textContent());
console.log('drawer count text:', await page.locator('.fitset-drawer-count').first().textContent());

await browser.close();
