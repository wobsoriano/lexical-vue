import type { PropType, SlotsType } from 'vue'
import { computed, defineComponent, ref } from 'vue'
import { useLexicalComposer } from './LexicalComposer'
import { useCharacterLimit } from './shared/useCharacterLimit'

export const CharacterLimitPlugin = defineComponent(
  (
    props: { charset: 'UTF-8' | 'UTF-16'; maxLength: number },
    ctx: { slots: { default?: (props: { remainingCharacters: number }) => any } },
  ) => {
    const editor = useLexicalComposer()

    let textEncoderInstance: TextEncoder | null = null

    function textEncoder(): null | TextEncoder {
      if (window.TextEncoder === undefined) return null

      if (textEncoderInstance === null) textEncoderInstance = new window.TextEncoder()

      return textEncoderInstance
    }

    function utf8Length(text: string) {
      const currentTextEncoder = textEncoder()

      if (currentTextEncoder === null) {
        // http://stackoverflow.com/a/5515960/210370
        const m = encodeURIComponent(text).match(/%[89AB]/gi)
        return text.length + (m ? m.length : 0)
      }

      return currentTextEncoder.encode(text).length
    }

    const remainingCharacters = ref(props.maxLength)
    function setRemainingCharacters(payload: number) {
      remainingCharacters.value = payload
    }

    const characterLimitProps = computed(() => ({
      remainingCharacters: setRemainingCharacters,
      strlen: (text: string) => {
        if (props.charset === 'UTF-8') return utf8Length(text)
        else if (props.charset === 'UTF-16') return text.length
        else throw new Error('Unrecognized charset')
      },
    }))

    useCharacterLimit(editor, () => props.maxLength, characterLimitProps)

    return () =>
      ctx.slots.default?.({ remainingCharacters: remainingCharacters.value }) ?? (
        <span
          class={[
            'characters-limit',
            remainingCharacters.value < 0 ? 'characters-limit-exceeded' : '',
          ]}
        >
          {remainingCharacters.value}
        </span>
      )
  },
  {
    name: 'CharacterLimitPlugin',
    props: {
      charset: { type: String as PropType<'UTF-8' | 'UTF-16'>, default: 'UTF-16' },
      maxLength: { type: Number, default: 5 },
    },
    slots: Object as SlotsType<{ default: { remainingCharacters: number } }>,
  },
)
