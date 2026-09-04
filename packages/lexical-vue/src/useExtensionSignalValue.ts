import type { ReadonlySignal } from '@lexical/extension'
import type { AnyLexicalExtension, LexicalExtensionOutput } from 'lexical'
import type { ShallowRef } from 'vue'
import { getCurrentScope, onScopeDispose, shallowReadonly, shallowRef } from 'vue'
import { useExtensionDependency } from './useExtensionDependency'

/**
 * Extracts the value type of a {@link ReadonlySignal}, or `never` for anything else.
 *
 * @example
 * ```ts
 * type Value = SignalValue<ReadonlySignal<number>> // number
 * ```
 */
export type SignalValue<S> = S extends ReadonlySignal<infer V> ? V : never

/**
 * Mirrors a signal into a Vue ref that updates whenever the signal changes.
 *
 * The ref is shallow, because signal values are Lexical objects such as
 * `EditorState` that must keep their identity rather than be wrapped in a deep
 * reactive proxy.
 *
 * The subscription is released by the active effect scope, so calling this in a
 * `setup` or inside `effectScope` needs no cleanup. Called with no active scope
 * the ref still tracks the signal, but nothing will ever unsubscribe it, so the
 * caller owns that lifetime.
 *
 * @param s - The signal to mirror
 * @returns A read-only ref holding the signal's current value
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { signal } from '@lexical/extension'
 * import { useSignalValue } from 'lexical-vue'
 *
 * const count = useSignalValue(signal(0))
 * </script>
 *
 * <template>
 *   <div>{{ count }}</div>
 * </template>
 * ```
 */
export function useSignalValue<V>(s: ReadonlySignal<V>): Readonly<ShallowRef<V>> {
  const value = shallowRef(s.peek())

  const unsubscribe = s.subscribe((next) => {
    value.value = next
  })

  if (getCurrentScope()) onScopeDispose(unsubscribe)

  return shallowReadonly(value)
}

/**
 * Mirrors a signal published by an extension's output into a Vue ref, combining
 * {@link useExtensionDependency} and {@link useSignalValue}.
 *
 * @param extension - The concrete extension reference used to build the editor
 * @param prop - The output property holding the signal
 * @returns A read-only ref holding the signal's current value
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useExtensionSignalValue } from 'lexical-vue'
 * import { MyExtension } from './MyExtension'
 *
 * const count = useExtensionSignalValue(MyExtension, 'count')
 * </script>
 * ```
 */
export function useExtensionSignalValue<
  Extension extends AnyLexicalExtension,
  K extends keyof LexicalExtensionOutput<Extension>,
>(
  extension: Extension,
  prop: K,
): Readonly<ShallowRef<SignalValue<LexicalExtensionOutput<Extension>[K]>>> {
  const signal = useExtensionDependency(extension).output[prop] as ReadonlySignal<
    SignalValue<LexicalExtensionOutput<Extension>[K]>
  >
  return useSignalValue(signal)
}
