import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const workflow = JSON.parse(readFileSync(new URL('../workflows/crypto-market-snapshot.json', import.meta.url), 'utf8'));

const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/gi)];
assert.ok(scripts.length, 'Dashboard JavaScript block must exist');
for (const [index, match] of scripts.entries()) {
  new vm.Script(match[1], { filename: `index.html inline script ${index + 1}` });
}

const declaredIds = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
const referencedIds = new Set([...html.matchAll(/\$\('([^']+)'\)/g)].map(m => m[1]));
const missingIds = [...referencedIds].filter(id => !declaredIds.has(id));
assert.deepEqual(missingIds, [], `Dashboard references missing HTML ids: ${missingIds.join(', ')}`);

const requiredPairs = ['BTCUSDT','ETHUSDT','SOLUSDT','BNBUSDT','XRPUSDT'];
const missingPairs = requiredPairs.filter(pair => !html.includes(pair));
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
console.log('Validation passed: dashboard JavaScript syntax, referenced DOM IDs, market pairs, and n8n workflow JSON/connections.');
