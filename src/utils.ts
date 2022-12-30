import type { Ref } from 'vue'
/**
 * Taken from https://github.com/piotrwitek/utility-types/blob/master/src/utility-types.ts#L158
 */
export type Class<T> = new (...args: any[]) => T

export type MaybeRef<T> = Ref<T> | T
