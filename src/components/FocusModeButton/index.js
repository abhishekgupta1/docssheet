import React, {useEffect, useState} from 'react';
import styles from './styles.module.css';

const STORAGE_KEY = 'focus-mode';
const HTML_CLASS = 'focus-mode';

/**
 * Floating "Focus mode" toggle. When on, it adds `focus-mode` to <html>, and
 * the rules in src/css/custom.css hide the side navs (docs sidebar, table of
 * contents, blog sidebar) so only the page text is left. The choice is
 * remembered in localStorage; Esc turns it off.
 *
 * Mounted once from src/theme/Root.js so it appears on every page.
 */
export default function FocusModeButton() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    try {
      setOn(localStorage.getItem(STORAGE_KEY) === 'on');
    } catch (e) {
      /* storage blocked — start with focus mode off */
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle(HTML_CLASS, on);
    try {
      localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off');
    } catch (e) {
      /* storage blocked — the choice lasts for this page load only */
    }
    if (!on) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setOn(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [on]);

  return (
    <button
      type="button"
      className={styles.button}
      aria-pressed={on}
      title={on ? 'Exit focus mode (Esc)' : 'Hide side navigation to focus on the text'}
      onClick={() => setOn((v) => !v)}>
      {on ? '✕ Exit focus' : '◎ Focus mode'}
    </button>
  );
}
