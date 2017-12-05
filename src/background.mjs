import { createStore } from 'redux'

import App, { init } from './store/reducers.mjs'
import {
  activateTab,
  addTab,
  removeTab,
  updateTab,
  moveTab,
  attachTab,
  detachTab,
} from './store/actions.mjs'

window.process = { env: { NODE_ENV: 'production' } }

function onError( error ) {
  console.error( error )
}

const TAB_GROUP_ID_SESSION_KEY = 'tab_group_id'
const WINDOW_ACTIVE_GROUP_ID_SESSION_KEY = 'active_tab_group_id'

window.store = new Promise( ( resolve, reject ) => {
  let store = null

  // browser.windows.getAll( { populate: true, windowTypes: [ 'normal' ] } )
  //   .then(
  //     ( windows ) => {
  //       console.info('windows', windows)
  //     },
  //     onError
  //   )

  browser.storage.onChanged.addListener( ( changes, area ) => {
    console.info('storage.onChanged', area, changes)
  })

  // Clear the storage
  // browser.storage.local.clear()

  browser.storage.local.get( null )
    .then(
      ( results ) => {
        console.info('storage.local.get', results)
      },
      onError
    )

  browser.tabs.onActivated.addListener( ( { tabId, windowId } ) => {
    // @todo can start process to capture image here
    // tabs.captureVisibleTab()
    console.info('tabs.onActivated', tabId, windowId)
    if( store ) {
      store.dispatch( activateTab( tabId, windowId ) )
    }
  })

  // Attach listeners for changes to tabs

  browser.tabs.onCreated.addListener( ( tab ) => {
    console.info('tabs.onCreated', tab)
    if( store ) {
      store.dispatch( addTab( tab ) )
    }
  })

  browser.tabs.onRemoved.addListener( ( tab_id, { windowId, isWindowClosing } ) => {
    console.info('tabs.onRemoved', tab_id, windowId)
    if( store ) {
      store.dispatch( removeTab( tab_id, windowId ) )
    }
  })

  browser.tabs.onMoved.addListener( ( tab_id, { windowId, fromIndex, toIndex } ) => {
    console.info('tabs.onMoved', tab_id, windowId, fromIndex, toIndex)
    if( store ) {
      store.dispatch( moveTab( tab_id, windowId, toIndex ) )
    }
  })

  browser.tabs.onAttached.addListener( ( tab_id, { newWindowId, newPosition } ) => {
    console.info('tabs.onAttached', tab_id, newWindowId, newPosition)
    if( store ) {
      store.dispatch( attachTab( tab_id, newWindowId, newPosition ) )
    }
  })

  browser.tabs.onDetached.addListener( ( tab_id, { oldWindowId, oldPosition } ) => {
    console.info('tabs.onDetached', tab_id, oldWindowId, oldPosition)
    if( store ) {
      store.dispatch( detachTab( tab_id, oldWindowId, oldPosition ) )
    }
  })

  browser.tabs.onReplaced.addListener( ( added_tab_id, removed_tab_id ) => {
    console.info('tabs.onReplaced', added_tab_id, removed_tab_id)
    if( store ) {
      // @todo
    }
  })

  browser.tabs.onUpdated.addListener( ( tab_id, change_info, tab ) => {
    console.info('tabs.onUpdated', tab_id, change_info, tab)
    if( store ) {
      store.dispatch( updateTab( tab, change_info ) )
    }
  })

  // @todo use browser.sessions.setTabValue( tab_id, key, value ) to store

  // @todo add webNavigation permission if this is required
  // browser.webNavigation.onCompleted.addListener( ( event ) => {
  //   // Filter out any sub-frame related navigation event
  //   if( event.frameId !== 0 ) {
  //     return
  //   }

  //   const url = new URL( event.url )
  //   console.info('webNavigation.onCompleted', event)
  // })

  // This would be required for integration with other extensions
  // browser.runtime.onMessage.addListener( ( message, sender, sendResponse ) => {
  //   console.info('runtime.onMessage', message, sender, sendResponse)
  // })

  let tab_groups = []
  let tab_group_ids = []
  let window_active_tab_group_ids = []
  const window_ids = []

  // @todo document structure for storage.local.tab_groups?

  let tabs

  Promise.all([
    browser.storage.local.get( [ 'tab_groups' ] ),
    browser.tabs.query( {} )
  ]).then(
    ( [ storage_values, _tabs ] ) => {
      if( storage_values.tab_groups ) {
        tab_groups = storage_values.tab_groups
        console.info('tab_groups', tab_groups)
      }

      tabs = _tabs
      console.info('tabs', tabs)

      tabs.forEach( ( tab ) => {
        tab_group_ids.push( browser.sessions.getTabValue( tab.id, TAB_GROUP_ID_SESSION_KEY ) )
        if( window_ids.indexOf( tab.windowId ) === -1 ) {
          window_ids.push( tab.windowId )
          window_active_tab_group_ids.push( browser.sessions.getWindowValue( tab.windowId, WINDOW_ACTIVE_GROUP_ID_SESSION_KEY ) )
        }
      })

      return Promise.all( [ Promise.all( tab_group_ids ), Promise.all( window_active_tab_group_ids ) ] )
    }
  ).then(
    ( [ tab_group_ids, window_active_tab_group_ids ] ) => {
      console.info('tab_group_ids', tab_group_ids)
      console.info('window_active_tab_group_ids', window_active_tab_group_ids)

      // @todo populate maps
      const tab_group_id_map = new Map()
      const window_active_tab_group_id_map = new Map()

      const initial_state = init( null, { tabs, tab_groups, tab_group_id_map, window_active_tab_group_id_map } )

      store = createStore( App, initial_state )

      // browser.storage.local.set( { state } )
      resolve( store )
    }
  ).catch( ( err ) => {
    console.error( 'error', err )
    reject( err )
  })

  // @todo load from storage
  // @todo sync changes
})
