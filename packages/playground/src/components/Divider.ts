import { defineComponent, h } from 'vue'

const Divider = defineComponent({
  render() {
    return h('div', {
      class: 'divider',
    })
  },
})

export default Divider
