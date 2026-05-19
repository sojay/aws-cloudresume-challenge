import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const root = process.cwd();
const siteRoot = existsSync(join(root, 'build', 'index.html')) ? join(root, 'build') : root;
const pages = ['index.html', 'feedback.html'].filter((page) => existsSync(join(siteRoot, page)));
const requiredSourceFiles = [
  'src/app.html',
  'src/routes/+page.svelte',
  'src/routes/+layout.svelte',
  'src/app.css',
  'static/assets/Samuel_Okorie.pdf',
  'static/assets/img/profile.jpg',
];
const localRefPattern = /(?:href|src)="([^"]+)"/g;
const idPattern = /id="([^"]+)"/g;
const requiredMarkers = [
  'data-site-header',
  'data-nav-toggle',
  'data-nav-panel',
  'data-counter',
  'visitorStorageKey',
  'mailto:thesamokorie@gmail.com',
  'https://linkedin.com/in/sokorie/',
];

const failures = [];
for (const file of requiredSourceFiles) {
  if (!existsSync(join(root, file))) failures.push(`missing source file ${file}`);
}

const pageSource = existsSync(join(root, 'src/routes/+page.svelte'))
  ? readFileSync(join(root, 'src/routes/+page.svelte'), 'utf8')
  : '';
for (const marker of requiredMarkers) {
  if (!pageSource.includes(marker)) failures.push(`+page.svelte missing required marker ${marker}`);
}

const idsByPage = new Map();
for (const page of pages) {
  const html = readFileSync(join(siteRoot, page), 'utf8');
  idsByPage.set(page, new Set([...html.matchAll(idPattern)].map((match) => match[1])));
}

for (const page of pages) {
  const html = readFileSync(join(siteRoot, page), 'utf8');
  for (const match of html.matchAll(localRefPattern)) {
    const rawRef = match[1];
    if (/^(https?:|mailto:|tel:)/.test(rawRef)) continue;

    const [pathPart, fragment] = rawRef.split('#');
    const targetPage = pathPart || page;
    const targetPath = resolve(siteRoot, dirname(page), targetPage.replace(/^\//, ''));

    if (pathPart && !existsSync(targetPath)) {
      failures.push(`${page} references missing file ${rawRef}`);
      continue;
    }

    if (fragment) {
      const normalizedTarget = pathPart ? targetPath.slice(siteRoot.length + 1) || page : page;
      const ids = idsByPage.get(normalizedTarget);
      if (ids && !ids.has(fragment)) {
        failures.push(`${page} references missing anchor #${fragment} in ${normalizedTarget}`);
      }
    }
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`PASS SvelteKit site smoke checks${pages.length ? ` for ${pages.join(', ')}` : ''}`);
