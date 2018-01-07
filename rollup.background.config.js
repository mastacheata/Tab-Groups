// @todo most of this isn't required, can be cleaned up
import async from 'rollup-plugin-async'
import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
// import typescript from 'rollup-plugin-typescript';

let plugins = [
  // typescript(),
  async(),
  nodeResolve({
    jsnext: true,
    main: true,
    browser: true
  }),
  commonjs()
]

let config = {
  input: './src/background.mjs',
  output: {
    file: './dist/background.js',
    format: 'umd',
    sourcemap: true,
  },
  plugins: plugins
}

export default config
