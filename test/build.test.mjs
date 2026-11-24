import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, mkdtempSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { build } from '../build.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const site = JSON.parse(readFileSync(join(root, 'site.json'), 'utf8'));
const tmp = () => mkdtempSync(join(tmpdir(), 'herald-'));

test('build writes index and one page per project', async () => {
  const out = tmp();
  await build({ root, out });
  assert.ok(existsSync(join(out, 'index.html')));
  assert.ok(site.projects.length > 0);
  assert.equal(new Set(site.projects.map((p) => p.slug)).size, site.projects.length);
  for (const p of site.projects) assert.ok(existsSync(join(out, 'work', p.slug, 'index.html')), p.slug);
});

test('escapes text', async () => {
  const out = tmp();
  const s = structuredClone(site);
  s.projects[0].name = 'A & <b>';
  await build({ root, out, site: s });
  const html = readFileSync(join(out, 'work', s.projects[0].slug, 'index.html'), 'utf8');
  assert.ok(html.includes('A &amp; &lt;b&gt;'));
  assert.ok(!html.includes('A & <b>'));
});

test('omits missing live link', async () => {
  const out = tmp();
  const s = structuredClone(site);
  delete s.projects[1].live;
  await build({ root, out, site: s });
  const html = readFileSync(join(out, 'work', s.projects[1].slug, 'index.html'), 'utf8');
  assert.ok(!/class="ext"[^>]*>Live/.test(html));
});

test('reports placeholders', async () => {
  const out = tmp();
  const s = structuredClone(site);
  s.person.email = '[YOU@DOMAIN.COM]';
  const { placeholders } = await build({ root, out, site: s });
  assert.ok(placeholders.includes('person.email'));
});

test('internal links resolve', async () => {
  const out = tmp();
  const { pages } = await build({ root, out });
  for (const page of pages) {
    const html = readFileSync(join(out, page), 'utf8');
    const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
    for (const [, href] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (/^(https?:|mailto:|data:)/.test(href) || href.startsWith('https://fonts')) continue;
      const [path, hash] = href.split('#');
      if (!path) { assert.ok(ids.has(hash), `${page}: #${hash}`); continue; }
      let target = join(out, dirname(page), path);
      if (path.endsWith('/')) target = join(target, 'index.html');
      assert.ok(existsSync(target), `${page}: ${href}`);
      if (hash) {
        const other = readFileSync(target, 'utf8');
        assert.ok(other.includes(`id="${hash}"`), `${page}: ${href}`);
      }
    }
  }
});
