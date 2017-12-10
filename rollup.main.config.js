import alias from 'rollup-plugin-alias'
import vue from 'rollup-plugin-vue'
import buble from 'rollup-plugin-buble'
import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import nodeGlobals from 'rollup-plugin-node-globals'

let plugins = [
  alias({
    vue$: 'vue/dist/vue.common.js'
  }),
  vue({
    css: './dist/assets/css/app.css'
  }),
  buble({
    objectAssign: 'Object.assign',
    // target: { firefox: 57 },
    transforms: {
      arrow: false,
      conciseMethodProperty: false,
      destructuring: false,
      forOf: false,
      letConst: false,
      parameterDestructuring: false,
      templateString: false
    }
  }),
  nodeResolve({
    jsnext: true,
    main: true,
    browser: true
  }),
  commonjs(),
  nodeGlobals()
]

let config = {
  input: './src/main.mjs',
  output: {
    file: './dist/assets/js/app.js',
    format: 'umd'
  },
  sourcemap: true,
  plugins: plugins
}

export default config
