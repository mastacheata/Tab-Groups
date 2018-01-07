import createStore from 'redux/es/createStore'

import App, { init } from './store/reducers.mjs'
import { getTabGroupsPersistState } from './store/helpers.mjs'
import {
  bindBrowserEvents,
  loadBrowserState,
  setWindowTabGroupsState,
} from './integrations/index.mjs'

function onError( error ) {
  console.error( error )
}

const store_promise = loadBrowserState()
  .then(
    ( browser_state ) => {
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
    }
  ).catch( ( err ) => {
    onError( err )
    return Promise.reject( err )
  })

window.getStore = function() {
  return store_promise
}
