// @todo most of this isn't required, can be cleaned up
import async from 'rollup-plugin-async'
import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import uglify from 'rollup-plugin-uglify'
import livereload from 'rollup-plugin-livereload'
import serve from 'rollup-plugin-serve'
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
    format: 'umd'
  },
  sourcemap: true,
  plugins: plugins
}

const isProduction = ( process.env.NODE_ENV === `production` )
const isDevelopment = ( process.env.NODE_ENV === `development` )

if( isProduction ) {
  config.sourcemap = false
  config.plugins.push( uglify() )
}

if( isDevelopment ) {
  config.plugins.push( livereload() )
  config.plugins.push( serve({
    contentBase: './dist/',
    port: 8080,
    open: true
  }))
}

export default config
