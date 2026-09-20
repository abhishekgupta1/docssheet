import React from 'react';
import styles from './styles.module.css';

/**
 * Small proficiency pill. Mirror the page's frontmatter `level`.
 *
 *   <LevelBadge level="beginner" />
 *   <LevelBadge level="intermediate" compact />
 */
const META = {
  beginner: {icon: '🟢', label: 'Beginner'},
  intermediate: {icon: '🟠', label: 'Intermediate'},
  advanced: {icon: '🟣', label: 'Advanced'},
};

export default function LevelBadge({level = 'beginner', compact = false}) {
  const key = String(level).toLowerCase();
  const meta = META[key] || META.beginner;
  return (
    <span
      className={`${styles.badge} ${styles[key] || styles.beginner}`}
      title={`Level: ${meta.label}`}>
      <span aria-hidden="true">{meta.icon}</span>
      {!compact && <span>{meta.label}</span>}
    </span>
  );
}
