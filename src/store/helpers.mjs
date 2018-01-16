import {
  getMessage
} from '../integrations/index.mjs'

export function createWindow( window_id, tab_groups ) {
  return {
    id: window_id,
    active_tab_group_id: tab_groups[ 0 ].id,
    pinned_tabs: [],
    tab_groups: tab_groups
  }
}

export function createTabGroup( tab_group_id, tabs ) {
  return {
    id: tab_group_id,
    title: getMessage( 'tab_group_name_placeholder', [ tab_group_id ] ),
    tabs,
    tabs_count: tabs.length
  }
}

export function cloneWindow( window ) {
  return Object.assign( {}, window, {
    pinned_tabs: window.pinned_tabs.map( cloneTab ),
    tab_groups: window.tab_groups.map( cloneTabGroup )
  })
}

export function cloneTabGroup( tab_group ) {
  return Object.assign( {}, tab_group, {
    tabs: tab_group.tabs.map( cloneTab )
  })
}

export function cloneTab( tab ) {
  tab = Object.assign( {}, tab )
  if( tab.mutedInfo ) {
    tab.mutedInfo = Object.assign( {}, tab.mutedInfo )
  }
  if( tab.preview_image ) {
    tab.preview_image = Object.assign( {}, tab.preview_image )
  }
  return tab
}

/**
 * Find a tab in the state
 * @param state
 */
export function findTab( state, window_id, tab_id ) {
  for( let window of state.windows ) {
    if( window.id === window_id ) {
      for( let tab_group of window.tab_groups ) {
        for( let tab of tab_group.tabs ) {
          if( tab.id === tab_id ) {
            return tab
          }
        }
      }
    }
  }
  return null
}

/**
 * Scan the state for the next available tab_group_id
 */
export function getNewTabGroupId( state ) {
  let new_tab_group_id = 1
  state.windows.forEach( window => {
    window.tab_groups.forEach( tab_group => {
      if( tab_group.id >= new_tab_group_id ) {
        new_tab_group_id = tab_group.id + 1
      }
    })
  })
  return new_tab_group_id
}

export function getTabGroupsPersistState( window ) {
  return window.tab_groups.map( tab_group => {
    return {
      id: tab_group.id,
      title: tab_group.title,
      tabs_count: tab_group.tabs_count,
      is_active: tab_group.id === window.active_tab_group_id ? true : undefined
    }
  })
}

/**
 * Map the browsers tab representation to the one stored on the state object
 * @param tab The browser representation for a tab
 * @returns The tab representation that will be stored in the state
 */
export function getTabState( tab ) {
  return {
    id: tab.id,
    active: tab.active,
    pinned: tab.pinned,
    // highlighted?
    status: tab.status,
    last_accessed: tab.lastAccessed,
    discarded: tab.discarded,
    // openerTabId?
    // audible?  may want to merge to object
    // mutedInfo.muted?
    favicon_url: tab.favIconUrl,
    url: tab.url,
    title: tab.title,
    // @todo store preview image with width and height
  }
}

