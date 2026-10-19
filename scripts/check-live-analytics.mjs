// Use the runner's existing Chrome and Node runtimes to verify a real beacon.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const url = process.env.PAGE_URL;
assert.ok(url, 'PAGE_URL is required');
const profile = await mkdtemp(join(tmpdir(), 'portfolio-analytics-'));
const chrome = spawn(process.env.CHROME_BIN || 'google-chrome', [
  '--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--no-first-run',
  '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'
]);
let socket;
let timer;
try {
  const endpoint = await new Promise((resolve, reject) => {
    let stderr = '';
    timer = setTimeout(() => reject(new Error('Chrome did not start')), 15000);
    chrome.on('error', reject);
    chrome.stderr.on('data', data => {
      stderr += data;
      const match = stderr.match(/DevTools listening on (ws:\/\/\S+)/);
      if (match) { clearTimeout(timer); resolve(match[1]); }
    });
    chrome.once('exit', code => reject(new Error(`Chrome exited with ${code}`)));
  });
  socket = new WebSocket(endpoint);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once:true });
    socket.addEventListener('error', reject, { once:true });
  });
  let nextId = 0;
  const pending = new Map();
  const methods = new Map();
  const traffic = [];
  const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
  });
  socket.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data);
    if (message.id) {
      const request = pending.get(message.id);
      if (!request) return;
      pending.delete(message.id);
      if (message.error) request.reject(new Error(message.error.message));
      else request.resolve(message.result);
    }
    if (message.method === 'Network.requestWillBeSent') {
      methods.set(message.params.requestId, message.params.request.method);
    }
    if (message.method === 'Network.responseReceived') {
      const { requestId, response } = message.params;
      if (new URL(response.url).hostname.endsWith('cloudflareinsights.com')) {
        traffic.push({ url:response.url, status:response.status, method:methods.get(requestId) });
      }
    }
  });
  const { targetId } = await send('Target.createTarget', { url:'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten:true });
  await send('Network.enable', {}, sessionId);
  await send('Page.enable', {}, sessionId);
  await send('Page.navigate', { url }, sessionId);
  const started = Date.now();
  while (Date.now() - started < 25000) {
    if (traffic.some(r => r.method === 'POST' && r.status >= 200 && r.status < 300)) break;
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (Date.now() - started > 10000 && Date.now() - started < 11500) {
      await send('Page.navigate', { url:'about:blank' }, sessionId);
    }
  }
  console.log(JSON.stringify({ url, traffic }, null, 2));
  assert.ok(traffic.some(r => r.url.includes('beacon.min.js') && r.status === 200), 'Cloudflare script did not load');
  assert.ok(traffic.some(r => r.method === 'POST' && r.status >= 200 && r.status < 300), 'Cloudflare did not accept the test beacon');
} finally {
  clearTimeout(timer);
  socket?.close();
  const stopped = new Promise(resolve => chrome.once('exit', resolve));
  chrome.kill('SIGKILL');
  await stopped;
  // Chrome subprocesses can finish writing after the main process exits.
  await rm(profile, { recursive:true, force:true, maxRetries:8, retryDelay:200 });
}
