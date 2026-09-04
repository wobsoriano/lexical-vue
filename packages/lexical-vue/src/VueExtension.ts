import type { Component, VNode } from 'vue'
import { declarePeerDependency, defineExtension, shallowMergeConfig } from '@lexical/extension'
import invariant from 'tiny-invariant'

/**
 * Anything an extension can contribute as UI.
 *
 * A vnode when the contribution needs props (`h(Panel, { limit: 5 })`), a
 * component otherwise. A Vue functional component is `(props) => VNode`, so
 * `() => h(Panel)` is a component too, and is how an author gets a fresh vnode
 * per editor rather than one shared across every editor in the app.
 */
export type VueRenderable = VNode | Component

export interface VueConfig {
  /**
   * The editor's editable region, rendered first by `LexicalExtensionComposer`.
   *
   * `null` by default, unlike `@lexical/react`, because the shipped Vue idiom
   * puts `<ContentEditable />` in the composer's default slot and rendering both
   * would install two root elements. Set it from an extension that owns its own
   * editable, such as a nested editor.
   *
   * The composer's `contentEditable` slot overrides this.
   */
  contentEditable: VueRenderable | null

  /**
   * UI rendered inside the editor's context with no fixed position in the
   * document, such as floating toolbars, portals, or components that register
   * behavior and render nothing.
   *
   * Merged by concatenation, so every `configExtension(VueExtension, ...)` in
   * the graph contributes rather than overwriting.
   */
  decorators: readonly VueRenderable[]
}

/**
 * Declares that a Vue host will render this editor's UI. `LexicalExtensionComposer`
 * always includes it. It is a marker with no config, no build, and no behavior,
 * so {@link VueExtension} can peer-depend on it without depending on the composer.
 */
export const VueProviderExtension = defineExtension({
  name: 'lexical-vue/VueProvider',
})

const initialConfig: VueConfig = { contentEditable: null, decorators: [] }

/**
 * The channel through which an extension contributes Vue UI to an editor.
 * Depend on it with `configExtension(VueExtension, { decorators: [...] })`.
 */
export const VueExtension = defineExtension({
  name: 'lexical-vue/Vue',
  config: initialConfig,
  peerDependencies: [declarePeerDependency<typeof VueProviderExtension>(VueProviderExtension.name)],
  mergeConfig(a, b) {
    const config = shallowMergeConfig(a, b)
    if (b.decorators) {
      config.decorators = [...a.decorators, ...b.decorators]
    }
    return config
  },
  // `init` rather than `build`, because it runs before the editor is
  // constructed, so a headless misuse fails before there is an editor to leak.
  // `getPeer` resolves this early only because a peer declaration adds a build
  // graph edge, so the provider is always initialized before this runs.
  init(_editorConfig, _config, state) {
    if (!state.getPeer<typeof VueProviderExtension>(VueProviderExtension.name)) {
      const dependents = [...state.getDirectDependentNames()].join(' ')
      invariant(
        false,
        `VueExtension: no VueProviderExtension in this editor. Host it with LexicalExtensionComposer. Extensions that depend on VueExtension: ${dependents}`,
      )
    }
  },
})
