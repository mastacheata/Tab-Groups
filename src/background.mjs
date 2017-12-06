import { createStore } from 'redux'

import App, { init } from './store/reducers.mjs'
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
} from './store/actions.mjs'
import {
  getTabGroupsPersistState
} from './store/helpers.mjs'

window.process = { env: { NODE_ENV: 'production' } }

function onError( error ) {
  console.error( error )
}

const WINDOW_TAB_GROUPS_KEY = 'tab_groups'

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

  // Attach listeners for changes to windows

  browser.windows.onCreated.addListener( ( window ) => {
    console.info('windows.onCreated', window)
    if( store && window.type === 'normal' ) {
      store.dispatch( addWindow( window ) )
    }
  })

  browser.windows.onRemoved.addListener( ( window_id ) => {
    console.info('windows.onRemoved', window_id)
    if( store ) {
      store.dispatch( removeWindow( window_id ) )
    }
  })

  browser.windows.onFocusChanged.addListener( ( window_id ) => {
    console.info('windows.onFocusChanged', window_id)
  })

  // Attach listeners for changes to tabs

  browser.tabs.onActivated.addListener( ( { tabId, windowId } ) => {
    // @todo can start process to capture image here
    // tabs.captureVisibleTab()
    console.info('tabs.onActivated', tabId, windowId)
    if( store ) {
      store.dispatch( activateTab( tabId, windowId ) )
    }
  })

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
  const window_ids = []

  let tabs

  Promise.all([
    browser.tabs.query( {} )
  ]).then(
    ( [ _tabs ] ) => {
      tabs = _tabs
      console.info('tabs', tabs)

      let window_tab_groups = []
      tabs.forEach( ( tab ) => {
        if( window_ids.indexOf( tab.windowId ) === -1 ) {
          window_ids.push( tab.windowId )
          window_tab_groups.push( browser.sessions.getWindowValue( tab.windowId, WINDOW_TAB_GROUPS_KEY ) )
        }
      })

      return Promise.all( [ Promise.all( window_tab_groups ) ] )
    }
  ).then(
    ( [ window_tab_groups ] ) => {
      console.info('window_tab_groups', window_tab_groups)

      const window_tab_groups_map = new Map()
      for( let i = 0; i < window_ids.length; i++ ) {
        window_tab_groups_map.set( window_ids[ i ], window_tab_groups[ i ] )
      }

      const initial_state = init( null, { tabs, window_tab_groups_map } )

      store = createStore( App, initial_state )

      let last_state = initial_state
      store.subscribe( () => {
        const state = store.getState()
        console.info('syncing to persist', state)

        for( let i = 0; i < state.windows.length; i++ ) {
          console.info('checking window', state.windows[ i ].id)
          let saved_tab_groups_state = window_tab_groups_map.get( state.windows[ i ].id )
          let new_tab_groups_state = getTabGroupsPersistState( state.windows[ i ] )
          if( JSON.stringify( saved_tab_groups_state ) != JSON.stringify( new_tab_groups_state ) ) {
            console.info('change detected')
            console.info('saved_tab_groups_state', saved_tab_groups_state)
            console.info('new_tab_groups_state', new_tab_groups_state)

            // Write state to map cache and session
            window_tab_groups_map.set( state.windows[ i ].id, new_tab_groups_state )
            browser.sessions.setWindowValue( state.windows[ i ].id, WINDOW_TAB_GROUPS_KEY, new_tab_groups_state )
          }
        }
      })

      // browser.storage.local.set( { state } )
      resolve( store )
    }
  ).catch( ( err ) => {
    console.error( 'error', err )
    reject( err )
  })
})
