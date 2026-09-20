import React, {useCallback, useEffect} from 'react';
import {createPortal} from 'react-dom';
import styles from './styles.module.css';

function downloadHtml(filename, html) {
  const blob = new Blob([html], {type: 'text/html'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Slide-in overlay, docked to the right edge of the viewport, that renders a
 * generated mind map HTML document inside an iframe. Rendered through a
 * portal so it sits above page content regardless of where the triggering
 * button lives in the DOM.
 */
export default function MindMapPanel({title, html, filename, onClose}) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  const handleDownload = useCallback(() => {
    downloadHtml(filename, html);
  }, [filename, html]);

  return createPortal(
    <div className={styles.overlayRoot}>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.panel} role="dialog" aria-modal="true" aria-label={`${title} — mind map`}>
        <div className={styles.panelHeader}>
          <span className={styles.panelTitle}>🧠 {title}</span>
          <div className={styles.panelActions}>
            <button type="button" className={styles.panelIconButton} onClick={handleDownload} aria-label="Download mind map as HTML">
              ⬇
            </button>
            <button type="button" className={styles.panelIconButton} onClick={onClose} aria-label="Close mind map">
              ✕
            </button>
          </div>
        </div>
        <iframe className={styles.panelFrame} title={`${title} — mind map`} srcDoc={html} />
      </div>
    </div>,
    document.body,
  );
}
