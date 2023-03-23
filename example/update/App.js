import { h, ref } from "../../lib/guide-mini-vue.esm.js"

export const App = {
  name: 'App',
  setup() {
    const count = ref(0)
    const onClick = () => {
      count.value++
    }

    const props = ref({
      foo: "foo",
      bar: "bar"
    })

    const onChangePropsDemo1 = () => {
      props.value.foo = "New-foo"
    }


    const onChangePropsDemo2 = () => {
      props.value.foo = undefined
    }


    const onChangePropsDemo3 = () => {
      props.value = {
        foo: "foo"
      }
    }

    return {
      count,
      onClick,
      props,
      onChangePropsDemo1,
      onChangePropsDemo2,
      onChangePropsDemo3,
    }
  },
  render() {
    return h(
      "div",
      {
        id: "root",
        ...this.props
      },
      [
        h("div", {}, "count:" + this.count),// 依赖收集
        h(
          "button",
          {
            onClick: this.onClick
          },
          "click"
        ),
        h(
          "button",
          {
            onClick: this.onChangePropsDemo1
          },
          "changeProps 值 -修改"
        ),

        h(
          "button",
          {
            onClick: this.onChangePropsDemo2
          },
          "changeProps 值 -undefined"
        ),
        h(
          "button",
          {
            onClick: this.onChangePropsDemo3
          },
          "changeProps 值 -属性删除"
        ),
      ]
    )
  }
}