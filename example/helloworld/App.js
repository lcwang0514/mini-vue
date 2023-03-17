
import { h } from '../../lib/guide-mini-vue.esm.js'

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
      "hi mini-vue" + this.msg
      // [h("p", { class: "re11" }, 'ji'), h("p", { class: "blue" }, 'mini')]
    )
  },
  setup() {
    // composition api
    return {
      msg: "----vue"
    }
  }
}