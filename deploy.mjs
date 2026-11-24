// Builds the site and force-pushes dist/ to the main branch of the GitHub Pages user-site repo,
// which GitHub serves at https://adecodes-dot.github.io. Source code lives on the `source` branch.
import { execFileSync } from 'node:child_process';
import { writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from './build.mjs';

const REPO = 'https://github.com/Adecodes-dot/Adecodes-dot.github.io.git';
const AUTHOR = ['-c', 'user.name=Ademola', '-c', 'user.email=173625792+Adecodes-dot@users.noreply.github.com'];
const dist = join(dirname(fileURLToPath(import.meta.url)), 'dist');

const { pages, placeholders } = await build();
if (placeholders.length) {
  console.error(`Not deploying: placeholders left in site.json:\n  ${placeholders.join('\n  ')}`);
  process.exit(1);
}

const git = (...args) => execFileSync('git', args, { cwd: dist, stdio: 'inherit' });
writeFileSync(join(dist, '.nojekyll'), ''); // serve files as-is, no Jekyll processing
rmSync(join(dist, '.git'), { recursive: true, force: true });
git('init', '-q', '-b', 'main');
git('add', '-A');
git(...AUTHOR, 'commit', '-q', '-m', `Deploy ${pages.length} pages`);
git('push', '-f', REPO, 'main');
console.log('Deployed. Live at https://adecodes-dot.github.io in about a minute.');
