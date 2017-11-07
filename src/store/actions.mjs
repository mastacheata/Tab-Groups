import {
  ADD_TAB,
  REMOVE_TAB
} from './action-types.mjs'

export function addTab( tab_group_id, tab ) {
  return {
    type: ADD_TAB,
    tab_group_id,
    tab
  }
}
