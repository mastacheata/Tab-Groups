import {
  ADD_TAB,
  REMOVE_TAB
} from './action-types.mjs'

import {
  addTab
} from './actions.mjs'

export default function App( state, action ) {
  switch( action.type ) {
    case ADD_TAB:
      return state;
    case REMOVE_TAB:
      return state;
    default:
      return state;
  }
}
