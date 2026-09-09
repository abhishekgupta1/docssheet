/**
 * Single source of truth for site-level identity, analytics, and ads config.
 * Imported by both `docusaurus.config.js` (build) and client components, so keep
 * every export a plain serialisable constant.
 */

export const SITE_URL = 'https://docssheet.com';

/** schema.org Person — powers the site-wide JSON-LD in src/theme/Root.js. */
export const PERSON = {
  name: 'Abhishek Gupta',
  jobTitle: 'SDET III · SRE · AI Systems Engineer',
  url: SITE_URL,
  sameAs: [
    'https://github.com/abhishekgupta1',
    'https://www.linkedin.com/in/abhishekcgupta1/',
  ],
};

/**
 * GoatCounter analytics (cookieless, no personal data — no consent banner
 * needed for it). Create a site at https://www.goatcounter.com/ and put its
 * code here (the `<code>` in `https://<code>.goatcounter.com`). Empty = no
 * script is injected.
 */
export const GOATCOUNTER_CODE = '';

/**
 * Google AdSense.
 *
 * ADSENSE_CLIENT is the real publisher ID, so the loader script is emitted
 * site-wide (docusaurus.config.js -> ADSENSE_ON) — this is what AdSense checks
 * during "Requires review". static/ads.txt carries the matching DIRECT line.
 *
 * ADS_ENABLED still gates actual ad units: while false, every <AdSlot> renders
 * nothing. After the account is approved, flip it to true and add ad units.
 */
export const ADS_ENABLED = false;
export const ADSENSE_CLIENT = 'ca-pub-1394375154476572';

/** localStorage key the ConsentBanner writes once a choice is made. */
export const CONSENT_KEY = 'site:ad-consent';

/**
 * Show the consent banner even while ads are still off. Google Consent Mode v2
 * signals (see docusaurus.config.js headTags) are always wired; this only
 * controls whether the visible accept/reject strip is rendered. Keep true so
 * the consent flow is testable and in place before AdSense goes live. For full
 * EEA/UK compliance, replace this banner with a Google-certified CMP (or
 * Google's own Privacy & messaging / Funding Choices) once approved.
 */
export const CONSENT_REQUIRED = true;
