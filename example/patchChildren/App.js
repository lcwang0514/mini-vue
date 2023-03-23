import { h } from "../../lib/guide-mini-vue.esm.js"
import ArrayToText from "./ArrayToText.js"
import TextToText from "./TextToText.js"
import TextToArray from "./TextToArray.js"

export const App = {
  name: 'App',
  setup() {
  },
  render() {
    return h(
      "div",
      {
        tId: 1
      },
      [
        h("p", {}, "主业"),// 依赖收集
        // 数组到字符串
        // h(ArrayToText)
        // 字符串到字符串
        // h(TextToText)
        // 字符串到数组
        h(TextToArray)
      ]
    )
  }
}