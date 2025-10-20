import { ref } from 'vue'
import type { Doc } from 'yjs'

export interface CollaborationContextType {
  clientID: number
  color: string
  isCollabActive: boolean
  name: string
  yjsDocMap: Map<string, Doc>
}

const entries = [
  ['Cat', 'rgb(125, 50, 0)'],
  ['Dog', 'rgb(100, 0, 0)'],
  ['Rabbit', 'rgb(150, 0, 0)'],
  ['Frog', 'rgb(200, 0, 0)'],
  ['Fox', 'rgb(200, 75, 0)'],
  ['Hedgehog', 'rgb(0, 75, 0)'],
  ['Pigeon', 'rgb(0, 125, 0)'],
  ['Squirrel', 'rgb(75, 100, 0)'],
  ['Bear', 'rgb(125, 100, 0)'],
  ['Tiger', 'rgb(0, 0, 150)'],
  ['Leopard', 'rgb(0, 0, 200)'],
  ['Zebra', 'rgb(0, 0, 250)'],
  ['Wolf', 'rgb(0, 100, 150)'],
  ['Owl', 'rgb(0, 100, 100)'],
  ['Gull', 'rgb(100, 0, 100)'],
  ['Squid', 'rgb(150, 0, 150)'],
]

const randomEntry = entries[Math.floor(Math.random() * entries.length)]

export default ref<CollaborationContextType>({
  clientID: 0,
  color: randomEntry[1],
  isCollabActive: false,
  name: randomEntry[0],
  yjsDocMap: new Map(),
})
