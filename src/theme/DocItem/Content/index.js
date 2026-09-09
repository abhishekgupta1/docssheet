/**
 * Swizzled from @docusaurus/theme-classic to add BreadcrumbList JSON-LD
 * (an SEO rich result) derived from each doc's permalink. Keep this in sync
 * with upstream DocItem/Content if Docusaurus is upgraded.
 */
import React from 'react';
import clsx from 'clsx';
import Head from '@docusaurus/Head';
import {ThemeClassNames} from '@docusaurus/theme-common';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import Heading from '@theme/Heading';
import MDXContent from '@theme/MDXContent';
import {SITE_URL} from '@site/src/data/site';

function useSyntheticTitle() {
  const {metadata, frontMatter, contentTitle} = useDoc();
  const shouldRender = !frontMatter.hide_title && typeof contentTitle === 'undefined';
  if (!shouldRender) {
    return null;
  }
  return metadata.title;
}

const titleCase = (seg) =>
  seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/** BreadcrumbList JSON-LD derived from the doc permalink — SEO rich result. */
function breadcrumbJsonLd(permalink, title) {
  const parts = permalink.split('/').filter(Boolean);
  const items = parts.map((seg, i) => {
    const isLast = i === parts.length - 1;
    return {
      '@type': 'ListItem',
      position: i + 1,
      name: isLast ? title : titleCase(seg),
      item: `${SITE_URL}/${parts.slice(0, i + 1).join('/')}`,
    };
  });
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}

export default function DocItemContent({children}) {
  const syntheticTitle = useSyntheticTitle();
  const {metadata} = useDoc();

  return (
    <>
      <Head>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbJsonLd(metadata.permalink, metadata.title))}
        </script>
      </Head>
      <div className={clsx(ThemeClassNames.docs.docMarkdown, 'markdown')}>
        {syntheticTitle && (
          <header>
            <Heading as="h1">{syntheticTitle}</Heading>
          </header>
        )}
        <MDXContent>{children}</MDXContent>
      </div>
    </>
  );
}
