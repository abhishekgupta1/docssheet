import React, {useEffect, useState} from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {categories, skillsByCategory} from '@site/src/data/skills';
import {STATUS, getAllProgress} from '@site/src/utils/progress';
import TechIcon from '@site/src/components/TechIcon';
import styles from './skills.module.css';

const TITLE = 'Skills Matrix';
const DESCRIPTION =
  'Self-assessed proficiency across SDET, SRE, SDE, AI, and leadership topics, with links to the reference for each.';

const LEVEL_TEXT = ['', 'Familiar', 'Working', 'Proficient', 'Strong', 'Expert'];

function useProgress() {
  const [p, setP] = useState({});
  useEffect(() => {
    setP(getAllProgress());
    const on = () => setP(getAllProgress());
    window.addEventListener('cheatsheet-progress-changed', on);
    return () => window.removeEventListener('cheatsheet-progress-changed', on);
  }, []);
  return p;
}

function Meter({level}) {
  return (
    <span className={styles.meter} title={LEVEL_TEXT[level]} aria-label={`${LEVEL_TEXT[level]} (${level} of 5)`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={clsx(styles.pip, n <= level && styles.pipOn)} />
      ))}
    </span>
  );
}

export default function Skills() {
  const progress = useProgress();
  return (
    <Layout title={TITLE} description={DESCRIPTION}>
      <main className={styles.page}>
        <h1>{TITLE}</h1>
        <p className={styles.lede}>
          Proficiency is my own honest read, not a certification. 1 Familiar ·
          2 Working · 3 Proficient · 4 Strong · 5 Expert. The ✅ / 🕓 marks are
          your <Link to="/dashboard">study progress</Link>.
        </p>

        {categories.map((cat) => (
          <section key={cat.key} className={styles.group}>
            <h2 className={styles.groupHead}>{cat.label}</h2>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Topic</th>
                  <th className={styles.meterCol}>Proficiency</th>
                  <th className={styles.noteCol}>Where I use it</th>
                  <th className={styles.statusCol}>You</th>
                </tr>
              </thead>
              <tbody>
                {skillsByCategory(cat.key).map((t) => (
                  <tr key={t.id}>
                    <td>
                      <Link to={t.href} className={styles.topic}>
                        <TechIcon slug={t.id} size={16} />
                        {t.title}
                      </Link>
                    </td>
                    <td><Meter level={t.proficiency} /></td>
                    <td className={styles.note}>{t.proficiencyNote || '—'}</td>
                    <td className={styles.status}>
                      {progress[t.id] === STATUS.KNOWN && '✅'}
                      {progress[t.id] === STATUS.IN_PROGRESS && '🕓'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))}
      </main>
    </Layout>
  );
}
