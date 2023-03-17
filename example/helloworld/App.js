
import { h } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './Foo.js'

window.self = null
export const App = {
  render() {

    window.self = this
    // ui
    return h("div", {
      id: "root",
      class: ["red", "hard"],
      onClick() {
        console.log("click")
      },
      onMousedown() {
        console.log("mousedown")
      }
    },
      // "hi mini-vue" + this.msg
      // [h("p", { class: "re11" }, 'ji'), h("p", { class: "blue" }, 'mini')]
      [h('div', {}, 'hi' + this.msg), h(Foo, { count: 1 })]
    )
  },
  setup() {
    // composition api
    return {
      msg: "----vue"
    }
  }
}