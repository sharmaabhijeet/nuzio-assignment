import { test } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { Article, User, Session, Bookmark } from '../src/models/index.js';
import { insertMissingArticles } from '../src/routes/news.routes.js';
import { demoStories } from '../../shared/stories.js';

test('MongoDB-backed authentication, personalization and bookmark isolation', async t => {
  const mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  t.after(async () => { await mongoose.disconnect(); await mongo.stop(); });
  await Promise.all([User.init(), Session.init(), Article.init(), Bookmark.init()]);
  const app = createApp(), reader = request.agent(app), other = request.agent(app);
  const account = { name: 'Reader', email: 'reader@example.com', password: 'test-password-123' };
  await reader.get('/api/news').expect(401);
  await reader.post('/api/auth/register').send({ ...account, email: 'bad' }).expect(400);
  const registered = await reader.post('/api/auth/register').send(account).expect(201);
  assert.equal(registered.body.user.password, undefined);
  assert.match(registered.headers['set-cookie'][0], /HttpOnly/);
  await reader.post('/api/auth/register').send(account).expect(409);
  await reader.post('/api/auth/login').send({ ...account, password: 'wrong-password' }).expect(401);
  await reader.put('/api/interests').send({ interests: ['Invalid'] }).expect(400);
  await reader.put('/api/interests').send({ interests: ['Science'] }).expect(200);
  const [tech, science] = await Article.create([
    { slug: 'tech', title: 'Technology today', summary: 'Technical ideas', content: 'Full article', topic: 'Technology', category: 'AI & Tech', publishedAt: new Date('2026-09-18') },
    { slug: 'science', title: 'Science today', summary: 'Scientific ideas', content: 'Full article', topic: 'Science', category: 'Science', audioUrl: '/audio/demo-science-1.mp3', publishedAt: new Date('2026-09-17') },
  ]);
  const feed = await reader.get('/api/news').expect(200);
  assert.equal(feed.body.articles[0].id, String(science._id));
  assert.equal((await reader.get('/api/news?q=technology')).body.articles.length, 1);
  assert.equal((await reader.get('/api/news?q=%5B')).body.articles.length, 0);
  assert.equal((await reader.get('/api/news?topic=Technology')).body.articles[0].id, String(tech._id));
  await reader.put(`/api/bookmarks/${science._id}`).send({}).expect(200);
  await reader.put(`/api/bookmarks/${science._id}`).send({}).expect(200);
  assert.equal((await reader.get('/api/bookmarks')).body.articles.length, 1);
  await other.post('/api/auth/register').send({ ...account, email: 'other@example.com' }).expect(201);
  assert.equal((await other.get('/api/bookmarks')).body.articles.length, 0);
  assert.equal((await reader.get(`/api/news/${science._id}`)).body.article.content, 'Full article');
  await reader.get('/api/news/invalid').expect(404);
  await reader.put(`/api/bookmarks/${new mongoose.Types.ObjectId()}`).send({}).expect(404);
  await reader.delete(`/api/bookmarks/${science._id}`).expect(200);
  assert.equal((await reader.get('/api/bookmarks')).body.articles.length, 0);
  await reader.put('/api/interests').set('Origin', 'https://untrusted.example').send({ interests: [] }).expect(403);
  await reader.post('/api/auth/logout').send({}).expect(200);
  await reader.get('/api/auth/me').expect(401);
  await reader.post('/api/auth/login').send(account).expect(200);
  assert.deepEqual((await reader.get('/api/auth/me')).body.user.interests, ['Science']);
  await t.test('explicit app route mounts protect resources and preserve user aliases', async () => {
    await request(app).get('/api/health').expect(200);
    await request(app).get('/api/topics').expect(200);
    for (const path of ['/api/users/me', '/api/auth/me', '/api/news', '/api/bookmarks']) {
      await request(app).get(path).expect(401);
    }
    await request(app).put('/api/users/interests').send({ interests: [] }).expect(401);
    await request(app).put('/api/interests').send({ interests: [] }).expect(401);
    await request(app).post('/api/auth/logout').send({}).expect(401);
    const profile = await reader.get('/api/users/me').expect(200);
    assert.deepEqual(profile.body, (await reader.get('/api/auth/me')).body);
    assert.equal(profile.body.user.password, undefined);
    await reader.put('/api/users/interests').send({ interests: ['Technology'] }).expect(200);
    assert.deepEqual((await reader.get('/api/auth/me')).body.user.interests, ['Technology']);
    await reader.put('/api/interests').send({ interests: ['Science'] }).expect(200);
    assert.deepEqual((await reader.get('/api/users/me')).body.user.interests, ['Science']);
    await reader.put('/api/users/interests').send({ interests: ['Invalid'] }).expect(400);
    const missing = await request(app).get('/api/not-a-route').expect(404);
    assert.equal(missing.body.error, 'Endpoint not found.');
  });

  await t.test('validation and parser errors return safe JSON responses', async () => {
    for (const path of ['/api/news?topic=Unknown', '/api/news?category=Unknown', '/api/news?q=one&q=two', '/api/bookmarks?category=Unknown']) {
      const result = await reader.get(path).expect(400);
      assert.equal(typeof result.body.error, 'string');
    }
    await reader.post('/api/auth/login').send({ email: { $ne: null }, password: account.password }).expect(400);
    await reader.post('/api/auth/register').send([]).expect(400);
    const malformed = await reader.post('/api/auth/login').set('Content-Type', 'application/json').send('{').expect(400);
    assert.equal(malformed.body.error, 'Invalid JSON.');
    await reader.put('/api/interests').send({ interests: 'Science' }).expect(400);
    await reader.put('/api/interests').set('Content-Type', 'text/plain').send('Science').expect(415);
    await reader.put('/api/interests').send({ interests: ['Science', 'Science'], name: 'Overwritten' }).expect(200);
    const me = await reader.get('/api/auth/me').expect(200);
    assert.deepEqual(me.body.user.interests, ['Science']);
    assert.equal(me.body.user.name, 'Reader');
    assert.equal(me.body.user.password, undefined);
    await request(app).get('/api/auth/me').set('Cookie', 'nuzio_session=invalid').expect(401);
    const missing = await reader.get('/api/not-a-route').expect(404);
    assert.equal(missing.body.error, 'Endpoint not found.');
  });

  await t.test('repositories preserve seed idempotence, category filters and audio fields', async () => {
    const first = await insertMissingArticles(demoStories);
    assert.equal(first.upsertedCount, demoStories.length);
    const repeated = await insertMissingArticles(demoStories.map(story => ({ ...story, title: 'Should not overwrite' })));
    assert.equal(repeated.upsertedCount, 0);
    const markets = await reader.get('/api/news?category=Markets').expect(200);
    const startups = await reader.get('/api/news?category=Startups').expect(200);
    assert.equal(markets.body.articles.length, 2);
    assert.equal(startups.body.articles.length, 2);
    assert.ok(markets.body.articles.every(article => article.category === 'Markets' && article.audioUrl.endsWith('.mp3')));
    assert.ok(startups.body.articles.every(article => article.category === 'Startups' && article.title !== 'Should not overwrite'));
    assert.equal(markets.body.articles[0].content, undefined);
    const detail = await reader.get(`/api/news/${science._id}`).expect(200);
    assert.equal(detail.body.article.audioUrl, '/audio/demo-science-1.mp3');
    assert.equal(detail.body.article.content, 'Full article');
  });

  await t.test('bookmark deletes remain scoped to the signed-in account', async () => {
    await reader.put(`/api/bookmarks/${science._id}`).send({}).expect(200);
    await other.delete(`/api/bookmarks/${science._id}`).expect(200);
    assert.equal((await reader.get('/api/bookmarks')).body.articles.length, 1);
    assert.equal((await other.get('/api/bookmarks')).body.articles.length, 0);
    await reader.delete(`/api/bookmarks/${science._id}`).expect(200);
    await reader.delete(`/api/bookmarks/${science._id}`).expect(200);
  });

  await t.test('registration and login share the rate limiter', async () => {
    const isolated = createApp();
    for (let attempt = 0; attempt < 20; attempt++) {
      await request(isolated).post(attempt % 2 ? '/api/auth/login' : '/api/auth/register').send({}).expect(400);
    }
    const limited = await request(isolated).post('/api/auth/login').send(account).expect(429);
    assert.match(limited.body.error, /Too many attempts/);
  });

  await Session.updateMany({}, { expiresAt: new Date(0) });
  await reader.get('/api/auth/me').expect(401);
});
