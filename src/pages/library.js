import React, {useMemo, useState} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {usePluginData} from '@docusaurus/useGlobalData';
import LevelBadge from '@site/src/components/LevelBadge';
import styles from './library.module.css';

const TITLE = 'Library';
const DESCRIPTION =
  'Browse every guide by track, level, and reading time — find the right doc for the time you have.';

const TRACKS = ['SDET', 'SRE', 'SDE', 'AI', 'Leadership'];
const LEVELS = ['beginner', 'intermediate', 'advanced'];
const TIMES = [
  {label: 'Any length', max: Infinity},
  {label: '≤ 5 min', max: 5},
  {label: '≤ 15 min', max: 15},
  {label: '≤ 30 min', max: 30},
];

function Chip({on, onClick, children}) {
  return (
    <button
      type="button"
      className={on ? `${styles.chip} ${styles.chipOn}` : styles.chip}
      aria-pressed={on}
      onClick={onClick}>
      {children}
    </button>
  );
}

/** Toggle a value in a Set-backed array state. */
const toggle = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

export default function Library() {
  const {docs = []} = usePluginData('docs-index') || {};
  const [q, setQ] = useState('');
  const [tracks, setTracks] = useState([]);
  const [levels, setLevels] = useState([]);
  const [time, setTime] = useState(0);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const max = TIMES[time].max;
    return docs
      .filter((d) => !tracks.length || tracks.includes(d.track))
      .filter((d) => !levels.length || levels.includes(d.level))
      .filter((d) => max === Infinity || (d.minutes != null && d.minutes <= max))
      .filter(
        (d) =>
          !needle ||
          `${d.title} ${d.description} ${d.tags.join(' ')}`
            .toLowerCase()
            .includes(needle),
      )
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [docs, q, tracks, levels, time]);

  const reset = () => {
    setQ('');
    setTracks([]);
    setLevels([]);
    setTime(0);
  };
  const filtered = q || tracks.length || levels.length || time;

  return (
    <Layout title={TITLE} description={DESCRIPTION}>
      <main className={styles.page}>
        <h1>{TITLE}</h1>
        <p className={styles.lede}>
          Every guide in one place. Filter by track, level, and how long you
          have. For full-text search across everything, use the search box in
          the navbar.
        </p>

        <div className={styles.controls}>
          <input
            type="search"
            className={styles.search}
            placeholder="Filter by title or topic…"
            aria-label="Filter guides by title or topic"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <div className={styles.row} role="group" aria-label="Track">
            {TRACKS.map((t) => (
              <Chip key={t} on={tracks.includes(t)} onClick={() => setTracks(toggle(tracks, t))}>
                {t}
              </Chip>
            ))}
          </div>
          <div className={styles.row} role="group" aria-label="Level">
            {LEVELS.map((l) => (
              <Chip key={l} on={levels.includes(l)} onClick={() => setLevels(toggle(levels, l))}>
                <LevelBadge level={l} />
              </Chip>
            ))}
          </div>
          <div className={styles.row} role="group" aria-label="Reading time">
            {TIMES.map((t, i) => (
              <Chip key={t.label} on={time === i} onClick={() => setTime(i)}>
                {t.label}
              </Chip>
            ))}
          </div>
        </div>

        <p className={styles.count} aria-live="polite">
          {results.length} of {docs.length} guides
          {filtered ? (
            <button type="button" className={styles.reset} onClick={reset}>
              Clear filters
            </button>
          ) : null}
        </p>

        <ul className={styles.list}>
          {results.map((d) => (
            <li key={d.permalink} className={styles.item}>
              <Link to={d.permalink} className={styles.title}>
                {d.title}
              </Link>
              <span className={styles.meta}>
                <span className={styles.track}>{d.track}</span>
                {d.level && <LevelBadge level={d.level} compact />}
                {d.minutes != null && <span>{d.minutes} min read</span>}
              </span>
            </li>
          ))}
        </ul>
        {!results.length && (
          <p className={styles.empty}>No guides match. Try clearing a filter.</p>
        )}
      </main>
    </Layout>
  );
}
