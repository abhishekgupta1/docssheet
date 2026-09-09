import React from 'react';
import Head from '@docusaurus/Head';
import {Redirect} from '@docusaurus/router';

/**
 * The site is docs-first: the root URL sends visitors straight into the Docs.
 * <Redirect> handles the in-app navigation; the <meta http-equiv> + canonical
 * cover crawlers and a hard page load. Keep the target in sync with the
 * "intro" doc id in sidebars.js.
 */
const TARGET = '/docs/intro';

export default function Home() {
  return (
    <>
      <Head>
        <meta httpEquiv="refresh" content={`0; url=${TARGET}`} />
        <link rel="canonical" href={TARGET} />
      </Head>
      <Redirect to={TARGET} />
    </>
  );
}
