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
    {
      text: 'About',
      collapsible: true,
      items: [
        { text: 'Introduction', link: '/docs/introduction' },
        { text: 'Getting Started', link: '/docs/getting-started' },
      ],
    },
    {
      text: 'Plugins',
      collapsible: true,
      items: [
        { text: 'Available Plugins', link: '/docs/available-plugins' },
        { text: 'Custom', link: '/docs/custom' },
      ],
    },
  ]
}
