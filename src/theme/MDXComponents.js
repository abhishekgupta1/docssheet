import MDXComponents from '@theme-original/MDXComponents';
import AdSlot from '@site/src/components/AdSlot';

/**
 * Components usable in any .md / .mdx file with no import.
 * AdSlot self-gates on ADS_ENABLED (src/data/site.js) — inert until ads are on.
 */
export default {
  ...MDXComponents,
  AdSlot,
};
