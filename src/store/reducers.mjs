import {
  INIT,
  WINDOW_ADD,
  WINDOW_REMOVE,
  WINDOW_SEARCH_START,
  WINDOW_SEARCH_FINISH,
  GROUP_CREATE,
  GROUP_REMOVE,
  GROUP_UPDATE,
  GROUP_MOVE,
  TAB_ACTIVATE,
  TAB_ADD,
  TAB_REMOVE,
  TAB_UPDATE,
  TAB_UPDATE_IMAGE,
  TAB_MOVE,
  TAB_ATTACH,
  TAB_DETACH,
  CONFIG_UPDATE,
} from './action-types.mjs'

import {
  createWindow,
  createTabGroup,
  getNewTabGroupId,
} from './helpers.mjs'

export const default_config = {
  theme: 'light'
}

const initial_state = {
  config: default_config,
  orphan_tabs: [],
  windows: []
}

function findTabGroupId( tab_groups, tab_id ) {
  let tab_group = tab_groups.find( tab_group => tab_group.tabs.some( tab => tab.id === tab_id ) )
  if( tab_group ) {
    return tab_group.id
  }
  return null
}

function findTabWindowId( windows, tab_id ) {
  let window = windows.find( window => findTabGroup( window.tab_groups, tab_id ) )
  if( window ) {
    return window.id
  }
  return null
}

function _removeTab( state, { tab_id, window_id, index, is_detach, is_pin } ) {
  // @todo use index to optimize the lookup process if set
  let orphan_tab = null

  const windows = state.windows.map( window => {
    if( window.id === window_id ) {
      window = Object.assign( {}, window, {
        pinned_tabs: window.pinned_tabs.filter( tab => {
          if( tab.id === tab_id ) {
            orphan_tab = tab
            return false
          }
          return true
        }),
        tab_groups: window.tab_groups.map( tab_group => {
          const tab_index = tab_group.tabs.findIndex( tab => tab.id === tab_id )
          if( tab_index > -1 ) {
            tab_group = Object.assign( {}, tab_group, {
              tabs: [ ...tab_group.tabs ],
              tabs_count: tab_group.tabs_count - 1
            })
            orphan_tab = tab_group.tabs.splice( tab_index, 1 )[ 0 ]
          }
          return tab_group
        })
      })

      if( is_pin && orphan_tab ) {
        window.pinned_tabs = [ ...window.pinned_tabs, orphan_tab ]
      }
    }
    return window
  })

  const new_state = Object.assign( {}, state, {
    windows
  })

  if( is_detach && orphan_tab ) {
    new_state.orphan_tabs = [ ...new_state.orphan_tabs, orphan_tab ]
  }

  return new_state
}

export function init( state, { config, tabs, window_tab_groups_map } ) {
  const window_tabs_map = new Map()

  // @todo use persist state from window_tab_groups_map

  // new_tab_group_id the largest id + 1
  let new_tab_group_id = 1
  // @todo iterate window_tab_groups_map to get id

  tabs.forEach( ( tab ) => {
    let window_tabs = window_tabs_map.get( tab.windowId )
    if( ! window_tabs ) {
      window_tabs = []
      window_tabs_map.set( tab.windowId, window_tabs )
    }
    window_tabs.push( tab )
  })

  const windows = []
  for( let [ window_id, window_tabs ] of window_tabs_map.entries() ) {
    // @todo ensure tabs are in index sorted order, with the pinned tabs first
    // @todo this should be based on config setting

    let pinned_tabs
    // Find the first non-pinned tab
    const tabs_start_index = window_tabs.findIndex( tab => ! tab.pinned )
    if( tabs_start_index === -1 ) {
      // All the tabs are pinned
      pinned_tabs = [ ...window_tabs ]
      window_tabs = []
    } else {
      pinned_tabs = window_tabs.slice( 0, tabs_start_index )
      window_tabs = window_tabs.slice( tabs_start_index )
    }

    let window_tab_groups = []
    let window_tab_groups_state = window_tab_groups_map.get( window_id )
    if( window_tab_groups_state ) {
      for( let tab_group_state of window_tab_groups_state ) {
        const tabs = window_tabs.splice( 0, tab_group_state.tabs_count )
        window_tab_groups.push({
          id: tab_group_state.id,
          title: tab_group_state.title,
          tabs,
          tabs_count: tabs.length
        })
      }
    } else {
      // No state, assign all tabs to new groups
      window_tab_groups.push( createTabGroup( new_tab_group_id, window_tabs ) )
      new_tab_group_id++
    }

    windows.push({
      id: window_id,
      active_tab_group_id: window_tab_groups[ 0 ].id,
      pinned_tabs,
      tab_groups: window_tab_groups
    })
  }

  const init_state = {
    config: config || initial_state.config,
    orphan_tabs: initial_state.orphan_tabs,
    windows
      /*
      id,
      active_tab_group_id,
      tab_groups: [
        {
          id,
          title,
          active_tab_id,
          tabs,
        }
      ]
      */
  }

  // @todo compare with state to return optimized diff

  return init_state
}

export function addWindow( state, { window } ) {
  // Check if there are any orphan_tabs that below to this window
  let tabs = []
  let orphan_tabs = state.orphan_tabs
  if( orphan_tabs.length > 0 ) {
    tabs = state.orphan_tabs.filter( tab => tab.windowId === window.id )
    orphan_tabs = orphan_tabs.filter( tab => tab.windowId !== window.id )
  }

  return Object.assign( {}, state, {
    orphan_tabs,
    windows: [
      ...state.windows,
      createWindow( window.id, [
        createTabGroup( getNewTabGroupId( state ), tabs )
      ])
    ]
  })
}

export function removeWindow( state, { window_id } ) {
  return Object.assign( {}, state, {
    windows: state.windows.filter( window => window.id !== window_id )
  })
}

export function startWindowSearch( state, { window_id, search_text } ) {
  return Object.assign( {}, state, {
    windows: state.windows.map( window => {
      if( window.id !== window_id ) {
        return window
      }

      let tab_groups = window.tab_groups
      if( window.search_text ) {
        tab_groups = tab_groups.map( tab_group => {
          return Object.assign( {}, tab_group, {
            tabs: tab_group.tabs.map( tab => {
              if( ! tab.is_matched ) {
                return tab
              }
              const new_tab = {}
              for( let key in tab ) {
                if( key !== 'is_matched' ) {
                  new_tab[ key ] = tab[ key ]
                }
              }
              return new_tab
            })
          })
        })
      }

      return Object.assign( {}, window, {
        search_text,
        search_resolved: !search_text,
        tab_groups
      })
    })
  })
}

export function finishWindowSearch( state, { window_id, search_text, matching_tab_ids } ) {
  return Object.assign( {}, state, {
    windows: state.windows.map( window => {
      if( window.id !== window_id || window.search_text !== search_text || matching_tab_ids.length === 0 ) {
        return window
      }

      return Object.assign( {}, window, {
        search_resolved: true,
        tab_groups: window.tab_groups.map( tab_group => {
          if( ! tab_group.tabs.some( tab => matching_tab_ids.indexOf( tab.id ) > -1 ) ) {
            return tab_group
          }
          return Object.assign( {}, tab_group, {
            tabs: tab_group.tabs.map( tab => {
              if( matching_tab_ids.indexOf( tab.id ) === -1 ) {
                return tab
              }
              return Object.assign( {}, tab, {
                is_matched: true
              })
            })
          })
        })
      })
    })
  })
}

export function createGroup( state, { window_id, tab_group } ) {
  const new_tab_group = tab_group || createTabGroup( getNewTabGroupId( state ), [] )
  return Object.assign( {}, state, {
    windows: state.windows.map( window => {
      if( window.id !== window_id ) {
        return window
      }
      return Object.assign( {}, window, {
        tab_groups: [ ...window.tab_groups, new_tab_group ]
      })
    })
  })
}

export function removeGroup( state, { tab_group_id, window_id } ) {
  return state
}

export function updateGroup( state, { tab_group_id, window_id, change_info } ) {
  return Object.assign( {}, state, {
    windows: state.windows.map( window => {
      if( window.id !== window_id ) {
        return window
      }
      return Object.assign( {}, window, {
        tab_groups: window.tab_groups.map( tab_group => {
          if( tab_group.id === tab_group_id ) {
            if( change_info.title && change_info.title !== tab_group.title ) {
              // @todo validation
            }
            tab_group = Object.assign( {}, tab_group, change_info )
          }
          return tab_group
        })
      })
    })
  })
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

export function addTab( state, { tab } ) {
  let is_window_defined = false
  const windows = state.windows.map( window => {
    if( window.id !== tab.windowId ) {
      return window
    }

    is_window_defined = true
    let i = 0
    return Object.assign( {}, window, {
      tab_groups: window.tab_groups.map( tab_group => {
        if( 0 <= tab.index - i && tab.index - i <= tab_group.tabs_count ) {
          // @todo if next tab_group is empty, add tab to it instead
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

  // If the window for the new tab doesn't exist yet, add to orphaned
  let orphan_tabs = state.orphan_tabs
  if( ! is_window_defined ) {
    orphan_tabs = [
      ...orphan_tabs,
      tab
    ]
  }

  return Object.assign( {}, state, {
    orphan_tabs,
    windows
  })
}

export function removeTab( state, { tab_id, window_id } ) {
  return _removeTab( state, { tab_id, window_id } )
}

export function updateTab( state, { tab, change_info } ) {
  // @todo if change_info contains 'pinned'
  if( change_info.hasOwnProperty( 'pinned' ) ) {
    if( change_info.pinned ) {
      return _removeTab( state, { tab_id: tab.id, window_id: tab.windowId, is_pin: true } )
    } else {
      // Remove the tab from the pinned tabs
      const windows = state.windows.map( window => {
        if( window.id !== tab.windowId ) {
          return window
        }

        let i = window.pinned_tabs.length
        return Object.assign( {}, window, {
          pinned_tabs: window.pinned_tabs.filter( _tab => _tab.id !== tab.id ),
          tab_groups: window.tab_groups.map( tab_group => {
            if( 0 <= tab.index - i && tab.index - i <= tab_group.tabs_count ) {
              // @todo if next tab_group is empty, add tab to it instead
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

      return Object.assign( {}, state, {
        windows
      })
    }
  }

  // @todo change use the nature of change_info to ignore changes
  return Object.assign( {}, state, {
    windows: state.windows.map( window => {
      if( window.id !== tab.windowId ) {
        return window
      }
      // @todo check for the tab in the pinned tabs
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

export function updateTabImage( state, { tab_id, window_id, preview_image_uri } ) {
  return Object.assign( {}, state, {
    windows: state.windows.map( window => {
      if( window.id !== window_id ) {
        return window
      }
      return Object.assign( {}, window, {
        tab_groups: window.tab_groups.map( tab_group => {
          const tab_index = tab_group.tabs.findIndex( _tab => _tab.id === tab_id )
          if( tab_index > -1 ) {
            tab_group = Object.assign( {}, tab_group, {
              tabs: [ ...tab_group.tabs ]
            })

            const preview_image = {
              width: tab_group.tabs[ tab_index ].width,
              height: tab_group.tabs[ tab_index ].height,
              uri: preview_image_uri
            }

            // Clone tab, update image
            tab_group.tabs[ tab_index ] = Object.assign( {}, tab_group.tabs[ tab_index ], {
              preview_image
            })
          }
          return tab_group
        })
      })
    })
  })
}

export function moveTab( state, { tab_id, window_id, index, tab_group_id } ) {
  return Object.assign( {}, state, {
    windows: state.windows.map( window => {
      // @todo if window_id is not defined, auto-detect
      if( window.id !== window_id ) {
        return window
      }

      let moved_tab = null
      let index_offset = 0

      function pullTab( tabs ) {
        const tab_index = tabs.findIndex( tab => tab.id === tab_id )
        if( tab_index > -1 && index_offset + tab_index !== index ) {
          tabs = [ ...tabs ]
          moved_tab = tabs.splice( tab_index, 1 )[ 0 ]
        }
        index_offset += tabs.length
        return tabs
      }

      if( window.pinned_tabs ) {
        const pinned_tabs = pullTab( window.pinned_tabs )
        if( window.pinned_tabs !== pinned_tabs ) {
          window = Object.assign( {}, window, {
            pinned_tabs
          })
        }
      }

      const tab_groups = window.tab_groups.map( tab_group => {
        const tabs = pullTab( tab_group.tabs )
        if( tabs !== tab_group.tabs ) {
          tab_group = Object.assign( {}, tab_group, {
            tabs,
            tabs_count: tabs.length
          })
        }
        return tab_group
      })

      // Scan tab_groups to find place to move tab to
      if( moved_tab ) {
        // @todo this is broken by pinned tabs
        for( let i = 0, j = 0; j < tab_groups.length; j++ ) {
          if( tab_group_id != null ) {
            // If the tab_group_id is passed, override behaviour
            if( tab_groups[ j ].id === tab_group_id ) {
              tab_groups[ j ] = Object.assign( {}, tab_groups[ j ], {
                tabs: [ ...tab_groups[ j ].tabs ],
                tabs_count: tab_groups[ j ].tabs_count + 1
              })
              if( index != null ) {
                tab_groups[ j ].tabs.splice( index - i, 0, moved_tab )
              } else {
                tab_groups[ j ].tabs.push( moved_tab )
              }
            }
          } else {
            // Otherwise determine group by index
            if( index - i <= tab_groups[ j ].tabs_count ) {
              tab_groups[ j ] = Object.assign( {}, tab_groups[ j ], {
                tabs: [ ...tab_groups[ j ].tabs ],
                tabs_count: tab_groups[ j ].tabs_count + 1
              })
              tab_groups[ j ].tabs.splice( index - i, 0, moved_tab )
              break
            }
          }
          i += tab_groups[ j ].tabs_count
        }
      }

      return Object.assign( {}, window, {
        tab_groups
      })
    })
  })
}

export function attachTab( state, { tab_id, window_id, index } ) {
  let tab_index = state.orphan_tabs.findIndex( tab => tab.id === tab_id )
  if( tab_index === -1 ) {
    // If the tab that is being detached is the last in the window, the attach event is fired before the detach, scan for tab in windows
    const tab_window_id = findTabWindowId( state.windows, tab_id )
    if( tab_window_id == null ) {
      // @todo error
      return state
    }
    state = detachTab( state, { tab_id, window_id: tab_window_id } )
    tab_index = state.orphan_tabs.findIndex( tab => tab.id === tab_id )
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
  return _removeTab( state, { tab_id, window_id, index, is_detach: true } )
}

export function updateConfig( state, { config } ) {
  return Object.assign( {}, state, {
    config
  })
}

export default function App( state = initial_state, action ) {
  switch( action.type ) {
    case INIT:
      return init( state, action )
    case CONFIG_UPDATE:
      return updateConfig( state, action )
    case WINDOW_ADD:
      return addWindow( state, action )
    case WINDOW_REMOVE:
      return removeWindow( state, action )
    case WINDOW_SEARCH_START:
      return startWindowSearch( state, action )
    case WINDOW_SEARCH_FINISH:
      return finishWindowSearch( state, action )
    case GROUP_CREATE:
      return createGroup( state, action )
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
    case TAB_UPDATE_IMAGE:
      return updateTabImage( state, action )
    case TAB_MOVE:
      return moveTab( state, action )
    case TAB_ATTACH:
      return attachTab( state, action )
    case TAB_DETACH:
      return detachTab( state, action )
    default:
      console.warn('unknown action type', action.type)
      return state
  }
}
