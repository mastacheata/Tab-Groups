// ES load breaks in node.js, need to bootstrap
const redux = require('redux')
import { createStore } from './store/redux-slim.mjs'

module.exports = redux.createStore
