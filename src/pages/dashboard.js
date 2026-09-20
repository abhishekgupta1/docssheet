import React, {useEffect, useRef, useState} from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {categories, topicsByCategory} from '@site/src/data/topics';
import {
  STATUS,
  getAllProgress,
  clearAllProgress,
  exportProgress,
  importProgress,
  getStreak,
} from '@site/src/utils/progress';

const PAGE_TITLE = 'Progress Dashboard';
const DESCRIPTION =
  "Track which cheat sheets you've learned. Per-browser, no account needed — export/import to move it between devices.";

function useProgress() {
  const [progress, setProgress] = useState({});
  const [streak, setStreak] = useState({count: 0, best: 0, last: null});

  useEffect(() => {
    const read = () => {
      setProgress(getAllProgress());
      setStreak(getStreak());
    };
    read();
    window.addEventListener('cheatsheet-progress-changed', read);
    return () => window.removeEventListener('cheatsheet-progress-changed', read);
  }, []);

  return {progress, streak};
}

function StatusBadge({status}) {
  if (status === STATUS.KNOWN) {
    return <span className="progress-badge progress-badge--known">✅ Known</span>;
  }
  if (status === STATUS.IN_PROGRESS) {
    return <span className="progress-badge progress-badge--in-progress">🕓 In Progress</span>;
  }
  return <span className="progress-badge progress-badge--none">Not started</span>;
}

function downloadJson(text, filename) {
  const blob = new Blob([text], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function Dashboard() {
  const {progress, streak} = useProgress();
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [ioMsg, setIoMsg] = useState(null);
  const fileInput = useRef(null);

  const allTopics = categories.flatMap((c) => topicsByCategory(c.key));
  const knownCount = allTopics.filter((t) => progress[t.id] === STATUS.KNOWN).length;
  const inProgressCount = allTopics.filter((t) => progress[t.id] === STATUS.IN_PROGRESS).length;
  const total = allTopics.length;
  const pct = total === 0 ? 0 : Math.round((knownCount / total) * 100);

  function onExport() {
    downloadJson(exportProgress(), `cheatsheet-progress-${new Date().toISOString().slice(0, 10)}.json`);
  }

  function onImportFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const res = importProgress(String(reader.result));
      setIoMsg(
        res.ok
          ? `Imported — ${res.added} change${res.added === 1 ? '' : 's'} merged, ${res.total} tracked.`
          : `Import failed: ${res.error}`,
      );
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <Layout title={PAGE_TITLE} description={DESCRIPTION}>
      <main className="progress-dashboard">
        <h1>Progress Dashboard</h1>
        <p>
          Mark sheets as known from their own page — this view just tallies it up. Not sure
          where to start? Try the <Link to="/start">focus picker</Link> or the{' '}
          <Link to="/roadmap">roadmap</Link>.
        </p>

        <div className="progress-summary">
          <div className="progress-summary-stats">
            <span>
              <strong>{knownCount}</strong> known
            </span>
            <span>
              <strong>{inProgressCount}</strong> in progress
            </span>
            <span>
              <strong>{total}</strong> total
            </span>
            <span title={streak.last ? `Last studied ${streak.last}` : 'No activity yet'}>
              🔥 <strong>{streak.count}</strong>-day streak
              {streak.best > streak.count ? ` (best ${streak.best})` : ''}
            </span>
          </div>
          <div className="progress-bar-track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <div className="progress-bar-fill" style={{width: `${pct}%`}} />
          </div>

          <div className="progress-io">
            <button type="button" className="progress-clear-btn" onClick={onExport}>
              ⬇ Export
            </button>
            <button
              type="button"
              className="progress-clear-btn"
              onClick={() => fileInput.current?.click()}>
              ⬆ Import
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="application/json,.json"
              onChange={onImportFile}
              style={{display: 'none'}}
            />
            {(knownCount > 0 || inProgressCount > 0) &&
              (confirmingClear ? (
                <span className="progress-clear-confirm">
                  Clear all?{' '}
                  <button
                    type="button"
                    className="progress-clear-btn progress-clear-btn--danger"
                    onClick={() => {
                      clearAllProgress();
                      setConfirmingClear(false);
                    }}>
                    Yes
                  </button>
                  <button type="button" className="progress-clear-btn" onClick={() => setConfirmingClear(false)}>
                    Cancel
                  </button>
                </span>
              ) : (
                <button type="button" className="progress-clear-btn" onClick={() => setConfirmingClear(true)}>
                  Clear all progress
                </button>
              ))}
          </div>
          {ioMsg && <p className="progress-io-msg">{ioMsg}</p>}
        </div>

        {categories.map((category) => (
          <section key={category.key}>
            <h2 className="cheat-category-heading">{category.label}</h2>
            <div className="cheat-landing-grid">
              {topicsByCategory(category.key).map((topic) => (
                <Link
                  key={topic.id}
                  to={topic.href}
                  className={clsx('cheat-tile', `cheat-tile--${category.key}`, 'progress-tile')}>
                  <span>
                    {topic.emoji} {topic.title}
                  </span>
                  <StatusBadge status={progress[topic.id]} />
                </Link>
              ))}
            </div>
          </section>
        ))}
      </main>
    </Layout>
  );
}
