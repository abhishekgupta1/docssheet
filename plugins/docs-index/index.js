const fs = require('fs');
const path = require('path');

/**
 * Exposes a flat index of every doc (title, permalink, track, level, tags,
 * reading time) as global data, so /library can filter client-side without a
 * server. Built from Docusaurus's own docs metadata, so permalinks are always
 * the real routes. Best-effort: on any failure the index is simply empty.
 */

const TRACKS = {
  'sdet-skills': 'SDET',
  'sre-skills': 'SRE',
  'sde-skills': 'SDE',
  'ai-skills': 'AI',
  'mba-skills': 'Leadership',
};

const WORDS_PER_MIN = 220;

/** Word count of prose only: strips frontmatter, code fences, SVG, and tags. */
function readingMinutes(file) {
  try {
    const text = fs
      .readFileSync(file, 'utf8')
      .replace(/^---[\s\S]*?\n---\n/, '')
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/<svg[\s\S]*?<\/svg>/g, ' ')
      .replace(/<[^>]+>/g, ' ');
    const words = (text.match(/\S+/g) || []).length;
    return Math.max(1, Math.round(words / WORDS_PER_MIN));
  } catch {
    return null;
  }
}

module.exports = function docsIndexPlugin(context) {
  return {
    name: 'docs-index',
    async allContentLoaded({allContent, actions}) {
      try {
        const docsPlugin = allContent['docusaurus-plugin-content-docs'];
        const version = docsPlugin.default.loadedVersions[0];
        const docs = version.docs
          .map((d) => {
            const seg = d.permalink.split('/')[2];
            const track = TRACKS[seg];
            if (!track) return null; // intro, contributing, etc.
            const file = path.join(
              context.siteDir,
              d.source.replace('@site/', ''),
            );
            return {
              title: d.title,
              description: d.description || '',
              permalink: d.permalink,
              track,
              level: d.frontMatter.level || null,
              tags: d.frontMatter.tags || [],
              minutes: readingMinutes(file),
            };
          })
          .filter(Boolean);
        actions.setGlobalData({docs});
      } catch (e) {
        console.warn('[docs-index] failed, library will be empty:', e.message);
        actions.setGlobalData({docs: []});
      }
    },
  };
};
