import React from 'react';
import styles from './styles.module.css';

/**
 * A short real-world story: what the situation was, what happened, what it
 * taught. Keep each part to a few sentences — this is a spark, not a report.
 * Drop an <AISpark> right after (or inside) to show how you'd approach the
 * same thing with an AI assistant today.
 *
 *   <CaseStudy title="The 2am flaky-suite page">
 *     <CaseStudy.Context>
 *
 *     A 400-test suite went from 2% to 20% flaky over a quarter...
 *
 *     </CaseStudy.Context>
 *     <CaseStudy.WhatHappened>...</CaseStudy.WhatHappened>
 *     <CaseStudy.Lesson>...</CaseStudy.Lesson>
 *   </CaseStudy>
 */
function Part({label, children}) {
  return (
    <div className={styles.part}>
      <span className={styles.partLabel}>{label}</span>
      <div className={styles.partBody}>{children}</div>
    </div>
  );
}

const Context = ({children}) => <Part label="Context">{children}</Part>;
const WhatHappened = ({children}) => <Part label="What happened">{children}</Part>;
const Lesson = ({children}) => <Part label="Lesson">{children}</Part>;

export default function CaseStudy({title = 'Case study', children}) {
  return (
    <section className={styles.wrap} aria-label={`Case study: ${title}`}>
      <div className={styles.head}>
        <span aria-hidden="true">📌</span>
        <span className={styles.title}>{title}</span>
      </div>
      <div className={styles.body}>{children}</div>
    </section>
  );
}

CaseStudy.Context = Context;
CaseStudy.WhatHappened = WhatHappened;
CaseStudy.Lesson = Lesson;
