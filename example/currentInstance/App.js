import { h, getCurrentInstance } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './Foo.js'

export const App = {
  name: "App",
  render() {

    return h("div", {}, [h("p", {}, "currentinstance demo"), h(Foo)])
  },
  setup() {
    const instacne = getCurrentInstance()
    console.log("instacne", instacne);
    return {}
  }
}