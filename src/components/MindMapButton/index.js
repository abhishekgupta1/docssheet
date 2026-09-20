import React, {useCallback, useState} from 'react';
import clsx from 'clsx';
import {extractBranchesFromContent} from '@site/src/components/MindMap/extractBranches';
import {generateMindMapHtml} from '@site/src/components/MindMap/template';
import {slugify} from '@site/src/components/MindMap/utils';
import MindMapPanel from './Panel';
import styles from './styles.module.css';

/**
 * Opens a self-contained interactive mind map as a right-side overlay,
 * summarizing either DOM content (targetRef - branches are mined from its
 * own heading structure) or an explicit `branches` array (e.g. built from a
 * project card's structured fields). No content is invented beyond what's
 * passed in or found in the source.
 */
export default function MindMapButton({targetRef, branches: providedBranches, title, subtitle, variant = 'toolbar'}) {
  const [html, setHtml] = useState(null);

  const handleClick = useCallback(() => {
    const branches = providedBranches ?? extractBranchesFromContent(targetRef && targetRef.current);
    if (!branches || branches.length === 0) return;
    const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    setHtml(generateMindMapHtml({title, subtitle, branches, theme}));
  }, [providedBranches, targetRef, title, subtitle]);

  const handleClose = useCallback(() => setHtml(null), []);

  return (
    <>
      <button
        type="button"
        className={clsx(variant === 'inline' ? styles.inlineButton : styles.button)}
        onClick={handleClick}
      >
        🧠 Mind map
      </button>
      {html && (
        <MindMapPanel title={title} html={html} filename={`${slugify(title)}-mind-map.html`} onClose={handleClose} />
      )}
    </>
  );
}
