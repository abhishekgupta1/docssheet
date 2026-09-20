// Small text helpers shared by the mind map branch builders (extractBranches,
// fromProject) and the HTML template. No dependencies, safe to run client-side.

export function clean(str) {
  return String(str || '')
    // Strips zero-width chars Docusaurus injects into heading anchor links
    // (e.g. the hidden text of the "#" permalink icon).
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function truncate(str, max) {
  const s = clean(str);
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > 40 ? lastSpace : max)}…`;
}

// Splits on sentence-ending punctuation followed by whitespace, so a
// paragraph can be reduced to its first couple of standalone facts.
export function splitSentences(text) {
  const cleaned = clean(text);
  if (!cleaned) return [];
  return cleaned
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function slugify(str) {
  const s = String(str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return s || 'mind-map';
}
