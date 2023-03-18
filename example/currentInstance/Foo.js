import { h, getCurrentInstance } from '../../lib/guide-mini-vue.esm.js'
export const Foo = {
  name: "Foo",
  setup() {
    const instacne = getCurrentInstance()
    console.log("instacne", instacne);
    return {}
  },

  render() {
    return h("div", {}, 'foo')
  },
}