// Renders site.json into static pages in dist/. Node stdlib only.
import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as render from './src/templates.mjs';

const here = dirname(fileURLToPath(import.meta.url));

// Any "[SOMETHING]" left in site.json is a fact still to be filled in.
function findPlaceholders(value, path = '') {
  if (typeof value === 'string') return /\[[A-Z][^\]]*\]/.test(value) ? [path] : [];
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([k, v]) => findPlaceholders(v, path ? `${path}.${k}` : k));
  }
  return [];
}

function write(out, page, html) {
  mkdirSync(dirname(join(out, page)), { recursive: true });
  writeFileSync(join(out, page), html);
}

export async function build({ root = here, out = join(root, 'dist'), site } = {}) {
  site ??= JSON.parse(readFileSync(join(root, 'site.json'), 'utf8'));
  const placeholders = findPlaceholders(site);
  if (!site.person.resume || !existsSync(join(root, site.person.resume))) {
    placeholders.push('person.resume (file missing, button points to #contact)');
    site = { ...site, person: { ...site.person, resume: null } };
  }

  rmSync(out, { recursive: true, force: true });
  const pages = ['index.html'];
  write(out, 'index.html', render.home(site));
  site.projects.forEach((p, i) => {
    const page = `work/${p.slug}/index.html`;
    write(out, page, render.caseStudy(site, p, i));
    pages.push(page);
  });

  cpSync(join(here, 'src', 'styles.css'), join(out, 'assets', 'styles.css'));
  cpSync(join(here, 'src', 'main.js'), join(out, 'assets', 'main.js'));
  if (existsSync(join(root, 'assets'))) cpSync(join(root, 'assets'), join(out, 'assets'), { recursive: true });
  return { pages, placeholders };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { pages, placeholders } = await build();
  console.log(`Built ${pages.length} pages into dist/`);
  for (const p of placeholders) console.warn(`  placeholder: ${p}`);
}
