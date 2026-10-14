import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
const workflow = JSON.parse(readFileSync(new URL('../workflows/crypto-market-snapshot.json', import.meta.url), 'utf8'));

new vm.Script(app, { filename: 'app.js' });
assert.ok(html.includes('src="./app.js"'), 'Dashboard must load its external JavaScript');
assert.ok(html.includes('href="./styles.css"'), 'Dashboard must load its external stylesheet');

const declaredIds = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
const referencedIds = new Set([...app.matchAll(/\$\('([^']+)'\)/g)].map(m => m[1]));
const missingIds = [...referencedIds].filter(id => !declaredIds.has(id));
assert.deepEqual(missingIds, [], `Dashboard references missing HTML ids: ${missingIds.join(', ')}`);

const requiredPairs = ['BTCUSDT','ETHUSDT','SOLUSDT','BNBUSDT','XRPUSDT'];
const missingPairs = requiredPairs.filter(pair => !app.includes(pair));
assert.deepEqual(missingPairs, [], 'Expected major market pairs must be included');

assert.ok(Array.isArray(workflow.nodes) && workflow.nodes.length >= 3, 'n8n workflow must contain its processing nodes');
const nodeNames = new Set(workflow.nodes.map(node => node.name));
for (const node of workflow.nodes) {
  const outputs = workflow.connections?.[node.name]?.main ?? [];
  for (const output of outputs) {
    for (const edge of output) assert.ok(nodeNames.has(edge.node), `Connection points to missing node: ${edge.node}`);
  }
}
assert.ok(nodeNames.has('Fetch Market Data'), 'n8n workflow must fetch API data');
assert.ok(nodeNames.has('Normalize & Validate'), 'n8n workflow must validate and normalize data');
assert.ok(nodeNames.has('Schedule Every 15 Minutes'), 'n8n workflow must include the scheduled trigger');
assert.ok(workflow.connections['Schedule Every 15 Minutes']?.main?.[0]?.some(edge => edge.node === 'Fetch Market Data'), 'Scheduled trigger must connect to the market-data request');

assert.ok(html.includes('Content-Security-Policy'), 'Dashboard must define a browser-side Content Security Policy');
assert.ok(html.includes("script-src 'self'") && html.includes("style-src 'self'"), 'CSP must disallow inline scripts and styles');
assert.ok(html.includes('Permissions-Policy'), 'Dashboard must restrict unused browser permissions');
assert.ok(!html.includes('<style>') && !html.includes('<script>'), 'No inline CSS or JavaScript should remain');
assert.ok(!/\son[a-z]+=/i.test(html), 'No inline event handlers should remain');
assert.ok(css.includes('.image-failed'), 'Stylesheet should handle failed external coin icons');
assert.ok(app.includes('marketRequest') && app.includes('chartRequest'), 'Dashboard should prevent stale overlapping requests');

console.log('Validation passed: external JS syntax, DOM IDs, market pairs, strict CSP, and n8n workflow structure/connections.');
