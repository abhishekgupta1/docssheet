#!/usr/bin/env node
/**
 * Pull content + shared Learn code from the parent portfolio repo into docssheet.
 *
 *   node scripts/sync-from-parent.mjs [--parent <path>] [--dry-run]
 *
 * Synced (overwritten from parent):
 *   - every existing docs/**  and cheatsheets/** file, except the two intro.md
 *     landing pages (hand-maintained here) — plus the EXTRA_SHEETS below
 *   - per-page social images referenced by `image:` front matter
 *   - shared components, Learn pages, data, utils and the docs-index plugin
 *
 * NOT synced (docssheet-specific, merge by hand): docusaurus.config.js,
 * sidebars*.js, src/data/site.js, src/theme/*, src/css/custom.css,
 * the legal/info pages, ConsentBanner, AdSlot, docs/cheatsheets intro.md.
 *
 * After copying it prunes the Learn data to the sheets that exist here and
 * de-links internal links to pages that were not imported (the build has
 * onBrokenLinks: 'throw'). Never brings MBA/leadership or claude-masterclass.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const DRY = args.includes('--dry-run');
const pIdx = args.indexOf('--parent');
const PARENT = path.resolve(
  pIdx >= 0 ? args[pIdx + 1] : path.join(ROOT, '..', 'abhishekgupta1.github.io'),
);

// Cheat sheets that exist in the parent but not yet here and are in scope
// (standalone or linking only to imported guides). Add names here to import more.
const EXTRA_SHEETS = ['test-automation-tooling-landscape'];
// Not imported on purpose: MBA/leadership sheets, claude-masterclass (derived
// from a third-party Udemy course), and playwright-cross-browser-testing /
// sre-observability-slos (their "full guide" is a blog article that isn't here).

const COMPONENTS = [
  'AISpark', 'CaseStudy', 'Exercises', 'KeyTakeaways', 'LevelBadge', 'TenMinute',
  'TechIcon', 'MindMap', 'MindMapButton', 'ProgressTracker',
];
const PAGES = [
  'roadmap.js', 'roadmap.module.css', 'skills.js', 'skills.module.css',
  'library.js', 'library.module.css', 'dashboard.js', 'start.js',
];
const DATA = ['skills.js', 'topics.js'];

const log = (...a) => console.log(...a);
let copied = 0;

function copy(from, to) {
  if (!fs.existsSync(from)) return false;
  const a = fs.readFileSync(from);
  if (fs.existsSync(to) && a.equals(fs.readFileSync(to))) return false;
  copied++;
  if (!DRY) {
    fs.mkdirSync(path.dirname(to), {recursive: true});
    fs.writeFileSync(to, a);
  }
  return true;
}

function copyDir(from, to) {
  for (const e of fs.readdirSync(from, {withFileTypes: true})) {
    if (e.name === '.DS_Store') continue;
    const f = path.join(from, e.name);
    const t = path.join(to, e.name);
    if (e.isDirectory()) copyDir(f, t);
    else copy(f, t);
  }
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, {withFileTypes: true})) {
    if (e.name === '.DS_Store') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

if (!fs.existsSync(PARENT)) {
  console.error(`Parent repo not found: ${PARENT}`);
  process.exit(1);
}

// 1. content ---------------------------------------------------------------
const contentFiles = [];
for (const area of ['docs', 'cheatsheets']) {
  for (const f of walk(path.join(ROOT, area))) {
    const rel = path.relative(ROOT, f);
    if (rel === `${area}/intro.md`) continue;
    contentFiles.push(rel);
  }
}
for (const s of EXTRA_SHEETS) contentFiles.push(`cheatsheets/${s}.md`);
for (const rel of contentFiles) copy(path.join(PARENT, rel), path.join(ROOT, rel));
log(`content: ${contentFiles.length} files checked`);

// 2. social images referenced by front matter -------------------------------
let images = 0;
for (const rel of contentFiles) {
  const f = path.join(ROOT, rel);
  if (!fs.existsSync(f) && !DRY) continue;
  const src = fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : fs.readFileSync(path.join(PARENT, rel), 'utf8');
  const m = src.match(/^image:\s*(\/img\/\S+)\s*$/m);
  if (m && copy(path.join(PARENT, 'static', m[1]), path.join(ROOT, 'static', m[1]))) images++;
}
log(`images: ${images} copied`);

// 3. shared code ------------------------------------------------------------
for (const c of COMPONENTS) copyDir(path.join(PARENT, 'src/components', c), path.join(ROOT, 'src/components', c));
for (const p of PAGES) copy(path.join(PARENT, 'src/pages', p), path.join(ROOT, 'src/pages', p));
for (const d of DATA) copy(path.join(PARENT, 'src/data', d), path.join(ROOT, 'src/data', d));
copyDir(path.join(PARENT, 'src/utils'), path.join(ROOT, 'src/utils'));
copyDir(path.join(PARENT, 'plugins/docs-index'), path.join(ROOT, 'plugins/docs-index'));
log('code: components, pages, data, utils, plugins checked');

// 4. prune Learn data to what exists here ------------------------------------
if (!DRY) {
  const sheets = new Set(
    fs.readdirSync(path.join(ROOT, 'cheatsheets')).filter((n) => n.endsWith('.md')).map((n) => n.slice(0, -3)),
  );
  const topicsPath = path.join(ROOT, 'src/data/topics.js');
  let t = fs.readFileSync(topicsPath, 'utf8');
  t = t
    .split('\n')
    .filter((line) => {
      const id = line.match(/^\s*\{id: '([^']+)'/);
      if (id) return sheets.has(id[1]) && !/category: 'mba'/.test(line);
      return true;
    })
    .join('\n')
    // drop the MBA category block and its section comment
    .replace(/\s*\{\s*key: 'mba',[\s\S]*?\n {2}\},/, '')
    .replace(/\n\s*\/\/ MBA Skills\n/, '\n');
  fs.writeFileSync(topicsPath, t);

  const skillsPath = path.join(ROOT, 'src/data/skills.js');
  const sk = fs.readFileSync(skillsPath, 'utf8').replace(/\n {2}mba: \{[\s\S]*?\n {2}\},/, '');
  fs.writeFileSync(skillsPath, sk);
}

// 5. de-link references to pages that aren't here ---------------------------
function docExists(url) {
  const clean = url.split('#')[0].replace(/\/$/, '');
  const m = clean.match(/^\/(docs|cheatsheets)(\/.*)?$/);
  if (!m) return true;
  const base = path.join(ROOT, m[1]);
  const rest = m[2] || '';
  if (rest === '' || rest === '/intro') return true;
  if (/^\/category\//.test(rest)) return true;
  const p = base + rest;
  return ['.md', '.mdx', '/index.md'].some((s) => fs.existsSync(p + s)) || fs.existsSync(p);
}

let delinked = 0;
if (!DRY) {
  for (const rel of [...contentFiles, 'docs/intro.md', 'cheatsheets/intro.md']) {
    const f = path.join(ROOT, rel);
    if (!fs.existsSync(f)) continue;
    const before = fs.readFileSync(f, 'utf8');
    const after = before
      // blog isn't imported: drop whole lines that only exist to point at it
      .split('\n')
      .filter((l) => !(/\/articles\//.test(l) && (/^<a class="topic-crosslink"/.test(l) || /^Also on the blog:/.test(l))))
      .join('\n')
      .replace(/\[([^\]]+)\]\((\/(?:docs|cheatsheets)\/[^)\s]*)\)/g, (all, text, url) => {
        if (docExists(url)) return all;
        delinked++;
        return text;
      })
      // relative links to sibling/child .md files (e.g. the tooling-landscape sub-pages)
      .replace(/\[([^\]]+)\]\((\.{1,2}\/[^)\s#]*\.mdx?)(#[^)\s]*)?\)/g, (all, text, rel2) => {
        if (fs.existsSync(path.resolve(path.dirname(f), rel2))) return all;
        delinked++;
        return text;
      });
    if (after !== before) fs.writeFileSync(f, after);
  }
}
log(`de-linked: ${delinked} links to non-imported pages`);
log(`${DRY ? '[dry-run] ' : ''}${copied} files ${DRY ? 'would change' : 'changed'}`);
