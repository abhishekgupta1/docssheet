import React from 'react';
import styles from './styles.module.css';

/**
 * "Use this with AI" — 2-3 concrete ways to apply an AI assistant/agent to
 * this topic. Body is usually a short list of prompt ideas or agent
 * workflows. Stands alone or drops inside <CaseStudy>.
 *
 *   <AISpark>
 *
 *   - Paste a failing trace and ask for the three most likely root causes, ranked.
 *   - Have an agent scaffold POM classes from a URL, then review the selectors.
 *
 *   </AISpark>
 */
export default function AISpark({title = 'Use this with AI', children}) {
  return (
    <div className={styles.box}>
      <div className={styles.head}>
        <span className={styles.icon} aria-hidden="true">✨</span>
        <span className={styles.title}>{title}</span>
      </div>
      <div className={styles.body}>{children}</div>
    </div>
  );
}
