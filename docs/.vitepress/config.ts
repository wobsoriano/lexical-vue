import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'en-US',
  title: 'lexical-vue',
  description: 'An extensible text editor for Vue.',
  lastUpdated: true,

  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/wobsoriano/lexical-vue' },
    ],
    lastUpdatedText: 'Last Updated',
    nav: [
      { text: 'Docs', link: '/docs/introduction', activeMatch: '/docs/' },
      { text: 'API', link: 'https://lexical.dev/docs/api/modules' },
      { text: 'Playground', link: 'https://lexical-vue-playground.vercel.app' },
      { text: 'Sponsor', link: 'https://github.com/sponsors/wobsoriano' },
    ],
    sidebar: {
      '/docs/': sidebarDocs(),
    },
    footer: {
      message: 'Released under the MIT License.',
    },
  },
})

function sidebarDocs() {
  return [
    { text: 'Introduction', link: '/docs/introduction' },
    {
      text: 'Getting Started',
      collapsed: false,
      items: [
        { text: 'Usage', link: '/docs/getting-started/usage' },
        { text: 'Theming', link: '/docs/getting-started/theming' },
      ],
    },
    { text: 'Concepts', link: 'https://lexical.dev/docs/concepts/editor-state' },
    {
      text: 'Plugins',
      collapsible: false,
      items: [
        { text: 'Available Plugins', link: '/docs/plugins/available' },
        { text: 'Custom', link: '/docs/plugins/custom' },
      ],
    },
  ]
}
