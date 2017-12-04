import {
  INIT,
  TAB_ADD,
  TAB_REMOVE,
  TAB_UPDATE
} from './action-types.mjs'

const initial_state = {
  tab_groups: [],
  windows: []
}

export function init( state, { tabs, tab_groups, tab_group_id_map, window_active_tab_group_id_map } ) {
  const window_tabs_map = new Map()

  // new_tab_group_id the largest id + 1
  let new_tab_group_id = 1

  tabs.forEach( ( tab ) => {
    let window_tabs = window_tabs_map.get( tab.windowId )
    if( ! window_tabs ) {
      window_tabs = []
      window_tabs_map.set( tab.windowId, window_tabs )
    }
    window_tabs.push( tab )

    const tab_group_id = tab_group_id_map.get( tab.id )
    if( tab_group_id >= new_tab_group_id ) {
      new_tab_group_id = tab_group_id + 1
    }
  })

  const windows = []
  for( let [ window_id, tabs ] of window_tabs_map.entries() ) {
    let new_tab_group = {
      id: new_tab_group_id,
      name: `Group ${ new_tab_group_id }`,
      // name: browser.i18n.getMessage( "tab_group_name_placeholder", [ new_tab_group_id ] ),
      tabs: [],
      tabs_count: 0
    }
    let is_initializing = false
    let window_tab_groups = []
    for( let tab of tabs ) {
      let tab_group_id = tab_group_id_map.get( tab.id )
      if( tab_group_id == null ) {
        // Tab is not yet assigned to a group, use the new one
        if( ! is_initializing ) {
          is_initializing = true
          tab_groups.push( new_tab_group )
          window_tab_groups.push( new_tab_group )
          new_tab_group_id++
        }
        new_tab_group.tabs.push( tab )
        new_tab_group.tabs_count++
      } else {
        // Find the tab group in the collections
        let tab_group = window_tab_groups.find( ( tab_group ) => tab_group.id === tab_group_id )
        if( ! tab_group ) {
          // @todo handle error
        } else if( window_tab_groups.indexOf( tab_group ) === -1 ) {
          window_tab_groups.push( tab_group )
        }
      }
    }

    windows.push({
      id: window_id,
      active_tab_group_id: window_active_tab_group_id_map.get( window_id ) || window_tab_groups[ 0 ].id,
      tab_groups: window_tab_groups
    })
  }

  const init_state = {
    tab_groups,
    windows
      /*
      id,
      active_tab_group_id,
      tab_groups: [
        {
          id,
          name,
          active_tab_id,
          tabs,
        }
      ]
      */
  }

  // @todo compare with state to return optimized diff

  return init_state
}

/**
 * Update reference to tab_group in windows
 * @param windows
 * @param updated_tab_group
 */
function updateWindowsTabGroup( windows, updated_tab_group ) {
  if( ! updated_tab_group ) {
    return windows
  }
  const isTabGroup = ( tab_group ) => tab_group.id === updated_tab_group.id

  // Update tab group in window
  const window_index = windows.findIndex( window => window.tab_groups.some( isTabGroup ) )
  if( window_index === -1 ) {
    // @todo throw error
    return windows
  }

  // Create new object
  const window = Object.assign( {}, windows[ window_index ] )
  window.tab_groups = [ ...window.tab_groups ]
  windows = [ ...windows ]
  windows[ window_index ] = window

  // Update reference in windows
  window.tab_groups[ window.tab_groups.findIndex( isTabGroup ) ] = updated_tab_group
  return windows
}

export function addTab( state, { tab, tab_group_id } ) {
  // If tab_group_id is not defined, use the window's active_tab_group_id instead
  if( typeof tab_group_id === 'undefined') {
    const window = state.windows.find( ( window ) => window.id === tab.windowId )
    if( window ) {
      tab_group_id = window.active_tab_group_id
    }
    if( ! tab_group_id ) {
      // @todo throw error
      console.error("addTab: window doesn't have active group")
      return state
    }
  }

  // Find the tab_group by id
  const tab_group_index = state.tab_groups.findIndex( ( tab_group ) => tab_group.id === tab_group_id )
  if( tab_group_index === -1 ) {
    // @todo throw error
    console.error('addTab: tab_group_id not found')
    return state
  }

  // Create new object
  const tab_group = Object.assign( {}, state.tab_groups[ tab_group_index ] )
  // @todo use tab.index to determine order
  tab_group.tabs = [
    ...tab_group.tabs,
    tab
  ]
  tab_group.tabs_count++

  const tab_groups = [ ...state.tab_groups ]
  tab_groups[ tab_group_index ] = tab_group

  return {
    tab_groups,
    windows: updateWindowsTabGroup( state.windows, tab_group )
  }
}

function removeTabFromGroup( tab_group, tab_id ) {
  const tab_index = tab_group.tabs.findIndex( ( tab ) => tab.id === tab_id )
  if( tab_index === -1 ) {
    return tab_group
  }
  tab_group = Object.assign( {}, tab_group )
  tab_group.tabs = tab_group.tabs.slice( 0 )
  tab_group.tabs_count--
  tab_group.tabs.splice( tab_index, 1 )
  return tab_group
}

export function removeTab( state, { tab_id } ) {
  const tab_groups = []
  let updated_tab_group = null

  state.tab_groups.forEach( ( tab_group ) => {
    const new_tab_group = removeTabFromGroup( tab_group, tab_id )
    if( new_tab_group !== tab_group ) {
      updated_tab_group = new_tab_group
    }
    tab_groups.push( new_tab_group )
  })

  return {
    tab_groups,
    windows: updateWindowsTabGroup( state.windows, updated_tab_group )
  }
}

function updateTabFromGroup( tab_group, updated_tab ) {
  const tab_index = tab_group.tabs.findIndex( ( tab ) => tab.id === updated_tab.id )
  if( tab_index === -1 ) {
    return tab_group
  }
  tab_group = Object.assign( {}, tab_group )
  tab_group.tabs = tab_group.tabs.slice( 0 )
  tab_group.tabs[ tab_index ] = updated_tab
  return tab_group
}

export function updateTab( state, { tab, change_info } ) {
  // @todo change use the nature of change_info to ignore changes
  let updated_tab_group = null
  const tab_groups = state.tab_groups.map( ( tab_group ) => {
    const new_tab_group = updateTabFromGroup( tab_group, tab )
    if( new_tab_group !== tab_group ) {
      updated_tab_group = new_tab_group
    }
    return new_tab_group
  })

  return {
    tab_groups,
    windows: updateWindowsTabGroup( state.windows, updated_tab_group )
  }
}

export default function App( state = initial_state, action ) {
  switch( action.type ) {
    case INIT:
      return init( state, action )
    case TAB_ADD:
      return addTab( state, action )
    case TAB_REMOVE:
      return removeTab( state, action )
    case TAB_UPDATE:
      return updateTab( state, action )
    default:
      return state
  }
}
