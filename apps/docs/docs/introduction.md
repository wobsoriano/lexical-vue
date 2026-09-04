# Introduction

lexical-vue is a set of components and composables for using [Lexical](https://lexical.dev), Meta's text editor framework, in Vue 3. It is the Vue counterpart to [@lexical/react](https://github.com/facebook/lexical/tree/main/packages/lexical-react).

Lexical itself is framework agnostic. This package owns the Vue side of it. It creates the editor and keeps it alive for as long as your component is mounted, lets any component inside reach that editor without passing it down through props, renders embedded content like images and videos as ordinary Vue components, and hands you editor state as refs you can watch.

## Learning Lexical

Everything about Lexical itself is documented at lexical.dev, and all of it applies here. Read those pages rather than looking for a Vue-flavoured version.

- [What Lexical is and what you can build with it](https://lexical.dev/docs/intro)
- [Editor state](https://lexical.dev/docs/concepts/editor-state), the immutable data model behind the editor
- [Updates](https://lexical.dev/docs/concepts/updates), and why editor changes go through `editor.update()`
- [Listeners, transforms and commands](https://lexical.dev/docs/concepts/listeners), the register APIs
- [Serialization](https://lexical.dev/docs/serialization/serialization) for saving and loading content

Two things carry over into Vue in a way worth knowing up front. You rarely call `createEditor()` yourself, since `LexicalComposer` and `LexicalExtensionComposer` do it for you. And `$` prefixed functions only work inside an `editor.update()` or `editor.read()` callback, which is a similar idea to composables only working during `setup`, except `$` functions can be called in any order.

## Where to start

- [Usage](./getting-started/usage) builds a working editor from scratch.
- [Theming](./getting-started/theming) covers styling the editor's nodes.
- [Available plugins](./plugins/available) lists the components this package ships.
- [Extensions](./extensions/introduction) covers Lexical's extension system, which is the newer way to compose editor behaviour.
