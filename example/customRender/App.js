
import { h } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './Foo.js'

export const App = {
  render() {

    return h("rect", { x: this.x, y: this.y })
  },
  setup() {
    // composition api
    return {
      x: 100,
      y: 100
    }
  }
}