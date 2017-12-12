import createStore from 'redux/es/createStore'

import App, { init, default_config } from './store/reducers.mjs'
import {
  addWindow,
  removeWindow,
  activateTab,
  addTab,
  removeTab,
  updateTab,
  moveTab,
  attachTab,
  detachTab,
  startSearch,
  finishSearch,
} from './store/actions.mjs'
import { getTabGroupsPersistState } from './store/helpers.mjs'
import { LOCAL_CONFIG_KEY, WINDOW_TAB_GROUPS_KEY } from './store/session-keys.mjs'
import { updateConfig } from './store/actions.mjs';

function onError( error ) {
  console.error( error )
}

window.store = new Promise( ( resolve, reject ) => {
  // This would be required for integration with other extensions
  // browser.runtime.onMessage.addListener( ( message, sender, sendResponse ) => {
  //   console.info('runtime.onMessage', message, sender, sendResponse)
  // })

  const window_ids = []
  let config, tabs

  Promise.all([
    browser.storage.local.get( LOCAL_CONFIG_KEY ),
    browser.tabs.query( {} )
  ]).then(
    ( [ storage, _tabs ] ) => {
      config = storage[ LOCAL_CONFIG_KEY ] || default_config
      tabs = _tabs

      let window_tab_groups = []
      tabs.forEach( ( tab ) => {
        if( window_ids.indexOf( tab.windowId ) === -1 ) {
          window_ids.push( tab.windowId )
          window_tab_groups.push( browser.sessions.getWindowValue( tab.windowId, WINDOW_TAB_GROUPS_KEY ) )
        }
      })

      return Promise.all( window_tab_groups )
    }
  ).then(
    ( window_tab_groups ) => {
      const window_tab_groups_map = new Map()
      for( let i = 0; i < window_ids.length; i++ ) {
        window_tab_groups_map.set( window_ids[ i ], window_tab_groups[ i ] )
      }

      const initial_state = init( null, { config, tabs, window_tab_groups_map } )
      const store = createStore( App, initial_state )

      browser.storage.onChanged.addListener( ( changes, area ) => {
        console.info('storage.onChanged', area, changes)
        if( area === 'local' && changes[ LOCAL_CONFIG_KEY ] ) {
          store.dispatch( updateConfig( changes[ LOCAL_CONFIG_KEY ].newValue || default_config ) )
        }
      })

      // Attach listeners for changes to windows

      browser.windows.onCreated.addListener( ( window ) => {
        console.info('windows.onCreated', window)
        if( window.type === 'normal' ) {
          store.dispatch( addWindow( window ) )
        }
      })

      browser.windows.onRemoved.addListener( ( window_id ) => {
        console.info('windows.onRemoved', window_id)
        store.dispatch( removeWindow( window_id ) )
      })

      // Attach listeners for changes to tabs

      browser.tabs.onActivated.addListener( ( { tabId, windowId } ) => {
        // @todo can start process to capture image here
        // tabs.captureVisibleTab()
        console.info('tabs.onActivated', tabId, windowId)
        store.dispatch( activateTab( tabId, windowId ) )
      })

      browser.tabs.onCreated.addListener( ( tab ) => {
        console.info('tabs.onCreated', tab)
        store.dispatch( addTab( tab ) )
      })

      browser.tabs.onRemoved.addListener( ( tab_id, { windowId, isWindowClosing } ) => {
        console.info('tabs.onRemoved', tab_id, windowId)
        store.dispatch( removeTab( tab_id, windowId ) )
      })

      browser.tabs.onMoved.addListener( ( tab_id, { windowId, fromIndex, toIndex } ) => {
        console.info('tabs.onMoved', tab_id, windowId, fromIndex, toIndex)
        store.dispatch( moveTab( tab_id, windowId, toIndex ) )
      })

      browser.tabs.onAttached.addListener( ( tab_id, { newWindowId, newPosition } ) => {
        console.info('tabs.onAttached', tab_id, newWindowId, newPosition)
        store.dispatch( attachTab( tab_id, newWindowId, newPosition ) )
      })

      browser.tabs.onDetached.addListener( ( tab_id, { oldWindowId, oldPosition } ) => {
        console.info('tabs.onDetached', tab_id, oldWindowId, oldPosition)
        store.dispatch( detachTab( tab_id, oldWindowId, oldPosition ) )
      })

      browser.tabs.onReplaced.addListener( ( added_tab_id, removed_tab_id ) => {
        console.info('tabs.onReplaced', added_tab_id, removed_tab_id)
        // @todo
      })

      browser.tabs.onUpdated.addListener( ( tab_id, change_info, tab ) => {
        console.info('tabs.onUpdated', tab_id, change_info, tab)
        store.dispatch( updateTab( tab, change_info ) )
      })

      window.runSearch = ( window_id, search_text ) => {
        console.info('runSearch', window_id, search_text)
        const state = store.getState()
        const window = state.windows.find( window => window.id === window_id )

        if( ! window ) {
          // @todo error
          return
        }

        // Update the store with the search
        store.dispatch( startSearch( window_id, search_text ) )

        const search_tabs = []
        const matching_tab_ids = []

        window.tab_groups.forEach( tab_group => {
          tab_group.tabs.forEach( tab => {
            search_tabs.push( browser.find.find( search_text, { tabId: tab.id } )
              .then(
                ( { count } ) => {
                  if( count > 0 ) {
                    matching_tab_ids.push( tab.id )
                  }
                },
                ( err ) => {
                  // @todo handle error
                }
              )
            )
          })
        })

        Promise.all( search_tabs )
          .then(
            () => {
              console.info('finished', search_text, matching_tab_ids)
              store.dispatch( finishSearch( window_id, search_text, matching_tab_ids ) )
            }
          )
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

      return resolve( store )
    }
  ).catch( ( err ) => {
    onError( err )
    return reject( err )
  })
})
