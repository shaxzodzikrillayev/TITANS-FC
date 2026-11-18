import { chromium } from 'playwright';

const base = 'http://127.0.0.1:5173';
const errors = [];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => { if (!localStorage.getItem('titansfc.lang')) localStorage.setItem('titansfc.lang', 'en'); });
const page = await ctx.newPage();
page.on('pageerror', e => errors.push(`PAGEERROR: ${e.message}`));
page.on('console', m => { if (m.type() === 'error') errors.push(`CONSOLE: ${m.text()}`); });
page.on('dialog', d => d.accept());

const log = (name, ok, extra = '') => console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + extra : ''}`);

await page.goto(base, { waitUntil: 'networkidle' });
log('home loads', await page.locator('h1').first().textContent().then(t => t?.includes('TITANS')));
await page.screenshot({ path: 'C:/Users/user/AppData/Local/Temp/opencode/titans-home.png', fullPage: false });

await page.goto(`${base}/squad`, { waitUntil: 'networkidle' });
const count = await page.locator('.player-card').count();
log('24 player cards', count === 24, `found ${count}`);
await page.locator('.player-card').first().click();
log('player modal opens', await page.locator('.modal[role=dialog]').isVisible());
await page.locator('.modal__close').click();
await page.screenshot({ path: 'C:/Users/user/AppData/Local/Temp/opencode/titans-squad.png', fullPage: false });

await page.goto(`${base}/tactics`, { waitUntil: 'networkidle' });
await page.getByRole('button', { name: /4-2-3-1/ }).click();
log('formation switch', await page.locator('.tactics-bar strong').textContent().then(t => t === '4-2-3-1'));
log('11 markers', await page.locator('.field .marker').count() === 11);
await page.screenshot({ path: 'C:/Users/user/AppData/Local/Temp/opencode/titans-tactics.png', fullPage: false });

await page.goto(`${base}/admin`, { waitUntil: 'networkidle' });
log('admin protected', page.url().includes('/login'), page.url());
await page.getByPlaceholder('Enter login').fill('admin');
await page.getByPlaceholder('Enter password').fill('titans2026');
await page.getByRole('button', { name: 'Sign in' }).click();
await page.waitForURL('**/admin');
log('admin login', page.url().endsWith('/admin'));

await page.getByRole('button', { name: 'Add player' }).click();
await page.getByLabel('First name').fill('Test');
await page.getByLabel('Last name').fill('Player');
await page.getByLabel('Shirt number').fill('99');
await page.getByLabel('Country').fill('England');
await page.getByRole('button', { name: 'Save player' }).click();
log('player created', await page.getByText('Test Player').count() > 0);

await page.reload({ waitUntil: 'networkidle' });
log('player persists after reload', await page.getByText('Test Player').count() > 0);

const editButton = page.getByRole('button', { name: 'Delete Player' });
await editButton.click();
log('player deleted', await page.getByText('Test Player').count() === 0);

await page.getByRole('button', { name: 'Club info' }).click();
const slogan = page.getByLabel('Slogan');
await slogan.fill('ONE TEAM. ONE LEGACY.');
await page.getByRole('button', { name: 'Save changes' }).click();
await page.reload({ waitUntil: 'networkidle' });
await page.getByRole('button', { name: 'Club info' }).click();
log('club save persists', await page.getByLabel('Slogan').inputValue().then(v => v === 'ONE TEAM. ONE LEGACY.'));
await page.getByLabel('Slogan').fill('ONE TEAM. ONE DREAM.');
await page.getByRole('button', { name: 'Save changes' }).click();

await page.getByRole('button', { name: 'Tactics' }).click();
const marker = page.locator('.field--editable .marker').first();
const box = await marker.boundingBox();
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await page.mouse.down();
await page.mouse.move(box.x + box.width / 2 + 60, box.y + box.height / 2 + 60, { steps: 6 });
await page.mouse.up();
await page.getByRole('button', { name: 'Save formation' }).click();
const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('titansfc.database.v1.en')).tactics.find(t => t.formation === '4-3-3'));
log('tactic drag saved', Object.keys(stored.player_positions).length === 11, `${Object.keys(stored.player_positions).length} positions`);

await page.getByRole('button', { name: 'News' }).click();
await page.getByRole('button', { name: 'New article' }).click();
await page.getByLabel('Title').fill('Smoke test article');
await page.getByLabel('Description').fill('This article verifies CRUD operations.');
await page.getByRole('button', { name: 'Save article' }).click();
log('news created', await page.getByText('Smoke test article').count() > 0);
await page.goto(base, { waitUntil: 'networkidle' });
log('news visible on home', await page.getByText('Smoke test article').count() > 0);
await page.goto(`${base}/admin`, { waitUntil: 'networkidle' });
await page.getByRole('button', { name: 'News' }).click();
await page.getByRole('button', { name: 'Delete Smoke test article' }).click();
log('news deleted', await page.getByText('Smoke test article').count() === 0);

await page.setViewportSize({ width: 390, height: 844 });
await page.goto(`${base}/squad`, { waitUntil: 'networkidle' });
await page.screenshot({ path: 'C:/Users/user/AppData/Local/Temp/opencode/titans-mobile.png', fullPage: false });
const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
log('no horizontal overflow on mobile', !overflow);

// Localization check in a fresh context (Russian by default, then Uzbek).
const i18nCtx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const i18nPage = await i18nCtx.newPage();
i18nPage.on('pageerror', e => errors.push(`I18N PAGEERROR: ${e.message}`));
await i18nPage.goto(base, { waitUntil: 'networkidle' });
log('Russian by default', await i18nPage.locator('.nav__link').first().textContent().then(t => t === 'Главная'));
log('Russian content', await i18nPage.locator('.hero__slogan').textContent().then(t => t === 'ОДНА КОМАНДА. ОДНА МЕЧТА.'));
await i18nPage.getByRole('button', { name: "O'Z" }).click();
log('Uzbek switch', await i18nPage.locator('.nav__link').first().textContent().then(t => t === 'Bosh sahifa'));
log('Uzbek content', await i18nPage.locator('.hero__slogan').textContent().then(t => t === 'BIR JAMOA. BIR ORZU.'));
await i18nPage.goto(`${base}/squad`, { waitUntil: 'networkidle' });
log('Uzbek squad labels', await i18nPage.locator('.filter').first().textContent().then(t => t?.includes('Barcha futbolchilar')));

console.log('\nConsole/page errors:', errors.length ? errors : 'none');
await browser.close();
