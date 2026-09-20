import React from 'react';
import styles from './styles.module.css';

/**
 * "Learn this in N minutes" — the fast path. Put it right under the page
 * intro. Body is usually a short ordered list: the few things worth doing
 * first, in order.
 *
 *   <TenMinute minutes={10}>
 *
 *   1. Install and run one test
 *   2. Read the report
 *   3. Change one selector and re-run
 *
 *   </TenMinute>
 */
export default function TenMinute({
  minutes = 10,
  title = `Learn this in ${minutes} minutes`,
  children,
}) {
  return (
    <div className={styles.box}>
      <div className={styles.head}>
        <span className={styles.icon} aria-hidden="true">⏱️</span>
        <span className={styles.title}>{title}</span>
        <span className={styles.pill}>{minutes} min</span>
      </div>
      <div className={styles.body}>{children}</div>
    </div>
  );
}
