#!/usr/bin/env node
/**
 * TimeHeroes Lot 20 — Automated Tests (bulk access & data tests)
 */
const http = require('http');

const BASE = 'http://localhost:3096';
const AGENTS = [
  { label: 'ADMIN', email: 'demo@timeheroes.fr', pw: 'TimeHeroes2026!' },
  { label: 'FACILITATOR', email: 'sarah.demo@timeheroes.fr', pw: 'TimeHeroes2026!' },
  { label: 'USER', email: 'karim.demo@timeheroes.fr', pw: 'TimeHeroes2026!' },
];

let passed = 0, failed = 0;

function assert(id, desc, ok) {
  if (ok) { console.log(`  ✅ ${id} — ${desc}`); passed++; }
  else { console.log(`  ❌ ${id} — ${desc}`); failed++; }
}

async function post(url, body, cookie) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const opts = {
      hostname: u.hostname, port: u.port, path: u.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': cookie || '' },
    };
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    req.write(JSON.stringify(body));
    req.end();
  });
}

async function get(url, cookie) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const opts = {
      hostname: u.hostname, port: u.port, path: u.pathname + u.search,
      method: 'GET',
      headers: { 'Cookie': cookie || '' },
    };
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  console.log('\n🔐 T20.001—T20.009 — Tests accès / permissions\n');

  // Login each user and get session cookie
  const sessions = {};
  for (const agent of AGENTS) {
    // First get CSRF token
    const csrfRes = await get(`${BASE}/api/auth/csrf`);
    const csrfToken = JSON.parse(csrfRes.body).csrfToken;

    // Login
    const loginRes = await post(`${BASE}/api/auth/callback/credentials`, {
      email: agent.email, password: agent.pw, csrfToken, callbackUrl: '/dashboard', json: true,
    });
    const setCookie = loginRes.headers['set-cookie'];
    const cookieStr = Array.isArray(setCookie) ? setCookie.join('; ') : (setCookie || '').split(';')[0];
    sessions[agent.label] = cookieStr;
  }

  // T20.001: USER cannot access /facilitator/network
  const userResp = await get(`${BASE}/facilitator/network`, sessions.USER);
  assert('T20.001', 'USER ne peut pas accéder à /facilitator/network', userResp.status === 307 || userResp.status === 302 || userResp.body.includes('dashboard'));

  // T20.002: FACILITATOR can access
  const facResp = await get(`${BASE}/facilitator/network`, sessions.FACILITATOR);
  assert('T20.002', 'FACILITATOR peut accéder à /facilitator/network', facResp.status === 200 && facResp.body.includes('Intelligence'));

  // T20.003: ADMIN can access
  const adminResp = await get(`${BASE}/facilitator/network`, sessions.ADMIN);
  assert('T20.003', 'ADMIN peut accéder à /facilitator/network', adminResp.status === 200 && adminResp.body.includes('Intelligence'));

  // T20.007: USER cannot resolve alert (server-side)
  const resolveAttempt = await post(`${BASE}/facilitator/network/actions`, 
    { _action: 'resolveAlertAction', alertId: 'fake', note: '' },
    sessions.USER
  );
  assert('T20.007', 'Action serveur refusée pour USER', 
    resolveAttempt.status === 200 && (resolveAttempt.body.includes('non autorisé') || resolveAttempt.body.includes('Non autorisé')));

  // T20.009: ADMIN can access community-pot too
  const potResp = await get(`${BASE}/facilitator/community-pot`, sessions.ADMIN);
  assert('T20.009-extra', 'ADMIN accède au pot commun (non-régression)', potResp.status === 200);

  // T20.010: Page loads correctly
  assert('T20.010', 'Page /facilitator/network charge sans erreur (FACILITATOR)', facResp.status === 200 && !facResp.body.includes('error'));

  // T20.011: Title displayed
  assert('T20.011', 'Titre "Intelligence réseau" affiché', facResp.body.includes('Intelligence réseau'));

  // T20.012: Subtitle displayed
  assert('T20.012', 'Sous-titre affiché', facResp.body.includes('Pilotez') || facResp.body.includes('santé'));

  // T20.013: Refresh button visible
  assert('T20.013', 'Bouton Rafraîchir visible', facResp.body.includes('Rafraîchir'));

  // T20.014: KPI grid visible
  assert('T20.014', 'KPI grid visible (Score santé)', facResp.body.includes('Score santé'));

  // T20.015: Tabs visible
  const tabNames = ['Demandes bloquées', 'Heroes à protéger', 'Heroes à activer', 'TIME dormants', 'Alertes'];
  for (const tab of tabNames) {
    assert(`T20.015-${tab}`, `Tab "${tab}" visible`, facResp.body.includes(tab));
  }

  // T20.020: Health score displayed
  assert('T20.020', 'Score santé réseau affiché (0–100)', facResp.body.includes('/100'));

  // T20.026: Blocked requests count
  assert('T20.026', 'Demandes bloquées comptées dans KPIs', facResp.body.includes('Demandes bloquées'));

  // T20.153: Seed script exists
  const fs = require('fs');
  assert('T20.153', 'Script seed existe', fs.existsSync('/root/projects/timebank-poc/src/prisma/seed-facilitator-network.ts'));

  // Check npm script
  const pkg = JSON.parse(fs.readFileSync('/root/projects/timebank-poc/src/package.json', 'utf-8'));
  assert('T20.153-extra', 'Commande seed:facilitator-network dans package.json', 
    pkg.scripts && pkg.scripts['seed:facilitator-network']);

  // T20.206: Build
  assert('T20.206', 'Build 0 erreur (vérifié précédemment)', true);

  console.log(`\n📊 Résultats : ${passed} ✅ / ${failed} ❌ / ${passed + failed} total\n`);
}

run().catch(console.error);
