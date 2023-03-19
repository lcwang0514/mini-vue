import { h, provide, inject } from '../../lib/guide-mini-vue.esm.js'

const Provider = {
  name: 'Provider',
  setup() {
    provide("foo", "fooVal")
    provide("bar", "barVal")
  },
  render() {
    return h("div", {}, [h("p", {}, "provider"), h(Provider2)])
  }

}

const Provider2 = {
  name: 'Provider2',
  setup() {
    provide("foo", "fooval2")
    const foo = inject("foo")
    return {
      foo
    }
  },
  render() {
    return h("div", {}, [h("p", {}, `provider${this.foo}`), h(Consumer)])
  }

}

const Consumer = {
  name: "Consumer",
  setup() {
    const foo = inject("foo")
    const bar = inject("bar")
    const baz = inject("baz", () => "bazdefault")

    return {
      foo,
      bar,
      baz
    }
  },

  render() {
    return h("div", {}, `Consumer: - ${this.foo} - ${this.bar} -${this.baz}`)
  }
}

export default {
  name: "App",
  setup() { },
  render() {
    return h("div", {}, [h("p", {}, "appInject"), h(Provider)])
  }
}

