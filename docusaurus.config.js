// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';
import {GOATCOUNTER_CODE, ADSENSE_CLIENT} from './src/data/site.js';

const GITHUB_REPO = 'https://github.com/abhishekgupta1/docssheet';
const EDIT_URL = `${GITHUB_REPO}/tree/main/`;

/**
 * Analytics + ads are injected here only when switched on in src/data/site.js.
 * GoatCounter is cookieless. The AdSense loader script is emitted as soon as a
 * real ADSENSE_CLIENT is set (needed for site verification / review); actual
 * ad units (<AdSlot>) stay gated behind ADS_ENABLED and render nothing until
 * the account is approved and that flag is flipped.
 */
const ADSENSE_ON =
  !!ADSENSE_CLIENT && !ADSENSE_CLIENT.endsWith('0000000000000000');

const conditionalHeadTags = [
  // Google Consent Mode v2 — MUST run before any Google tag (AdSense / GA).
  // Everything starts denied; src/components/ConsentBanner flips these to
  // 'granted' via gtag('consent','update',...) once the visitor accepts, and
  // this inline block re-applies a stored "accepted" choice on later page loads.
  {
    tagName: 'script',
    attributes: {},
    innerHTML: `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      window.gtag = window.gtag || gtag;
      gtag('consent', 'default', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied',
        wait_for_update: 500
      });
      try {
        if (localStorage.getItem('site:ad-consent') === 'accepted') {
          gtag('consent', 'update', {
            ad_storage: 'granted',
            ad_user_data: 'granted',
            ad_personalization: 'granted',
            analytics_storage: 'granted'
          });
        }
      } catch (e) {}
    `,
  },
  {
    tagName: 'link',
    attributes: {rel: 'icon', type: 'image/png', sizes: '32x32', href: '/img/favicon-32x32.png'},
  },
  {
    tagName: 'link',
    attributes: {rel: 'icon', type: 'image/png', sizes: '16x16', href: '/img/favicon-16x16.png'},
  },
  ...(GOATCOUNTER_CODE
    ? [
        {
          tagName: 'script',
          attributes: {
            'data-goatcounter': `https://${GOATCOUNTER_CODE}.goatcounter.com/count`,
            async: true,
            src: '//gc.zgo.at/count.js',
          },
        },
      ]
    : []),
  ...(ADSENSE_ON
    ? [
        {
          tagName: 'script',
          attributes: {
            async: 'true',
            src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`,
            crossorigin: 'anonymous',
          },
        },
      ]
    : []),
];

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'docssheet',
  tagline: 'Docs & cheat sheets for testing, reliability, and AI',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://docssheet.com',
  baseUrl: '/',

  organizationName: 'abhishekgupta1',
  projectName: 'docssheet',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  onBrokenLinks: 'throw',

  headTags: conditionalHeadTags,

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: './docs',
          routeBasePath: 'docs',
          sidebarPath: './sidebars.js',
          editUrl: EDIT_URL,
          showLastUpdateTime: true,
          showLastUpdateAuthor: true,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {
          lastmod: 'date',
          changefreq: 'weekly',
          priority: 0.5,
          filename: 'sitemap.xml',
        },
        // Google Analytics (GA4). Uncomment and set trackingID once you have a
        // property. Left off until then because an invalid ID fails the build.
        // gtag: {
        //   trackingID: 'G-XXXXXXXXXX',
        //   anonymizeIP: true,
        // },
      }),
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      /** @type {import('@docusaurus/plugin-content-docs').Options} */
      ({
        id: 'cheatsheets',
        path: 'cheatsheets',
        routeBasePath: 'cheatsheets',
        sidebarPath: './sidebarsCheatsheets.js',
        editUrl: EDIT_URL,
        showLastUpdateTime: true,
        showLastUpdateAuthor: true,
      }),
    ],
    [
      '@docusaurus/plugin-pwa',
      {
        debug: false,
        offlineModeActivationStrategies: [
          'appInstalled',
          'standalone',
          'queryString',
        ],
        pwaHead: [
          {tagName: 'link', rel: 'manifest', href: '/manifest.json'},
          {tagName: 'meta', name: 'theme-color', content: '#FFC933'},
          {tagName: 'meta', name: 'apple-mobile-web-app-capable', content: 'yes'},
          {
            tagName: 'meta',
            name: 'apple-mobile-web-app-status-bar-style',
            content: '#000',
          },
          {tagName: 'link', rel: 'apple-touch-icon', href: '/img/apple-touch-icon-180x180.png'},
          {tagName: 'link', rel: 'mask-icon', href: '/img/logo-icon.svg', color: '#FFC933'},
        ],
      },
    ],
    // Per-page Open Graph images, generated at build time. Best-effort:
    // never breaks the build. Remove this line to disable.
    './plugins/og-image',
  ],

  themes: [
    [
      '@easyops-cn/docusaurus-search-local',
      {
        indexDocs: true,
        indexBlog: false,
        indexPages: true,
        docsRouteBasePath: ['docs', 'cheatsheets'],
      },
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/og-image.png',
      metadata: [
        {name: 'twitter:card', content: 'summary_large_image'},
        {property: 'og:type', content: 'website'},
        // Google Search Console verification: not set up yet. Add it later via a
        // DNS TXT record at the registrar, or re-add a
        // {name: 'google-site-verification', content: '<token>'} entry here.
      ],
      colorMode: {
        defaultMode: 'dark',
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'docssheet',
        logo: {
          alt: 'docssheet logo',
          src: 'img/logo-icon.svg',
        },
        items: [
          {type: 'docSidebar', sidebarId: 'docs', label: 'Docs', position: 'left'},
          {type: 'docSidebar', docsPluginId: 'cheatsheets', sidebarId: 'cheatsheets', label: 'Cheat Sheets', position: 'left'},
          // Right side of the navbar is just the (wide) search bar + the theme
          // toggle — layout/ordering handled in src/css/custom.css.
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Content',
            items: [
              {label: 'Docs', to: '/docs/intro'},
              {label: 'Cheat Sheets', to: '/cheatsheets'},
            ],
          },
          {
            title: 'Site',
            items: [
              {label: 'About', to: '/about'},
              {label: 'Contact', to: '/contact'},
              {label: 'GitHub', href: 'https://github.com/abhishekgupta1'},
            ],
          },
          {
            title: 'Legal',
            items: [
              {label: 'Privacy Policy', to: '/privacy'},
              {label: 'Terms of Service', to: '/terms'},
              {label: 'Cookie Policy', to: '/cookie-policy'},
              {label: 'Disclaimer', to: '/disclaimer'},
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} docssheet. Content is original work; third-party names and trademarks belong to their owners.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
