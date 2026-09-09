import React, {useEffect, useState} from 'react';
import Link from '@docusaurus/Link';
import {ADS_ENABLED, CONSENT_REQUIRED, CONSENT_KEY} from '@site/src/data/site';
import styles from './styles.module.css';

/**
 * Consent strip implementing Google Consent Mode v2.
 *
 * The default (denied) signals are set in docusaurus.config.js headTags before
 * any Google tag loads. This component collects the visitor's choice, persists
 * it in localStorage, and calls gtag('consent','update',...) so AdSense / GA
 * behave accordingly. On later page loads the headTags snippet re-applies a
 * stored "accepted" choice, so this only needs to render when no choice exists.
 *
 * Shown whenever CONSENT_REQUIRED is true (so the flow is live before ads are),
 * or whenever ads are actually enabled. Mounted once from src/theme/Root.js.
 *
 * NOTE: this is a first-party banner, not a Google-certified CMP. For EEA/UK ad
 * serving, swap it for a certified CMP or Google's Privacy & messaging tool.
 */
const CONSENT_GRANTED = {
  ad_storage: 'granted',
  ad_user_data: 'granted',
  ad_personalization: 'granted',
  analytics_storage: 'granted',
};

const CONSENT_DENIED = {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
};

export default function ConsentBanner() {
  const [choice, setChoice] = useState('pending');

  useEffect(() => {
    if (!CONSENT_REQUIRED && !ADS_ENABLED) return;
    try {
      setChoice(localStorage.getItem(CONSENT_KEY) || 'unset');
    } catch (e) {
      setChoice('unset');
    }
  }, []);

  function decide(value) {
    const accepted = value === 'accepted';
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch (e) {
      /* storage blocked — honour the choice for this page load only */
    }
    // Google Consent Mode v2.
    try {
      window.gtag?.('consent', 'update', accepted ? CONSENT_GRANTED : CONSENT_DENIED);
    } catch (e) {
      /* gtag shim not present */
    }
    // Legacy AdSense personalisation flag (pre-Consent-Mode).
    try {
      (window.adsbygoogle = window.adsbygoogle || []).requestNonPersonalizedAds =
        accepted ? 0 : 1;
    } catch (e) {
      /* AdSense not on the page */
    }
    setChoice(value);
  }

  if (
    (!CONSENT_REQUIRED && !ADS_ENABLED) ||
    choice === 'pending' ||
    choice === 'accepted' ||
    choice === 'rejected'
  ) {
    return null;
  }

  return (
    <div className={styles.banner} role="dialog" aria-label="Cookie consent">
      <p className={styles.text}>
        We use cookies for Google ads and analytics. You can accept them or keep
        only what the site needs to work. See the{' '}
        <Link to="/privacy">Privacy Policy</Link> and{' '}
        <Link to="/cookie-policy">Cookie Policy</Link>.
      </p>
      <div className={styles.actions}>
        <button type="button" className={styles.reject} onClick={() => decide('rejected')}>
          Reject non-essential
        </button>
        <button type="button" className={styles.accept} onClick={() => decide('accepted')}>
          Accept
        </button>
      </div>
    </div>
  );
}
