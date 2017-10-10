import Vue from 'vue'
import * as types from './mutation-types'

export default {
  [types.ADD_TAB] (state, { tab_group_id, tab }) {
    addTab( state, tab_group_id, tab )
  },
  [types.REMOVE_TAB] (state, { tab_group_id, tab }) {
    removeTab( state, tab_group_id, tab )
  }
}

function addTab( state, tab_group_id, tab ) {
  // @todo scan for tab group
  // @todo add tab to tab group
}

function removeTab( state, tab_group_id, tab ) {
  // @todo scan for tab group
  // @todo remove tab to tab group
}
