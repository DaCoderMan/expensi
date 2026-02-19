#!/usr/bin/env node
/**
 * Fullstack test: lint → unit tests → build → start production server → e2e → stop server.
 * Requires .env.local (and for PayPal e2e, NEXT_PUBLIC_PAYPAL_PAYMENT_URL pointing to sandbox).
 * Run: npm run test:all
 */

import { spawn, execSync } from 'child_process';
import http from 'http';

const baseURL = 'http://localhost:3000';
const waitMs = 300;
const maxWait = 60000;

function run(cmd, args = [], opts = {}) {
  const c = spawn(cmd, args, { stdio: 'inherit', shell: true, ...opts });
  return new Promise((resolve, reject) => {
    c.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`Exit ${code}`))));
  });
}

function get(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      res.resume();
      resolve(res.statusCode);
    });
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

function waitForServer() {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = () => {
      get(baseURL)
        .then((code) => (code >= 200 && code < 500 ? resolve() : attempt()))
        .catch(() => {
          if (Date.now() - start > maxWait) reject(new Error('Server did not become ready'));
          else setTimeout(attempt, waitMs);
        });
    };
    attempt();
  });
}

async function main() {
  let server;
  try {
    console.log('Lint…');
    execSync('npm run lint', { stdio: 'inherit' });
    console.log('Unit tests…');
    await run('npm', ['run', 'test:ci']);
    console.log('Build…');
    await run('npm', ['run', 'build']);
    console.log('Starting production server…');
    server = spawn('npm', ['run', 'start'], {
      stdio: 'pipe',
      shell: true,
      env: { ...process.env, FORCE_COLOR: '1' },
    });
    server.stdout?.pipe(process.stdout);
    server.stderr?.pipe(process.stderr);
    await waitForServer();
    console.log('E2E (production)…');
    await run('npx', ['playwright', 'test', '--project=chromium'], {
      env: { ...process.env, E2E_USE_EXISTING_SERVER: '1', PLAYWRIGHT_BASE_URL: baseURL },
    });
  } catch (e) {
    console.error(e.message || e);
    process.exit(1);
  } finally {
    if (server?.pid) {
      process.kill(server.pid, 'SIGTERM');
    }
  }
}

main();
