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
      { text: 'Playground', link: 'https://lexical-vue-playground.vercel.app' },
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
      collapsible: true,
      items: [
        { text: 'Usage', link: '/docs/getting-started/usage' },
        { text: 'Theming', link: '/docs/getting-started/theming' },
      ],
    },
    {
      text: 'Plugins',
      collapsible: true,
      items: [
        { text: 'Available Plugins', link: '/docs/plugins/available' },
        { text: 'Custom', link: '/docs/plugins/custom' },
      ],
    },
  ]
}
