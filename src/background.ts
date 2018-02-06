import createStore from 'redux/es/createStore'

import { initAction } from './store/actions'
import App, { init } from './store/reducers'
import { getTabGroupsPersistState } from './store/helpers'
import {
  bindBrowserEvents,
  loadBrowserState,
  setWindowTabGroupsState,
} from './integrations/index'

function onError( error ) {
  console.error( error )
}

const store_promise = loadBrowserState()
  .then( browser_state => {
    const { window_tab_groups_map } = browser_state
    const store = createStore( App, init( null, browser_state ) )

    bindBrowserEvents( store )

    store.subscribe( () => {
      const state = store.getState()

      for( let i = 0; i < state.windows.length; i++ ) {
        let saved_tab_groups_state = window_tab_groups_map.get( state.windows[ i ].id )
        let new_tab_groups_state = getTabGroupsPersistState( state.windows[ i ] )
        if( JSON.stringify( saved_tab_groups_state ) !== JSON.stringify( new_tab_groups_state ) ) {
          // Write state to map cache and session
          window_tab_groups_map.set( state.windows[ i ].id, new_tab_groups_state )
          setWindowTabGroupsState( state.windows[ i ].id, new_tab_groups_state )
        }
      }
    })

    return store
  }).catch( err => {
    onError( err )
    return Promise.reject( err )
  })

interface BackgroundWindow extends Window {
  syncState(): Promise<any>
  // @todo load type
  getStore(): Promise<any>
}

Object.assign( window, {
  /**
   * Load the store and browser_state to dispatch init with fresh data
   */
  syncState() {
    return Promise.all( [ (<BackgroundWindow>window).getStore(), loadBrowserState() ] )
      .then( ( [ store, browser_state ] ) => {
        store.dispatch( initAction( browser_state ) )
      })
  },
  getStore() {
    return store_promise
  }
})
