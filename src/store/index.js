import Vue from 'vue'
import Vuex from 'vuex'
import * as mutations from './mutations'

Vue.use( Vuex )

const debug = ( process.env.NODE_ENV !== 'production' )

const state = {
  tab_groups: [
    /*
    {
      id,
      name,
      active_tab_id,
      tabs,
    }
    */
  ],
  windows: [
    /*
    active_tab_group_id,
    tab_groups: [
      { id }
    ]
    */
  ]
};

export default new Vuex.Store({
  state,
  mutations,
  strict: debug
})
