import React, {useEffect, useState} from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {categories, roadmapForCategory} from '@site/src/data/skills';
import {STATUS, getAllProgress} from '@site/src/utils/progress';
import TechIcon from '@site/src/components/TechIcon';
import styles from './roadmap.module.css';

const TITLE = 'Skill Roadmap';
const DESCRIPTION =
  'A suggested order to learn each track — beginner to advanced — with your progress marked as you go.';

const TIER_LABEL = {beginner: 'Start here', intermediate: 'Build depth', advanced: 'Go deep'};

function useProgress() {
  const [progress, setProgress] = useState({});
  useEffect(() => {
    setProgress(getAllProgress());
    const on = () => setProgress(getAllProgress());
    window.addEventListener('cheatsheet-progress-changed', on);
    return () => window.removeEventListener('cheatsheet-progress-changed', on);
  }, []);
  return progress;
}

function Node({topic, status}) {
  return (
    <Link
      to={topic.href}
      className={clsx(
        styles.node,
        status === STATUS.KNOWN && styles.known,
        status === STATUS.IN_PROGRESS && styles.inProgress,
      )}
      title={topic.proficiencyNote || topic.title}>
      <TechIcon slug={topic.id} size={18} />
      <span className={styles.nodeLabel}>{topic.title}</span>
      {status === STATUS.KNOWN && <span aria-hidden="true">✅</span>}
      {status === STATUS.IN_PROGRESS && <span aria-hidden="true">🕓</span>}
    </Link>
  );
}

export default function Roadmap() {
  const progress = useProgress();
  return (
    <Layout title={TITLE} description={DESCRIPTION}>
      <main className={styles.page}>
        <h1>{TITLE}</h1>
        <p className={styles.lede}>
          Each track runs left to right: get comfortable with the first column,
          then the next. Marks come from the{' '}
          <Link to="/dashboard">progress dashboard</Link> — set them from any
          cheat sheet.
        </p>

        {categories.map((cat) => (
          <section key={cat.key} className={styles.track}>
            <h2 className={styles.trackHead}>{cat.label}</h2>
            <div className={styles.tiers}>
              {roadmapForCategory(cat.key).map((tier) => (
                <div key={tier.level} className={styles.tier}>
                  <div className={styles.tierHead}>
                    <span className={clsx(styles.dot, styles[`dot_${tier.level}`])} />
                    {TIER_LABEL[tier.level]}
                  </div>
                  <div className={styles.nodes}>
                    {tier.topics.map((t) => (
                      <Node key={t.id} topic={t} status={progress[t.id]} />
                    ))}
                    {tier.topics.length === 0 && (
                      <span className={styles.empty}>—</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>
    </Layout>
  );
}
