import { computed, ref } from 'vue'
import { useCharacterLimit, useLexicalComposer } from './composables'

export function LexicalCharacterLimitPlugin() {
  const editor = useLexicalComposer()

  const charset = vineProp.withDefault<'UTF-8' | 'UTF-16'>('UTF-16')
  const maxLength = vineProp.withDefault(5)

  let textEncoderInstance: TextEncoder | null = null

  function textEncoder(): null | TextEncoder {
    if (window.TextEncoder === undefined)
      return null

    if (textEncoderInstance === null)
      textEncoderInstance = new window.TextEncoder()

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

  const remainingCharacters = ref(maxLength.value)
  function setRemainingCharacters(payload: number) {
    remainingCharacters.value = payload
  }

  const characterLimitProps = computed(
    () => ({
      remainingCharacters: setRemainingCharacters,
      strlen: (text: string) => {
        if (charset.value === 'UTF-8')
          return utf8Length(text)

        else if (charset.value === 'UTF-16')
          return text.length

        else
          throw new Error('Unrecognized charset')
      },
    }),
  )

  useCharacterLimit(
    editor,
    maxLength,
    characterLimitProps,
  )

  vineSlots<{
    default: (props: { remainingCharacters: number }) => any
  }>()

  return vine`
    <slot :remaining-characters="remainingCharacters">
      <span
        :class="[
          'characters-limit',
          remainingCharacters < 0 ? 'characters-limit-exceeded' : ''
        ]"
      >
        {{ remainingCharacters }}
      </span>
    </slot>
  `
}
