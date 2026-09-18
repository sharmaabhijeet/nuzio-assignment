import { MongoMemoryServer } from 'mongodb-memory-server';
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { categories, demoStories } from '../shared/stories.js';
import { checkPlayer, checkTouchPlayer } from './check-player.mjs';
const children = [];
let mongo, browser;
async function start(command, args, extra = {}) {
  const child = spawn(command, args, { env: { ...process.env, ...extra }, stdio: ['ignore', 'pipe', 'pipe'] });
  children.push(child);
  child.stderr.on('data', data => process.stderr.write(data));
  return child;
}
async function waitFor(url) {
  for (let i = 0; i < 90; i++) {
    try { if ((await fetch(url)).ok) return; } catch {}
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  throw new Error(`Server did not start: ${url}`);
}
try {
  mongo = await MongoMemoryServer.create();
  const env = { MONGODB_URI: mongo.getUri(), PORT: '3101', FRONTEND_ORIGIN: 'http://localhost:3100' };
  const seed = await start(process.execPath, ['backend/src/seed.js'], env);
  assert.equal((await once(seed, 'exit'))[0], 0);
  await start(process.execPath, ['backend/src/index.js'], env);
  await start(process.execPath, ['node_modules/next/dist/bin/next', 'dev', 'frontend', '-p', '3100'], { BACKEND_URL: 'http://127.0.0.1:3101', NEXT_DIST_DIR: '.next-browser-check' });
  await waitFor('http://localhost:3101/api/health');
  await waitFor('http://localhost:3100');
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await mkdir('artifacts', { recursive: true });
  await page.setViewportSize({ width: 390, height: 844 });
  for (const screen of ['splash','language','login','profession','niches','voice','time','notifications','ready','brief','discover','settings','billing']) {
    await page.goto(`http://localhost:3100/?screen=${screen}`);
    await page.waitForURL(url => url.pathname !== '/');
    await page.waitForTimeout(250);
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.screenshot({ path: `artifacts/mobile-${screen}.png` });
  }
  await checkPlayer(page);
  await checkTouchPlayer(browser);
  await page.goto('http://localhost:3100/?screen=discover');
  for (const { label } of categories) {
    await page.locator('.category-tabs').getByRole('button', { name: label, exact: true }).click();
    await page.waitForFunction(label => document.querySelectorAll('.story-card').length === 2 && [...document.querySelectorAll('.story-card .tags .tag:first-child')].every(el => el.textContent === label.toUpperCase()), label);
  }
  await page.goto('http://localhost:3100');
  await page.getByRole('heading', { name: 'Choose your language' }).waitFor();
  await page.getByRole('button', { name: 'Continue →', exact: true }).click();
  await page.getByRole('button', { name: 'Continue with email' }).click();
  await page.getByRole('link', { name: 'New here? Create an account' }).click();
  await page.waitForURL('**/register');
  await page.getByLabel('Full name').fill('Alex Reader');
  await page.getByLabel('Email address').fill('alex@example.com');
  await page.getByLabel('Password', { exact: true }).fill('read-more-stories');
  await page.getByRole('button', { name: 'Create account', exact: true }).click();
  await page.getByRole('heading', { name: 'What’s your profession?' }).waitFor();
  await page.getByRole('button', { name: 'Continue →', exact: true }).click();
  await page.getByRole('button', { name: 'Continue →', exact: true }).click();
  await page.getByRole('button', { name: 'Continue with Aria · 5 stories →' }).click();
  await page.getByRole('button', { name: 'Continue →', exact: true }).click();
  await page.getByRole('button', { name: 'Not now', exact: true }).click();
  await page.getByRole('button', { name: 'Start listening →', exact: true }).click();
  await page.locator('.player-card').waitFor();
  await page.waitForFunction(() => document.querySelector('audio').duration > 5);
  await page.locator('.play-large').click();
  await page.waitForFunction(() => document.querySelector('audio').currentTime > 0.2);
  await page.locator('.play-large').click();
  await page.getByRole('slider', { name: 'Seek audio' }).press('ArrowRight');
  assert.ok(await page.locator('audio').evaluate(a => a.currentTime >= 5));
  await page.getByRole('button', { name: 'DISCOVER', exact: true }).click();
  await page.locator('.story-card').first().waitFor();
  assert.equal(await page.locator('.story-card').count(), demoStories.length);
  for (const { label } of categories) {
    await page.locator('.category-tabs').getByRole('button', { name: label, exact: true }).click();
    await page.waitForFunction(label => document.querySelectorAll('.story-card').length === 2 && [...document.querySelectorAll('.story-card .tags .tag:first-child')].every(el => el.textContent === label.toUpperCase()), label);
  }
  await page.locator('.category-tabs').getByRole('button', { name: 'All', exact: true }).click();
  await page.waitForFunction(count => document.querySelectorAll('.story-card').length === count, demoStories.length);
  await page.getByRole('button', { name: /^Save / }).first().click();
  await page.waitForFunction(() => document.querySelector('.save-star')?.getAttribute('aria-pressed') === 'true');
  await page.locator('.story-title').first().click();
  await page.locator('.story-reader').waitFor();
  assert.match(new URL(page.url()).pathname, /^\/stories\//);
  await page.reload();
  await page.locator('.story-reader h1').waitFor();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await page.getByRole('textbox', { name: 'Search stories' }).fill('artificial intelligence');
  await page.waitForFunction(() => document.querySelectorAll('.story-card').length === 1 && document.querySelector('.story-title')?.textContent.includes('artificial intelligence'));
  await page.getByRole('textbox', { name: 'Search stories' }).fill('');
  await page.getByRole('button', { name: 'SETTINGS', exact: true }).click();
  await page.getByRole('button', { name: /Saved stories/ }).click();
  await page.getByRole('heading', { name: 'Saved stories' }).waitFor();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await page.waitForURL('**/login');
  for (const path of ['/brief', '/discover', '/settings', '/saved', '/billing', '/onboarding/profession']) {
    await page.goto(`http://localhost:3100${path}`);
    await page.waitForURL('**/login');
    await page.getByRole('heading', { name: 'Welcome back.' }).waitFor();
  }
  await page.goto('http://localhost:3100/register');
  await page.getByRole('heading', { name: 'Create your account' }).waitFor();
  await page.getByRole('link', { name: 'Already registered? Sign in' }).click();
  await page.waitForURL('**/login');
  await page.getByLabel('Email address').fill('alex@example.com');
  await page.getByLabel('Password', { exact: true }).fill('read-more-stories');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.getByRole('heading', { name: /Good morning, Alex/ }).waitFor();
  await page.reload();
  await page.getByRole('heading', { name: /Good morning, Alex/ }).waitFor();
  assert.deepEqual(errors, []);
  console.log('Browser check passed: registration, preferences, feed, bookmarks, reading, search, mobile layout, logout, login, session persistence.');
} finally {
  await browser?.close();
  for (const child of children.reverse()) if (child.exitCode === null) child.kill('SIGTERM');
  await mongo?.stop();
}
