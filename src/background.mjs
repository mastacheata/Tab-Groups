import createStore from 'redux/es/createStore'

import App, { init } from './store/reducers.mjs'
import { getTabGroupsPersistState } from './store/helpers.mjs'
import { bindBrowserEvents, loadBrowserState, runSearch } from './store/integration.mjs'
import { WINDOW_TAB_GROUPS_KEY } from './store/session-keys.mjs'

function onError( error ) {
  console.error( error )
}

window.store = loadBrowserState( browser )
  .then(
    ( browser_state ) => {
      const { window_tab_groups_map } = browser_state
      const store = createStore( App, init( null, browser_state ) )

      bindBrowserEvents( browser, store )

      window.runSearch = ( window_id, search_text ) => {
        return runSearch( browser, store, window_id, search_text )
      }

      store.subscribe( () => {
        const state = store.getState()

        for( let i = 0; i < state.windows.length; i++ ) {
          let saved_tab_groups_state = window_tab_groups_map.get( state.windows[ i ].id )
          let new_tab_groups_state = getTabGroupsPersistState( state.windows[ i ] )
          if( JSON.stringify( saved_tab_groups_state ) != JSON.stringify( new_tab_groups_state ) ) {
            // Write state to map cache and session
            window_tab_groups_map.set( state.windows[ i ].id, new_tab_groups_state )
            browser.sessions.setWindowValue( state.windows[ i ].id, WINDOW_TAB_GROUPS_KEY, new_tab_groups_state )
          }
        }
      })

      return store
    }
  ).catch( ( err ) => {
    onError( err )
    return Promise.reject( err )
  })
