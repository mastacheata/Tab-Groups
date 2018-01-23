import {
  addWindowAction,
  removeWindowAction,
  activateTabAction,
  addTabAction,
  removeTabAction,
  updateTabAction,
  updateTabImageAction,
  moveTabAction,
  moveTabToGroupAction,
  attachTabAction,
  detachTabAction,
  startSearchAction,
  finishSearchAction,
  updateConfigAction,
} from '../../store/actions.mjs'
import {
  findTab
} from '../../store/helpers.mjs'
import { default_config } from '../../store/reducers.mjs'

const LOCAL_CONFIG_KEY = 'config'
const WINDOW_TAB_GROUPS_KEY = 'tab_groups'
const TAB_PREVIEW_IMAGE_KEY = 'preview_image'

const TAB_PREVIEW_IMAGE_DETAILS = {
  format: 'png'
}

// LOCALIZATION

/**
 * Get a localized version of the message
 * @param message_name Key in the localizations file
 * @param substitutions
 */
export function getMessage( message_name, substitutions ) {
  return browser.i18n.getMessage( message_name, substitutions )
}

// BROWSER STATE

/**
 * Bind change events for the browser to dispatch operations on the store
 * @param store The redux store
 */
export function bindBrowserEvents( store ) {
  // @todo need way to turn off console

  // This would be required for integration with other extensions
  // browser.runtime.onMessage.addListener( ( message, sender, sendResponse ) => {
  //   console.info('runtime.onMessage', message, sender, sendResponse)
  // })

  browser.storage.onChanged.addListener( ( changes, area ) => {
    console.info('storage.onChanged', area, changes)
    if( area === 'local' && changes[ LOCAL_CONFIG_KEY ] ) {
      store.dispatch( updateConfigAction( changes[ LOCAL_CONFIG_KEY ].newValue || default_config ) )
    }
  })

  // Attach listeners for changes to windows

  browser.windows.onCreated.addListener( ( window ) => {
    console.info('windows.onCreated', window)
    if( window.type === 'normal' ) {
      store.dispatch( addWindowAction( window ) )
    }
  })

  browser.windows.onRemoved.addListener( ( window_id ) => {
    console.info('windows.onRemoved', window_id)
    store.dispatch( removeWindowAction( window_id ) )
  })

  // Attach listeners for changes to tabs

  browser.tabs.onActivated.addListener( ( { tabId, windowId } ) => {
    console.info('tabs.onActivated', tabId, windowId)
    store.dispatch( activateTabAction( tabId, windowId ) )

    // Start background task to get preview image
    browser.tabs.captureVisibleTab( windowId, TAB_PREVIEW_IMAGE_DETAILS )
      .then(
        ( preview_image_uri ) => {
          store.dispatch( updateTabImageAction( tabId, windowId, preview_image_uri ) )
          const tab = findTab( store.getState(), windowId, tabId )
          if( tab && tab.preview_image ) {
            setTabPreviewState( tab.id, tab.preview_image )
          }
        }
      )
  })

  browser.tabs.onCreated.addListener( ( browser_tab ) => {
    console.info('tabs.onCreated', browser_tab)
    store.dispatch( addTabAction( browser_tab ) )
  })

  browser.tabs.onRemoved.addListener( ( tab_id, { windowId, isWindowClosing } ) => {
    console.info('tabs.onRemoved', tab_id, windowId)
    store.dispatch( removeTabAction( tab_id, windowId ) )
  })

  browser.tabs.onMoved.addListener( ( tab_id, { windowId, fromIndex, toIndex } ) => {
    console.info('tabs.onMoved', tab_id, windowId, fromIndex, toIndex)
    store.dispatch( moveTabAction( tab_id, windowId, toIndex ) )
  })

  browser.tabs.onAttached.addListener( ( tab_id, { newWindowId, newPosition } ) => {
    console.info('tabs.onAttached', tab_id, newWindowId, newPosition)
    store.dispatch( attachTabAction( tab_id, newWindowId, newPosition ) )
  })

  browser.tabs.onDetached.addListener( ( tab_id, { oldWindowId, oldPosition } ) => {
    console.info('tabs.onDetached', tab_id, oldWindowId, oldPosition)
    store.dispatch( detachTabAction( tab_id, oldWindowId, oldPosition ) )
  })

  browser.tabs.onReplaced.addListener( ( added_tab_id, removed_tab_id ) => {
    console.info('tabs.onReplaced', added_tab_id, removed_tab_id)
    // @todo
  })

  browser.tabs.onUpdated.addListener( ( tab_id, change_info, browser_tab ) => {
    console.info('tabs.onUpdated', tab_id, change_info, browser_tab)
    store.dispatch( updateTabAction( browser_tab, change_info ) )
  })
}

/**
 * Load the state of the browser to structure for reducers/init
 */
export function loadBrowserState() {
  const window_ids = []
  let config, browser_tabs

  return Promise.all([
    browser.storage ? browser.storage.local.get( LOCAL_CONFIG_KEY ) : null,
    browser.tabs.query( {} ),
    // theme.getCurrent is available in firefox 58+
    browser.theme && browser.theme.getCurrent ? browser.theme.getCurrent() : null
  ]).then(
    ( [ storage, _tabs, theme ] ) => {
      config = storage[ LOCAL_CONFIG_KEY ] || default_config
      browser_tabs = _tabs

      const browser_tab_preview_images = []

      let window_tab_groups = []
      browser_tabs.forEach( tab => {
        browser_tab_preview_images.push( getTabPreviewState( tab.id ) )
        if( window_ids.indexOf( tab.windowId ) === -1 ) {
          window_ids.push( tab.windowId )
          window_tab_groups.push( browser.sessions.getWindowValue( tab.windowId, WINDOW_TAB_GROUPS_KEY ) )
        }
      })

      return Promise.all( [ Promise.all( browser_tab_preview_images ), Promise.all( window_tab_groups ) ] )
    }
  ).then(
    ( [ tab_preview_images, window_tab_groups ] ) => {
      const window_tab_groups_map = new Map()
      for( let i = 0; i < window_ids.length; i++ ) {
        window_tab_groups_map.set( window_ids[ i ], window_tab_groups[ i ] )
      }
      for( let i = 0; i < browser_tabs.length; i++ ) {
        browser_tabs[ i ].preview_image = tab_preview_images[ i ]
      }
      // This is the same structure from reducers.init
      return { config, browser_tabs, window_tab_groups_map }
    }
  )
}

/**
 * Map the browser state for a tab to the representation from the state
 * @param browser_tab
 */
export function getTabState( browser_tab ) {
  return {
    id: browser_tab.id,
    title: browser_tab.title,
    status: browser_tab.status,
    url: browser_tab.url,
    fav_icon_url: getFavIconUrl( browser_tab ),
    is_active: browser_tab.active,
    preview_image: {
      width: browser_tab.width,
      height: browser_tab.height,
    },
    // @todo audio info
  }
}

function getFavIconUrl( browser_tab ) {
  switch( browser_tab.favIconUrl ) {
    case 'chrome://mozapps/skin/extensions/extensionGeneric-16.svg':
      return '/icons/extensionGeneric.svg'
    case 'chrome://branding/content/icon32.png#':
      return '/icons/icon32.png'
    default:
      return browser_tab.favIconUrl
  }
}

/**
 * Save value to the window session
 * @param window_id
 * @param tab_groups_state
 */
export function setWindowTabGroupsState( window_id, tab_groups_state ) {
  return browser.sessions.setWindowValue( window_id, WINDOW_TAB_GROUPS_KEY, tab_groups_state )
}

/**
 * Fetch the preview image for a tab from session storage
 * @param tab_id
 */
export function getTabPreviewState( tab_id ) {
  return browser.sessions.getTabValue( tab_id, TAB_PREVIEW_IMAGE_KEY )
}

/**
 * Save the tab preview image and details to the
 * @param tab_id
 * @param preview_image
 */
export function setTabPreviewState( tab_id, preview_image ) {
  return browser.sessions.setTabValue( tab_id, TAB_PREVIEW_IMAGE_KEY, preview_image )
}

/**
 * Load the config values
 */
export function getConfig() {
  return browser.storage.local.get( LOCAL_CONFIG_KEY )
    .then( local_storage => local_storage[ LOCAL_CONFIG_KEY ] || {} )
}

/**
 * Set the value for a key in the config
 * @param key
 * @param value
 * @todo should allow multiple key/value pairs
 * @todo is there a better async way of doing this?
 */
export function setConfig( key, value ) {
  return getConfig()
    .then(
      ( config ) => {
        config[ key ] = value
        const local_storage = {}
        local_storage[ LOCAL_CONFIG_KEY ] = config
        return browser.storage.local.set( local_storage )
      }
    )
}

/**
 * Set the current theme by id
 * @param theme_id
 * @todo is there a safe async way to do this?
 */
export function setTheme( theme_id ) {
  return setConfig( 'theme', theme_id )
}

function resetWindowState( window ) {
  return browser.sessions.removeWindowActionValue( window.id, WINDOW_TAB_GROUPS_KEY )
}

function resetTabState( tab ) {
  return browser.sessions.removeTabActionValue( tab.id, TAB_PREVIEW_IMAGE_KEY )
}

/**
 * Remove all values stored in the browser
 * @param store
 * @todo should this return a promise?
 */
export function resetBrowserState( store ) {
  const state = store.getState()

  if( state.orphan_tabs ) {
    window.pinned_tabs.forEach( resetTabState )
  }

  state.windows.forEach( window => {
    resetWindowState( window )

    if( window.pinned_tabs ) {
      window.pinned_tabs.forEach( resetTabState )
    }

    window.tab_groups.forEach( tab_group => {
      tab_group.tabs.forEach( resetTabState )
    })
  })

  browser.storage.local.clear()
}

// NAVIGATION

/**
 * Navigate to the options page
 */
export function openOptionsPage() {
  browser.runtime.openOptionsPage()
}

/**
 * Open the extension tab groups page in new tab
 */
export function openTabGroupsPage() {
  // Using sidebar for now
  // browser.sidebarAction.open()
  //   .then(
  //     () => {
  //       browser.sidebarAction.setPanel( { panel: browser.extension.getURL( "sidebar.html" ) } )
  //       window.close()
  //     }
  //   )

  const url = browser.extension.getURL( "tab-groups.html" )

  browser.tabs.create({ url })
    .then( () => {
      // We don't want to sync this URL ever nor clutter the users history
      browser.history.deleteUrl({ url })
    })
}

// TABS

/**
 * Activate the given tab in the window
 * @param tab_id
 * @todo should this include the window_id?
 */
export function setTabActive( tab_id ) {
  return browser.tabs.update( tab_id, { active: true } )
}

/**
 * Close the given tab
 * @param tab_id
 */
export function closeTab( tab_id ) {
  return browser.tabs.remove( [ tab_id ] )
}

/**
 * Move tabs to a different group
 * @param store
 * @param tabs_data Object with properties window_id, tab_group_id and tab_ids
 * @param window_id
 * @param tab_group_id
 */
export function moveTabsToGroup( store, tabs_data, window_id, tab_group_id, index ) {
  console.info('moveTabsToGroup', tabs_data, window_id, tab_group_id, index)
  const { tab_ids } = tabs_data
  let index_offset = 0
  const state = store.getState()
  const window = state.windows.find( window => window.id == window_id )
  if( ! window ) {
    // @todo error
    return
  }

  if( window.pinned_tabs ) {
    index_offset += window.pinned_tabs.length
  }
  for( let tab_group of window.tab_groups ) {
    if( tab_group_id === tab_group.id ) {
      if( index == null ) {
        index = index_offset + tab_group.tabs_count
      } else {
        index += index_offset
      }
      for( let tab_id of tab_ids ) {
        // @todo should have dispatch operation for multi-move for efficiency
        store.dispatch( moveTabToGroupAction( tab_id, window_id, tab_group_id ) )
      }
      break
    }
    index_offset += tab_group.tabs_count
  }

  return browser.tabs.move( tab_ids, { index } )
}

/**
 * Run a text search for tabs in a window and dispatch start and finish to the store
 * @param store
 * @param window_id
 * @param search_text
 */
export function runTabSearch( store, window_id, search_text ) {
  console.info('runSearch', window_id, search_text)
  const state = store.getState()
  const window = state.windows.find( _window => _window.id === window_id )

  if( ! window ) {
    // @todo error
    return
  }

  // Update the store with the search
  store.dispatch( startSearchAction( window_id, search_text ) )

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
        store.dispatch( finishSearchAction( window_id, search_text, matching_tab_ids ) )
      }
    )
}
