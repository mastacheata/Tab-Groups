
export const default_config = {
  theme: 'light'
}

export function createWindow( window_id, tab_groups ) {
  return {
    id: window_id,
    active_tab_group_id: tab_groups[ 1 ].id,
    tab_groups: tab_groups
  }
}

export function createTabGroup( tab_group_id, tabs, active_tab_id ) {
  if( ! active_tab_id && tabs.length ) {
    active_tab_id = tabs[ 0 ].id
  }

  return {
    id: tab_group_id,
    title: typeof browser != 'undefined' ? browser.i18n.getMessage( "tab_group_name_placeholder", [ tab_group_id ] ) : `Group ${ tab_group_id }`,
    active_tab_id,
    tabs,
    tabs_count: tabs.length
  }
}

export function createPinnedTabGroup( tabs, active_tab_id ) {
  if( ! active_tab_id && tabs.length ) {
    active_tab_id = tabs[ 0 ].id
  }

  return {
    id: 0,
    pinned: true,
    active_tab_id,
    tabs,
    tabs_count: tabs.length
  }
}

export function cloneWindow( window ) {
  return Object.assign( {}, window, {
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

function getTargetIndex( state, target_data, ignored_tabs ) {
  const target_window = state.windows.find( window => window.id === target_data.window_id )
  if( ! target_window ) {
    return null
  }
  let index_offset = 0
  for( let tab_group of target_window.tab_groups ) {
    let tab_group_index = 0
    for( let tab of tab_group.tabs ) {
      if( ! ignored_tabs.includes( tab ) ) {
        tab_group_index++
        if( target_data.tab_group_id === tab_group.id && target_data.tab_group_index === tab_group_index ) {
          return {
            index: index_offset + tab_group_index
          }
        }
      }
    }
    index_offset += tab_group_index
    if( target_data.tab_group_id === tab_group.id ) {
      return {
        index: index_offset,
        tab_group_index
      }
    }
  }
  return null
}

export function getTabMoveData( state, source_data, target_data ) {
  let { windows } = state

  // Load source_tabs with array of tabs
  let source_tabs
  if( source_data.tabs ) {
    source_tabs = source_data.tabs
  } else if( source_data.tab_ids ) {
    source_tabs = Array( source_data.tab_ids ).fill( null )
    const scanTabGroup = ( tab_group ) => {
      tab_group.tabs.forEach( tab => {
        const tab_index = source_data.tab_ids.indexOf( tab.id )
        if( tab_index > -1 ) {
          source_tabs[ tab_index ] = tab
        }
      })
    }

    for( let window of windows ) {
      if( window.id !== source_data.window_id ) {
        continue
      }

      const { tab_groups } = window
      if( source_data.tab_group_id != null ) {
        const tab_group_index = tab_groups.findIndex( _tab_group => _tab_group.id === source_data.tab_group_id )
        if( tab_group_index !== -1 ) {
          scanTabGroup( tab_groups[ tab_group_index ] )
        }
      } else {
        tab_groups.forEach( scanTabGroup )
      }
      break
    }
  } else {
    console.warn( "Problem loading source tab", source_data )
    return null
  }

  if( source_tabs.includes( null ) ) {
    console.warn( "Problem loading source tab", source_tabs )
    return null
  }

  source_data = Object.assign( {}, source_data, {
    tabs: source_tabs
  })

  // @todo scan to get the target index and group index
  const target_window = state.windows.find( window => window.id === target_data.window_id )
  if( ! target_window ) {
    return null
  }
  // Load the global index for the target
  if( target_data.index == null && target_data.tab_group_id != null ) {
    target_data = Object.assign( {}, target_data,
      getTargetIndex( state, target_data, source_tabs )
    )
    // @todo check result
  }

  return {
    source_data,
    target_data,
  }
}

/**
 * Load the state of a window to store on the session
 * @param window the window from the state
 */
export function getTabGroupsPersistState( window ) {
  return window.tab_groups.filter( tab_group => tab_group.id ).map( tab_group => {
    const tab_group_state = {
      id: tab_group.id,
      title: tab_group.title,
      active_tab_id: tab_group.active_tab_id,
      tabs_count: tab_group.tabs_count,
    }

    if( tab_group.id === window.active_tab_group_id ) {
      tab_group_state.active = true
    }

    return tab_group_state
  })
}
