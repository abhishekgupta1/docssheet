import React, {useEffect, useState} from 'react';
import clsx from 'clsx';
import {STATUS, getStatus, setStatus} from '@site/src/utils/progress';
import styles from './styles.module.css';

/**
 * Per cheat-sheet "mark as known" toggle, mounted above the content by
 * src/theme/DocItem/Content for /cheatsheets/* pages. Mirrors devsheets.io's
 * progress dashboard at the granularity that fits this site: one status per
 * sheet, not per card.
 */
export default function ProgressTracker({id}) {
  const [status, setLocalStatus] = useState(null);

  useEffect(() => {
    setLocalStatus(getStatus(id));
  }, [id]);

  function handleClick(next) {
    const value = status === next ? null : next;
    setStatus(id, value);
    setLocalStatus(value);
  }

  return (
    <div className={styles.tracker} role="group" aria-label="Mark your progress on this cheat sheet">
      <button
        type="button"
        className={clsx(styles.btn, styles.inProgress, status === STATUS.IN_PROGRESS && styles.active)}
        aria-pressed={status === STATUS.IN_PROGRESS}
        onClick={() => handleClick(STATUS.IN_PROGRESS)}>
        🕓 In Progress
      </button>
      <button
        type="button"
        className={clsx(styles.btn, styles.known, status === STATUS.KNOWN && styles.active)}
        aria-pressed={status === STATUS.KNOWN}
        onClick={() => handleClick(STATUS.KNOWN)}>
        ✅ Known
      </button>
    </div>
  );
}
