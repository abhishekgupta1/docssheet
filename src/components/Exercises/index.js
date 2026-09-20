import React, {useState} from 'react';
import LevelBadge from '@site/src/components/LevelBadge';
import styles from './styles.module.css';

/**
 * Hands-on practice tasks. Each task can carry a difficulty and a stretch
 * goal. The checkbox is local-only (not persisted) — just a visual nudge.
 *
 *   <Exercises>
 *     <Exercises.Task title="Write your first test" level="beginner"
 *       stretch="Make it run in CI on push">
 *
 *     Create a test that opens the docs homepage and asserts the title.
 *
 *     </Exercises.Task>
 *   </Exercises>
 */
function Task({title, level, stretch, children}) {
  const [done, setDone] = useState(false);
  return (
    <li className={styles.task}>
      <label className={styles.row}>
        <input type="checkbox" checked={done} onChange={() => setDone((v) => !v)} />
        <span className={done ? styles.titleDone : styles.title}>{title}</span>
        {level && <LevelBadge level={level} compact />}
      </label>
      <div className={styles.body}>{children}</div>
      {stretch && (
        <p className={styles.stretch}>
          <span aria-hidden="true">🎯 </span>
          <strong>Stretch:</strong> {stretch}
        </p>
      )}
    </li>
  );
}

export default function Exercises({title = 'Practical exercises', children}) {
  return (
    <section className={styles.wrap} aria-label={title}>
      <div className={styles.head}>
        <span aria-hidden="true">🛠️</span> {title}
      </div>
      <ol className={styles.list}>{children}</ol>
    </section>
  );
}

Exercises.Task = Task;
