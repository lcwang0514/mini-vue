
import { h } from '../../lib/guide-mini-vue.esm.js'
export const App = {
  render() {
    // ui
    return h("div", {
      id: "root",
      class: ["red", "hard"]
    },
      // "hi mini-vue"
      [h("p", { class: "re11" }, 'ji'), h("p", { class: "blue" }, 'mini')]
    )
  },
  setup() {
    // composition api
    return {
      msg: "vue"
    }
  }
}