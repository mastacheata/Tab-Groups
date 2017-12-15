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
  updateConfig,
} from './actions.mjs'
import { default_config } from './reducers.mjs'
import { LOCAL_CONFIG_KEY, WINDOW_TAB_GROUPS_KEY } from './session-keys.mjs'

/**
 * Bind change events for the browser to dispatch operations on the store
 * @param browser The browser global, passed for testing
 * @param store The redux store
 */
export function bindBrowserEvents( browser, store ) {
  // @todo need way to turn of console

  // This would be required for integration with other extensions
  // browser.runtime.onMessage.addListener( ( message, sender, sendResponse ) => {
  //   console.info('runtime.onMessage', message, sender, sendResponse)
  // })

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
}

/**
 * Load the state of the browser to structure for reducers/init
 * @param browser The browser global, passed for testing
 */
export function loadBrowserState( browser ) {
  const window_ids = []
  let config, tabs

  return Promise.all([
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
      // This is the same structure from reducers.init
      return { config, tabs, window_tab_groups_map }
    }
  )
}

/**
 * Run a text search for tabs in a window and dispatch start and finish to the store
 * @param browser
 * @param store
 * @param window_id
 * @param search_text
 */
export function runSearch( browser, store, window_id, search_text ) {
  console.info('runSearch', window_id, search_text)
  const state = store.getState()
  const window = state.windows.find( _window => _window.id === window_id )

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

  return Promise.all( search_tabs )
    .then(
      () => {
        console.info('finished', search_text, matching_tab_ids)
        store.dispatch( finishSearch( window_id, search_text, matching_tab_ids ) )
      }
    )
}
