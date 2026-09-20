import React from 'react';
import styles from './styles.module.css';

/**
 * Static "hook" callout for the top of an article/doc: a few author-written
 * bullets summarizing the piece, so a skimmer has a reason to keep reading.
 * Unlike ListenButton/MindMapButton this has no logic - drop it into the
 * MDX content wherever the takeaways belong.
 *
 * Usage:
 *   import KeyTakeaways from '@site/src/components/KeyTakeaways';
 *
 *   <KeyTakeaways>
 *
 *   - First takeaway
 *   - Second takeaway
 *
 *   </KeyTakeaways>
 */
export default function KeyTakeaways({title = 'Key Takeaways', children}) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.icon} aria-hidden="true">🎯</span>
        <span className={styles.title}>{title}</span>
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
