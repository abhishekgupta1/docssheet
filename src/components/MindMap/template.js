// Muted, non-neon accent palette cycled one color per branch.
const PALETTE = [
  '#b0554a', // terracotta
  '#3f7a63', // pine
  '#4a6fa5', // slate blue
  '#a8763e', // ochre
  '#7a5c8e', // plum
  '#5c8a72', // sage
  '#3a7d8c', // teal
  '#8a6b3f', // bronze
  '#5f5c8e', // indigo
  '#8c5a5a', // brick
];

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderTopic(topic) {
  return `
        <div class="topic">
          <div class="topic-name">${escapeHtml(topic.name)}</div>
          <ul class="points">
            ${topic.points.map((p) => `<li>${escapeHtml(p)}</li>`).join('\n            ')}
          </ul>
        </div>`;
}

function renderBranch(branch, index) {
  const color = branch.color || PALETTE[index % PALETTE.length];
  return `
      <div class="branch" style="--accent:${color}">
        <button type="button" class="branch-header" aria-expanded="false">
          <span class="dot"></span>
          <span class="branch-heading">
            <span class="branch-title">${escapeHtml(branch.title)}</span>
            <span class="branch-subtitle">${escapeHtml(branch.subtitle || '')}</span>
          </span>
          <span class="chevron">&#9656;</span>
        </button>
        <div class="branch-body">
          <div class="branch-body-inner">${branch.topics.map(renderTopic).join('')}
          </div>
        </div>
      </div>`;
}

const DARK_VARS_CSS = `
    --page-bg: #1c1a17;
    --card-bg: #26231f;
    --border: #3a362f;
    --text: #ece7dd;
    --text-muted: #a49c8d;
    --center-bg: #0f0e0c;
    --center-text: #f5f1ea;`;

/**
 * Renders a fully self-contained interactive mind map HTML document (no
 * external assets, inline CSS/JS only) from a title/subtitle and a list of
 * branches: [{title, subtitle, color?, topics: [{name, points: [string]}]}].
 *
 * `theme` locks the palette to 'light' or 'dark' (used when embedding in the
 * on-page overlay, so it matches the site's current theme). Left undefined,
 * the document falls back to the viewer's OS/browser preference via
 * prefers-color-scheme - the right behavior for a standalone downloaded file
 * with no site theme to match.
 */
export function generateMindMapHtml({title, subtitle, branches, theme}) {
  const branchesHtml = branches.map(renderBranch).join('\n');
  const themeBlock =
    theme === 'dark'
      ? `:root { color-scheme: dark;${DARK_VARS_CSS} }`
      : theme === 'light'
      ? ''
      : `@media (prefers-color-scheme: dark) { :root {${DARK_VARS_CSS} } }`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)} — mind map</title>
<style>
  :root {
    color-scheme: light;
    --page-bg: #f5f1ea;
    --card-bg: #ffffff;
    --border: #e4ddd0;
    --text: #2a2622;
    --text-muted: #746c60;
    --center-bg: #26221d;
    --center-text: #f5f1ea;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 2.5rem 1.5rem 4rem;
    background: var(--page-bg);
    color: var(--text);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.45;
  }
  .wrap { max-width: 1100px; margin: 0 auto; }
  .center-node {
    background: var(--center-bg);
    color: var(--center-text);
    border-radius: 14px;
    padding: 1.25rem 2rem;
    max-width: 560px;
    margin: 0 auto 2rem;
    text-align: center;
  }
  .center-title { font-size: 1.25rem; font-weight: 700; }
  .center-subtitle { font-size: 0.9rem; font-weight: 400; color: #cfc9bd; margin-top: 0.35rem; }
  .toolbar { display: flex; justify-content: center; margin-bottom: 1.5rem; }
  .toggle-btn {
    font: inherit;
    font-size: 0.85rem;
    font-weight: 600;
    padding: 0.5rem 1.1rem;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--card-bg);
    color: var(--text);
    cursor: pointer;
  }
  .toggle-btn:hover { border-color: #c9c0b0; }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
  }
  .branch {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
  }
  .branch-header {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.1rem;
    background: transparent;
    border: none;
    cursor: pointer;
    text-align: left;
    font: inherit;
    color: inherit;
  }
  .dot {
    flex: none;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--accent);
  }
  .branch-heading { flex: 1; min-width: 0; }
  .branch-title { display: block; font-weight: 700; font-size: 0.95rem; }
  .branch-subtitle {
    display: block;
    font-size: 0.8rem;
    color: var(--text-muted);
    margin-top: 0.15rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .chevron {
    flex: none;
    color: var(--text-muted);
    transition: transform 0.2s ease;
    font-size: 0.75rem;
  }
  .branch.open .chevron { transform: rotate(90deg); }
  .branch-body {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.25s ease;
  }
  .branch-body-inner {
    padding: 0 1.1rem 1.1rem;
    border-top: 1px solid var(--border);
    padding-top: 0.9rem;
  }
  .topic + .topic { margin-top: 0.9rem; }
  .topic-name { font-weight: 700; font-size: 0.85rem; margin-bottom: 0.3rem; }
  .points {
    margin: 0;
    padding-left: 1.1rem;
    font-size: 0.85rem;
    color: var(--text);
  }
  .points li { margin: 0.2rem 0; }
  .legend {
    text-align: center;
    font-size: 0.8rem;
    color: var(--text-muted);
    margin-top: 1.5rem;
  }
  ${themeBlock}
</style>
</head>
<body>
  <main class="wrap">
    <div class="center-node">
      <div class="center-title">${escapeHtml(title)}</div>
      ${subtitle ? `<div class="center-subtitle">${escapeHtml(subtitle)}</div>` : ''}
    </div>
    <div class="toolbar">
      <button type="button" class="toggle-btn" id="toggleAll">Expand all</button>
    </div>
    <div class="grid">${branchesHtml}
    </div>
    <p class="legend">Each dot marks a different branch — click a branch header to expand or collapse its details.</p>
  </main>
  <script>
    (function () {
      var branches = Array.prototype.slice.call(document.querySelectorAll('.branch'));
      var toggleAllBtn = document.getElementById('toggleAll');

      function setOpen(branch, open) {
        var body = branch.querySelector('.branch-body');
        var header = branch.querySelector('.branch-header');
        branch.classList.toggle('open', open);
        header.setAttribute('aria-expanded', String(open));
        body.style.maxHeight = open ? body.scrollHeight + 'px' : '0px';
      }

      function allOpen() {
        return branches.every(function (b) { return b.classList.contains('open'); });
      }

      function refreshToggleLabel() {
        toggleAllBtn.textContent = allOpen() ? 'Collapse all' : 'Expand all';
      }

      branches.forEach(function (branch) {
        var header = branch.querySelector('.branch-header');
        header.addEventListener('click', function () {
          setOpen(branch, !branch.classList.contains('open'));
          refreshToggleLabel();
        });
      });

      toggleAllBtn.addEventListener('click', function () {
        var open = !allOpen();
        branches.forEach(function (b) { setOpen(b, open); });
        refreshToggleLabel();
      });

      window.addEventListener('resize', function () {
        branches.forEach(function (b) {
          if (b.classList.contains('open')) {
            b.querySelector('.branch-body').style.maxHeight = b.querySelector('.branch-body-inner').offsetHeight + 'px';
          }
        });
      });
    })();
  </script>
</body>
</html>
`;
}
