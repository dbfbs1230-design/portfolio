import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { projects } from '../../js/data/projects.js';
import { categories, copy, profile } from '../../js/data/site.js';
import { filterProjects, readState, stateURL, validateProjects, text } from '../../js/lib/model.js';
const ids = categories.map(category => category.id);

test('all data is valid and category filtering preserves order', () => {
  assert.equal(validateProjects(projects, ids), true);
  assert.equal(filterProjects(projects, 'all').length, 12);
  for (const id of ids.filter(id => id !== 'all')) {
    const filtered = filterProjects(projects, id);
    assert.equal(filtered.length, 4);
    assert.ok(filtered.every(item => item.category === id));
    assert.deepEqual(filtered, projects.filter(item => item.category === id));
  }
  assert.equal(filterProjects(projects, 'missing').length, 0);
});
test('invalid URL state recovers safely and project deep links stay visible', () => {
  assert.deepEqual(readState('?lang=xx&category=no&project=missing', projects, ids, 'ko'), { language:'ko', category:'all', projectId:null });
  assert.deepEqual(readState('?lang=en&category=digital&project=unsettled-silhouette', projects, ids), { language:'en', category:'fashion', projectId:'unsettled-silhouette' });
});
test('duplicate identifiers and incomplete translations fail early', () => {
  assert.throws(() => validateProjects([...projects, projects[0]], ids), /duplicate/);
  const incomplete = structuredClone(projects[0]); delete incomplete.title.ko;
  assert.throws(() => validateProjects([incomplete], ids), /Missing title.ko/);
  assert.equal(text({ en:'Fallback' }, 'ko'), 'Fallback');
});
test('interface copy and profile content are available in both languages', async () => {
  assert.deepEqual(Object.keys(copy.en).sort(), Object.keys(copy.ko).sort());
  const html = await readFile(new URL('../../index.html', import.meta.url), 'utf8');
  for (const [, key] of html.matchAll(/data-(?:alt-)?i18n="([^"]+)"/g)) {
    assert.ok(copy.en[key], `Missing English key ${key}`);
    assert.ok(copy.ko[key], `Missing Korean key ${key}`);
  }
  for (const block of profile) for (const item of [block.title,...block.items]) assert.ok(item.en && item.ko);
});
test('every project has real local images and unique accessible descriptions', async () => {
  const paths = new Set();
  for (const project of projects) {
    assert.equal(project.demo, true);
    assert.equal(project.year, null);
    for (const image of project.images) {
      assert.ok(!paths.has(image.src)); paths.add(image.src);
      await access(new URL(`../../${image.src}`, import.meta.url));
      assert.ok(image.alt.en && image.alt.ko);
    }
  }
  assert.equal(paths.size, 24);
});

test('new project links use current category and preserve unrelated URL context', () => {
  const url = stateURL('https://example.com/?category=digital&project=old&ref=portfolio#work', { language: 'ko', category: 'all', projectId: 'off-balance' });
  assert.equal(url.searchParams.has('category'), false);
  assert.equal(url.searchParams.get('project'), 'off-balance');
  assert.equal(url.searchParams.get('lang'), 'ko');
  assert.equal(url.searchParams.get('ref'), 'portfolio');
  assert.equal(url.hash, '#work');
});
