import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = new URL('../../', import.meta.url);

test('index.html is the only root file; source and tools live in folders', async () => {
  const entries = await readdir(root, { withFileTypes: true });
  assert.deepEqual(entries.filter(entry => entry.isFile()).map(entry => entry.name), ['index.html']);
  assert.equal(entries.some(entry => entry.name === 'dist'), false);
  for (const path of ['index.html','css/styles.css','js/app.js','assets/images/hero.svg','tools/serve.mjs']) await access(new URL(path, root));
});
test('all local HTML links and module imports resolve under a GitHub project path', async () => {
  const html = await readFile(new URL('index.html', root), 'utf8');
  const references = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map(match => match[1]).filter(value => !value.startsWith('#') && !value.startsWith('https:'));
  const base = 'https://example.github.io/portfolio-demo/';
  for (const reference of references) {
    const resolved = new URL(reference, base);
    assert.ok(resolved.pathname.startsWith('/portfolio-demo/'), reference);
    await access(new URL(reference, root));
  }
  const queue = [new URL('js/app.js',root)];
  const checked = new Set();
  while (queue.length) {
    const current = queue.shift();
    if (checked.has(current.href)) continue;
    checked.add(current.href);
    const script = await readFile(current, 'utf8');
    for (const [, specifier] of script.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
      assert.ok(specifier.startsWith('./') || specifier.startsWith('../'));
      const dependency = new URL(specifier, current);
      assert.ok(fileURLToPath(dependency).startsWith(fileURLToPath(root)));
      await access(dependency); queue.push(dependency);
    }
  }
  assert.ok(checked.size >= 4);
});
