import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'en-US',
  title: 'Lexical Vue',
  description: 'Lexical components and composables for Vue applications.',
  lastUpdated: true,

  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/wobsoriano/lexical-vue' },
    ],
    // repo: 'wobsoriano/lexical-vue',
    // docsDir: 'docs',
    // editLinks: true,
    // editLinkText: 'Edit this page on GitHub',
    lastUpdatedText: 'Last Updated',
    nav: [
      { text: 'Guide', link: '/', activeMatch: '^/$|^/guide/' },
      { text: 'Playground', link: 'https://lexical-vue-playground.vercel.app' },
    ],
    sidebar: {
      '/guide/': getGuideSidebar(),
      '/': getGuideSidebar(),
    },
    footer: {
      message: 'Released under the MIT License.',
    },
  },
})

function getGuideSidebar() {
  return [
    {
      text: 'Introduction',
      items: [
        { text: 'What is Lexical Vue?', link: '/' },
        { text: 'Getting Started', link: '/guide/getting-started' },
      ],
    },
    {
      text: 'Plugins',
      items: [
        { text: 'Available Plugins', link: '/plugins/available-plugins' },
        { text: 'Custom', link: '/plugins/custom' },
      ],
    },
  ]
}
