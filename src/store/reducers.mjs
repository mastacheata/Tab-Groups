import {
  INIT,
  GROUP_ADD,
  GROUP_REMOVE,
  GROUP_UPDATE,
  GROUP_MOVE,
  TAB_ACTIVATE,
  TAB_ADD,
  TAB_REMOVE,
  TAB_UPDATE,
  TAB_MOVE,
  TAB_ATTACH,
  TAB_DETACH,
} from './action-types.mjs'

const initial_state = {
  orphan_tabs: [],
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
    orphan_tabs: initial_state.orphan_tabs,
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

export function addGroup( state, { tab_group, window_id } ) {
  return state
}

export function removeGroup( state, { tab_group_id, window_id } ) {
  return state
}

export function updateGroup( state, { tab_group, window_id, change_info } ) {
  return state
}

export function moveGroup( state, { tab_group_id, window_id, index } ) {
  return state
}

export function activateTab( state, { tab_id, window_id } ) {
  // @todo optimize to return existing state if tab already active
  return Object.assign( {}, state, {
    windows: state.windows.map( window => {
      if( window.id === window_id ) {
        window = Object.assign( {}, window, {
          tab_groups: window.tab_groups.map( tab_group => {
            // If tab_group contains an active tab or the tab_id, return a copy with active toggled
            if( tab_group.tabs.some( tab => tab.active || tab.id === tab_id ) ) {
              tab_group = Object.assign( {}, tab_group, {
                tabs: tab_group.tabs.map( tab => {
                  if( tab.id === tab_id ) {
                    return Object.assign( {}, tab, {
                      active: true
                    })
                  }
                  if( tab.active ) {
                    return Object.assign( {}, tab, {
                      active: false
                    })
                  }
                  return tab
                })
              })
            }
            return tab_group
          })
        })
      }
      return window
    })
  })
}

export function addTab( state, { tab, tab_group_id } ) {
  return Object.assign( {}, state, {
    windows: state.windows.map( window => {
      if( window.id !== tab.windowId ) {
        return window
      }

      let i = 0
      return Object.assign( {}, window, {
        tab_groups: window.tab_groups.map( tab_group => {
          if( 0 <= tab.index - i && tab.index - i <= tab_group.tabs_count ) {
            tab_group = Object.assign( {}, tab_group, {
              tabs: [ ...tab_group.tabs ],
              tabs_count: tab_group.tabs_count + 1
            })
            tab_group.tabs.splice( tab.index - i, 0, tab )
          }
          i += tab_group.tabs_count
          return tab_group
        })
      })
    })
  })
}

export function removeTab( state, { tab_id, window_id } ) {
  return Object.assign( {}, state, {
    windows: state.windows.map( window => {
      if( window.id !== window_id ) {
        return window
      }
      return Object.assign( {}, window, {
        tab_groups: window.tab_groups.map( tab_group => {
          const tab_index = tab_group.tabs.findIndex( tab => tab.id === tab_id )
          if( tab_index > -1 ) {
            // @todo what to do with empty groups
            tab_group = Object.assign( {}, tab_group, {
              tabs: [ ...tab_group.tabs ]
            })
            tab_group.tabs.splice( tab_index, 1 )
            tab_group.tabs_count--
          }
          return tab_group
        })
      })
    })
  })
}

export function updateTab( state, { tab, change_info } ) {
  // @todo change use the nature of change_info to ignore changes
  return Object.assign( {}, state, {
    windows: state.windows.map( window => {
      if( window.id !== tab.windowId ) {
        return window
      }
      return Object.assign( {}, window, {
        tab_groups: window.tab_groups.map( tab_group => {
          const tab_index = tab_group.tabs.findIndex( _tab => _tab.id === tab.id )
          if( tab_index > -1 ) {
            tab_group = Object.assign( {}, tab_group, {
              tabs: [ ...tab_group.tabs ]
            })
            tab_group.tabs[ tab_index ] = tab
          }
          return tab_group
        })
      })
    })
  })
}

export function moveTab( state, { tab_id, window_id, index } ) {
  const windows = state.windows.map( window => {
    if( window.id !== window_id ) {
      return window
    }

    let moved_tab = null

    const tab_groups = window.tab_groups.map( tab_group => {
      const tab_index = tab_group.tabs.findIndex( tab => tab.id === tab_id )
      if( tab_index > -1 ) {
        tab_group = Object.assign( {}, tab_group, {
          tabs: [ ...tab_group.tabs ]
        })
        moved_tab = tab_group.tabs.splice( tab_index, 1 )[ 0 ]
        tab_group.tabs_count--
      }
      return tab_group
    })

    // Scan tab_groups to find place to move tab to
    if( moved_tab ) {
      for( let i = 0, j = 0; j < tab_groups.length; j++ ) {
        if( index - i <= tab_groups[ j ].tabs_count ) {
          tab_groups[ j ] = Object.assign( {}, tab_groups[ j ], {
            tabs: [ ...tab_groups[ j ].tabs ],
            tabs_count: tab_groups[ j ].tabs_count + 1
          })
          tab_groups[ j ].tabs.splice( index - i, 0, moved_tab )
          break
        }
        i += tab_groups[ j ].tabs_count
      }
    }

    return Object.assign( {}, window, {
      tab_groups
    })
  })

  return Object.assign( {}, state, {
    windows
  })
}

export function attachTab( state, { tab_id, window_id, index } ) {
  const tab_index = state.orphan_tabs.findIndex( tab => tab.id === tab_id )
  if( tab_index === -1 ) {
    // If the window that is being detached from is closing, this event is fired before the detach
    // @todo find tab and move it
    return state
  }

  const orphan_tabs = [ ...state.orphan_tabs ]
  const tab = Object.assign( {}, orphan_tabs.splice( tab_index, 1 )[ 0 ], {
    windowId: window_id,
    index
  })

  return Object.assign( addTab( state, { tab } ), {
    orphan_tabs
  })
}

export function detachTab( state, { tab_id, window_id, index } ) {
  let orphan_tab = null

  const windows = state.windows.map( window => {
    if( window.id !== window_id ) {
      return window
    }
    return Object.assign( {}, window, {
      tab_groups: window.tab_groups.map( tab_group => {
        const tab_index = tab_group.tabs.findIndex( tab => tab.id === tab_id )
        if( tab_index > -1 ) {
          tab_group = Object.assign( {}, tab_group, {
            tabs: [ ...tab_group.tabs ]
          })
          orphan_tab = tab_group.tabs.splice( tab_index, 1 )[ 0 ]
        }
        return tab_group
      })
    })
  })

  const new_state = Object.assign( {}, state, {
    windows
  })

  if( orphan_tab ) {
    new_state.orphan_tabs = [ ...new_state.orphan_tabs, orphan_tab ]
  }

  return new_state
}

export default function App( state = initial_state, action ) {
  switch( action.type ) {
    case INIT:
      return init( state, action )
    case GROUP_ADD:
      return addGroup( state, action )
    case GROUP_REMOVE:
      return removeGroup( state, action )
    case GROUP_UPDATE:
      return updateGroup( state, action )
    case GROUP_MOVE:
      return moveGroup( state, action )
    case TAB_ACTIVATE:
      return activateTab( state, action )
    case TAB_ADD:
      return addTab( state, action )
    case TAB_REMOVE:
      return removeTab( state, action )
    case TAB_UPDATE:
      return updateTab( state, action )
    case TAB_MOVE:
      return moveTab( state, action )
    case TAB_ATTACH:
      return attachTab( state, action )
    case TAB_DETACH:
      return detachTab( state, action )
    default:
      return state
  }
}
