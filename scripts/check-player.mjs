import assert from 'node:assert/strict';

async function ready(page) {
  await page.waitForFunction(() => {
    const audio = document.querySelector('audio');
    return audio && Number.isFinite(audio.duration) && audio.duration > 5;
  });
}
async function snapshot(page) {
  return page.locator('audio').evaluate(audio => ({ time: audio.currentTime, duration: audio.duration, paused: audio.paused, rate: audio.playbackRate, src: audio.currentSrc, ended: audio.ended }));
}
async function seekTo(page, fraction) {
  const box = await page.locator('.audio-timeline').boundingBox();
  await page.mouse.click(box.x + box.width * fraction, box.y + box.height / 2);
  await page.waitForFunction(fraction => {
    const audio = document.querySelector('audio');
    return Math.abs(audio.currentTime - audio.duration * fraction) < 0.75;
  }, fraction);
}
export async function checkPlayer(page) {
  await page.goto('http://localhost:3100/?screen=brief');
  await ready(page);
  const initial = await snapshot(page);
  assert.equal(initial.paused, true);
  assert.equal(initial.time, 0);
  assert.equal(await page.getByTestId('elapsed-time').textContent(), '00:00');
  assert.equal(Number(await page.getByRole('slider', { name: 'Seek audio' }).getAttribute('max')), initial.duration);
  const range = await page.request.get(initial.src, { headers: { Range: 'bytes=0-1023' } });
  assert.equal(range.status(), 206, 'Audio must support real byte-range requests');
  assert.match(range.headers()['content-range'], /^bytes 0-1023\//);

  await page.locator('.play-large').click();
  await page.waitForFunction(() => { const a = document.querySelector('audio'); return !a.paused && a.currentTime > 0.3; });
  const beforeNavigation = await snapshot(page);
  await page.getByRole('button', { name: 'DISCOVER', exact: true }).click();
  await page.waitForURL('**/discover?preview=1');
  await page.waitForFunction(time => document.querySelector('audio').currentTime > time, beforeNavigation.time);
  assert.equal((await snapshot(page)).src, beforeNavigation.src);
  assert.equal((await snapshot(page)).paused, false);
  await page.goBack();
  await page.waitForURL('**/brief?preview=1');
  await page.locator('.play-large').click();
  const pausedAt = await snapshot(page);
  await page.waitForTimeout(250);
  assert.equal((await snapshot(page)).time, pausedAt.time, 'Pause must preserve position');
  await seekTo(page, 0.6);
  assert.equal((await snapshot(page)).paused, true, 'Seeking while paused must stay paused');

  const box = await page.locator('.audio-timeline').boundingBox();
  await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.25, box.y + box.height / 2, { steps: 8 });
  await page.mouse.up();
  assert.ok(Math.abs((await snapshot(page)).time - initial.duration * 0.25) < 0.4);
  await page.getByRole('slider', { name: 'Seek audio' }).press('ArrowRight');
  assert.ok(Math.abs((await snapshot(page)).time - (initial.duration * 0.25 + 5)) < 0.4);
  const beforeResume = await snapshot(page);
  await page.locator('.play-large').click();
  await page.waitForFunction(time => { const a = document.querySelector('audio'); return !a.paused && a.currentTime > time + 0.2; }, beforeResume.time);
  await seekTo(page, 0.5);
  assert.equal((await snapshot(page)).paused, false, 'Seeking during playback must keep playing');
  await page.getByRole('button', { name: 'Playback speed', exact: true }).click();
  await page.waitForFunction(() => document.querySelector('audio').playbackRate === 1.25);
  assert.equal((await snapshot(page)).paused, false, 'Speed changes must not stop playback');
  assert.ok((await snapshot(page)).time >= initial.duration * 0.5);
  await page.getByRole('button', { name: 'Next story', exact: true }).click();
  await page.waitForFunction(src => { const a = document.querySelector('audio'); return a.currentSrc !== src && !a.paused && a.currentTime > 0; }, initial.src);
  assert.ok((await snapshot(page)).time < 3);
  assert.equal((await snapshot(page)).rate, 1.25);
  await page.locator('.play-large').click();
  await page.getByRole('button', { name: 'Previous story', exact: true }).click();
  await ready(page);
  assert.equal((await snapshot(page)).paused, true);
  assert.equal((await snapshot(page)).time, 0);
  assert.equal(await page.getByRole('button', { name: 'Previous story', exact: true }).isDisabled(), true);

  // Natural ended event advances to the next recording when enabled.
  await seekTo(page, 0.985);
  await page.locator('.play-large').click();
  await page.waitForFunction(src => { const a = document.querySelector('audio'); return a.currentSrc !== src && !a.paused; }, initial.src);
  await page.locator('.play-large').click();
  await page.getByRole('button', { name: 'SETTINGS', exact: true }).click();
  await page.getByRole('switch', { name: 'Auto-advance', exact: true }).click();
  await page.getByRole('button', { name: 'Open morning brief', exact: true }).click();
  const last = await snapshot(page);
  await seekTo(page, 0.985);
  await page.locator('.play-large').click();
  await page.waitForFunction(() => document.querySelector('audio').ended);
  assert.equal((await snapshot(page)).src, last.src);
  await page.locator('.play-large').click();
  await page.waitForFunction(() => { const a = document.querySelector('audio'); return !a.paused && a.currentTime > 0 && a.currentTime < 3; });
  await page.locator('.play-large').click();
  await page.screenshot({ path: 'artifacts/mobile-player-functional.png' });

  // A missing recording has a visible error and a usable retry action.
  await page.route('**/audio/demo-science-1.mp3', route => route.fulfill({ status: 404, body: 'Missing test recording' }));
  await page.locator('.category-tabs').getByRole('button', { name: 'Science', exact: true }).click();
  await page.getByRole('alert').filter({ hasText: 'Audio could not be loaded' }).waitFor();
  assert.equal((await snapshot(page)).paused, true);
  await page.unroute('**/audio/demo-science-1.mp3');
  await page.locator('.play-large').click();
  await page.waitForFunction(() => { const a = document.querySelector('audio'); return !a.paused && a.currentTime > 0; });
  await page.locator('.play-large').click();
  console.log('Player passed: real MP3 playback/range support, click/drag/keyboard seeking, pause/resume, live speed, track switching, auto-advance, replay, and error retry.');
}

export async function checkTouchPlayer(browser) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  try {
    await page.goto('http://localhost:3100/?screen=brief');
    await ready(page);
    const box = await page.locator('.audio-timeline').boundingBox();
    await page.touchscreen.tap(box.x + box.width * 0.65, box.y + box.height / 2);
    assert.ok(Math.abs((await snapshot(page)).time - (await snapshot(page)).duration * 0.65) < 0.5);
    await page.locator('.play-large').tap();
    await page.waitForFunction(() => !document.querySelector('audio').paused);
    const cdp = await page.context().newCDPSession(page);
    const y = box.y + box.height / 2;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: box.x + box.width * 0.75, y }] });
    for (const fraction of [0.65, 0.5, 0.35, 0.2]) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: box.x + box.width * fraction, y }] });
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.waitForFunction(() => { const a = document.querySelector('audio'); return Math.abs(a.currentTime - a.duration * 0.2) < 1; });
    assert.equal((await snapshot(page)).paused, false);
    console.log('Mobile touch passed: tap-to-seek and drag-to-seek while audio keeps playing.');
  } finally { await page.close(); }
}
