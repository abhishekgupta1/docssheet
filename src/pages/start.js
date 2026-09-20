import React, {useState} from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {categories, topicsByCategory} from '@site/src/data/topics';

const PAGE_TITLE = 'Pick Your Focus';
const DESCRIPTION = 'Pick a focus area to get a starting set of cheat sheets, then track your progress on the dashboard.';

export default function Start() {
  const [selected, setSelected] = useState(null);
  const activeCategory = categories.find((c) => c.key === selected);
  const activeTopics = activeCategory ? topicsByCategory(activeCategory.key) : [];

  return (
    <Layout title={PAGE_TITLE} description={DESCRIPTION}>
      <main className="start-picker">
        <h1>What are you focused on right now?</h1>
        <p>Pick one to get a starting set of cheat sheets. You can always browse everything from the dashboard.</p>

        <div className="start-picker-options">
          {categories.map((category) => (
            <button
              key={category.key}
              type="button"
              className={clsx(
                'start-picker-option',
                `start-picker-option--${category.key}`,
                selected === category.key && 'start-picker-option--active'
              )}
              onClick={() => setSelected(category.key)}>
              {category.label}
            </button>
          ))}
        </div>

        {activeCategory && (
          <section className="start-picker-result">
            <p>{activeCategory.description}</p>
            <div className="cheat-landing-grid">
              {activeTopics.map((topic) => (
                <Link key={topic.id} to={topic.href} className={clsx('cheat-tile', `cheat-tile--${activeCategory.key}`)}>
                  {topic.emoji} {topic.title}
                </Link>
              ))}
            </div>
            <p>
              <Link to="/dashboard">Track your progress across all sheets →</Link>
            </p>
          </section>
        )}
      </main>
    </Layout>
  );
}
