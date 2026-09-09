import React, {useEffect} from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import {ADS_ENABLED, ADSENSE_CLIENT} from '@site/src/data/site';
import styles from './styles.module.css';

/**
 * A single AdSense placement. Renders nothing at all while ADS_ENABLED is
 * false (see src/data/site.js), so it's safe to drop into templates now and
 * switch on later. When live, it reserves its height first to avoid layout
 * shift, then asks AdSense to fill it.
 *
 *   <AdSlot slot="1234567890" />                     // responsive
 *   <AdSlot slot="1234567890" format="rectangle" />  // fixed shape
 */
function AdUnit({slot, format = 'auto', responsive = true, minHeight = 280}) {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      /* AdSense not loaded (blocked, offline) — leave the slot empty */
    }
  }, []);

  return (
    <aside className={styles.wrap} aria-label="Advertisement" style={{minHeight}}>
      <span className={styles.label}>Advertisement</span>
      <ins
        className="adsbygoogle"
        style={{display: 'block'}}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </aside>
  );
}

export default function AdSlot(props) {
  if (!ADS_ENABLED) return null;
  return <BrowserOnly>{() => <AdUnit {...props} />}</BrowserOnly>;
}
