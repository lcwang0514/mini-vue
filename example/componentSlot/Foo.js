import { h, renderSlots } from '../../lib/guide-mini-vue.esm.js'
export const Foo = {
  name: "Foo",
  setup() {
    return {

    }
  },

  render() {
    const foo = h("p", {}, "foo")
    console.log(this.$slots)
    // 具名插槽
    return h("div", {}, [foo, renderSlots(this.$slots, "header", { age: 18 }), foo, renderSlots(this.$slots, "footer")])
  },
}