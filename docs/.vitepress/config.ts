import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'en-US',
  title: 'Lexical Vue',
  description: 'Lexical components and composables for Vue applications.',
  lastUpdated: true,

  themeConfig: {
    repo: 'wobsoriano/lexical-vue',
    docsDir: 'docs',
    editLinks: true,
    editLinkText: 'Edit this page on GitHub',
    lastUpdated: 'Last Updated',
    nav: [
      { text: 'Guide', link: '/', activeMatch: '^/$|^/guide/' },
      { text: 'Playground', link: 'https://lexical-vue-playground.vercel.app' },
    ],
    sidebar: {
      '/guide/': getGuideSidebar(),
      '/': getGuideSidebar(),
    },
  },
})

function getGuideSidebar() {
  return [
    {
      text: 'Introduction',
      children: [
        { text: 'What is Lexical Vue?', link: '/' },
        { text: 'Getting Started', link: '/guide/getting-started' },
      ],
    },
    {
      text: 'Plugins',
      children: [
        { text: 'Available Plugins', link: '/plugins' },
      ],
    },
  ]
}
