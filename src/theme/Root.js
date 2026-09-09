import React from 'react';
import Head from '@docusaurus/Head';
import {SITE_URL, PERSON} from '@site/src/data/site';
import ConsentBanner from '@site/src/components/ConsentBanner';

/**
 * Wraps the entire app and persists across route changes. Two jobs:
 *  - inject the site-wide JSON-LD (WebSite + Person) once
 *  - mount the cookie-consent banner (self-hides unless ads are enabled)
 * Per-page schema (BlogPosting, BreadcrumbList, Credential) lives in the
 * relevant swizzles / page <Head> blocks.
 */
const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: 'docssheet',
      inLanguage: 'en',
      publisher: {'@id': `${SITE_URL}/#person`},
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Person',
      '@id': `${SITE_URL}/#person`,
      name: PERSON.name,
      url: PERSON.url,
      jobTitle: PERSON.jobTitle,
      sameAs: PERSON.sameAs,
    },
  ],
};

export default function Root({children}) {
  return (
    <>
      <Head>
        <script type="application/ld+json">{JSON.stringify(JSON_LD)}</script>
      </Head>
      {children}
      <ConsentBanner />
    </>
  );
}
