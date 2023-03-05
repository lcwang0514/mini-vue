module.exports = {
  presets: [["@babel/preset-env", {
    targets: {
      node: "current" // 以当前node版本做转换
    }
  }],
    "@babel/preset-typescript"
  ]
}