import {clean, truncate, splitSentences} from './utils';

const HEADING_TAGS = ['H2', 'H3', 'H4', 'H5', 'H6'];
const MAX_POINTS_PER_TOPIC = 5;

function headingLevel(el) {
  return HEADING_TAGS.includes(el.tagName) ? Number(el.tagName[1]) : null;
}

function appendContentAsPoints(el, topic) {
  if (topic.points.length >= MAX_POINTS_PER_TOPIC) return;
  const tag = el.tagName;

  if (tag === 'UL' || tag === 'OL') {
    for (const li of el.querySelectorAll(':scope > li')) {
      if (topic.points.length >= MAX_POINTS_PER_TOPIC) break;
      const text = clean(li.textContent);
      if (text) topic.points.push(truncate(text, 140));
    }
    return;
  }

  if (tag === 'P') {
    const text = clean(el.textContent);
    if (!text) return;
    for (const sentence of splitSentences(text).slice(0, 2)) {
      if (topic.points.length >= MAX_POINTS_PER_TOPIC) break;
      topic.points.push(truncate(sentence, 160));
    }
    return;
  }

  if (tag === 'PRE') {
    if (!topic.points.some((p) => p.startsWith('Includes a code example'))) {
      topic.points.push('Includes a code example');
    }
    return;
  }

  if (tag === 'TABLE') {
    if (!topic.points.some((p) => p.startsWith('Includes a reference table'))) {
      topic.points.push('Includes a reference table');
    }
    return;
  }

  if (tag === 'BLOCKQUOTE' || (el.className && /admonition/.test(el.className))) {
    const text = clean(el.textContent);
    if (text) topic.points.push(truncate(text, 160));
  }
}

/**
 * Walks the rendered doc/article content and turns its own heading structure
 * into mind map branches (shallowest heading level) and topics (next level
 * down), pulling bullet points from lists/paragraphs under each. Pure DOM
 * read, no invented categories - if the content has no headings, returns [].
 */
export function extractBranchesFromContent(root) {
  if (!root) return [];
  const children = Array.from(root.children);
  const levels = children.map(headingLevel).filter(Boolean);
  if (levels.length === 0) return [];

  const branchLevel = Math.min(...levels);
  const topicLevel = branchLevel + 1;

  const branches = [];
  let currentBranch = null;
  let currentTopic = null;

  for (const el of children) {
    const level = headingLevel(el);

    if (level === branchLevel) {
      currentBranch = {title: clean(el.textContent), subtitle: '', topics: []};
      branches.push(currentBranch);
      currentTopic = null;
      continue;
    }

    if (!currentBranch) continue;

    if (level === topicLevel) {
      currentTopic = {name: clean(el.textContent), points: []};
      currentBranch.topics.push(currentTopic);
      continue;
    }

    if (level && level > topicLevel) {
      if (!currentTopic) {
        currentTopic = {name: clean(el.textContent), points: []};
        currentBranch.topics.push(currentTopic);
      } else {
        currentTopic.points.push(truncate(clean(el.textContent), 140));
      }
      continue;
    }

    if (!currentTopic) {
      currentTopic = {name: 'Overview', points: []};
      currentBranch.topics.push(currentTopic);
    }
    appendContentAsPoints(el, currentTopic);
  }

  const nonEmptyBranches = branches
    .map((branch) => ({
      ...branch,
      topics: branch.topics.filter((t) => t.points.length > 0),
    }))
    .filter((branch) => branch.topics.length > 0);

  for (const branch of nonEmptyBranches) {
    const firstPoint = branch.topics[0].points[0];
    branch.subtitle = firstPoint
      ? truncate(firstPoint, 70)
      : `${branch.topics.length} topic${branch.topics.length > 1 ? 's' : ''}`;
  }

  return nonEmptyBranches;
}
