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
  TABS_MOVE,
  TAB_ACTIVATE,
  TAB_ADD,
  TAB_REMOVE,
  TAB_UPDATE,
  TAB_UPDATE_IMAGE,
  TAB_MOVE,
  TAB_ATTACH,
  TAB_DETACH,
  CONFIG_UPDATE,
} from './action-types'

import {
  createWindow,
  createTabGroup,
  createPinnedTabGroup,
  default_config,
  findTab,
  getNewTabGroupId,
  getTabMoveData,
} from './helpers'

import {
  getTabState,
} from '../integrations/index'

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
  let window = windows.find( window => findTabGroupId( window.tab_groups, tab_id ) != null )
  if( window ) {
    return window.id
  }
  return null
}

function findWindowIndex( windows, window_id ) {
  return windows.findIndex( window => window.id === window_id )
}

function _removeTab( state, { tab_id, window_id, index, is_detach } ) {
  // @todo use index to optimize the lookup process if set
  let orphan_tab = null
  // @todo update active_tab_id if required

  const windows = state.windows.map( window => {
    if( window.id === window_id ) {
      window = Object.assign( {}, window, {
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

export function init( state, { config, browser_tabs, window_tab_groups_map } ) {
  const window_tabs_map = new Map()

  // @todo use persist state from window_tab_groups_map

  // new_tab_group_id the largest id + 1
  let new_tab_group_id = 1
  // @todo iterate window_tab_groups_map to get id

  browser_tabs.forEach( browser_tab => {
    let window_tabs = window_tabs_map.get( browser_tab.windowId )
    if( ! window_tabs ) {
      window_tabs = []
      window_tabs_map.set( browser_tab.windowId, window_tabs )
    }
    window_tabs.push( browser_tab )
  })

  const windows = []
  for( let [ window_id, window_tabs ] of window_tabs_map.entries() ) {
    // @todo ensure tabs are in index sorted order, with the pinned tabs first
    // @todo this should be based on config setting

    let pinned_tabs

    // Find the first non-pinned tab
    const tabs_start_index = window_tabs.findIndex( browser_tab => ! browser_tab.pinned )
    if( tabs_start_index === -1 ) {
      // All the tabs are pinned
      pinned_tabs = window_tabs.map( getTabState )
      window_tabs = []
    } else {
      pinned_tabs = window_tabs.slice( 0, tabs_start_index ).map( getTabState )
      window_tabs = window_tabs.slice( tabs_start_index ).map( getTabState )
    }

    const window_tab_groups = [ createPinnedTabGroup( pinned_tabs ) ]
    const window_tab_groups_state = window_tab_groups_map.get( window_id )
    if( window_tab_groups_state ) {
      const last_tab_group_state = window_tab_groups_state[ window_tab_groups_state.length - 1 ]
      for( let tab_group_state of window_tab_groups_state ) {
        const tabs = ( last_tab_group_state === tab_group_state ? window_tabs : window_tabs.splice( 0, tab_group_state.tabs_count ) ).map( getTabState )
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
      active_tab_group_id: window_tab_groups[ 1 ].id, // @todo
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

export function addWindow( state, { browser_window } ) {
  // Check if there are any orphan_tabs that belong to this window
  let tabs = []
  let orphan_tabs = state.orphan_tabs
  if( orphan_tabs.length > 0 ) {
    // @todo map to state
    // @todo is it possible to have pinned orphan tabs?
    tabs = state.orphan_tabs.filter( browser_tab => browser_tab.windowId === browser_window.id )
    orphan_tabs = orphan_tabs.filter( browser_tab => browser_tab.windowId !== browser_window.id )
  }

  return Object.assign( {}, state, {
    orphan_tabs,
    windows: [
      ...state.windows,
      createWindow( browser_window.id, [
        createPinnedTabGroup( [] ),
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

export function createGroup( state, { window_id } ) {
  const new_tab_group = createTabGroup( getNewTabGroupId( state ), [] )
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
  let tab_group_id
  // @todo optimize to return existing state if tab already active
  return Object.assign( {}, state, {
    windows: state.windows.map( window => {
      if( window.id === window_id ) {
        window = Object.assign( {}, window, {
          tab_groups: window.tab_groups.map( tab_group => {
            // If tab_group contains the tab_id, return a copy with active toggled
            if( tab_group.tabs.some( tab => tab.id === tab_id ) ) {
              tab_group_id = tab_group.id
              tab_group = Object.assign( {}, tab_group, {
                active_tab_id: tab_id
              })
            }
            return tab_group
          })
        })

        if( tab_group_id ) {
          window.active_tab_group_id = tab_group_id
        }
      }
      return window
    })
  })
}

export function addTab( state, { browser_tab } ) {
  let is_window_defined = false
  const windows = state.windows.map( window => {
    if( window.id !== browser_tab.windowId ) {
      return window
    }

    is_window_defined = true
    let i = 0
    const last_tab_group = window.tab_groups[ window.tab_groups.length - 1 ]
    return Object.assign( {}, window, {
      tab_groups: window.tab_groups.map( tab_group => {
        if( 0 <= browser_tab.index - i && browser_tab.index - i <= tab_group.tabs_count ) {
          // @todo if next tab_group is empty, add tab to it instead
          tab_group = Object.assign( {}, tab_group, {
            tabs: [ ...tab_group.tabs ],
            tabs_count: tab_group.tabs_count + 1
          })
          tab_group.tabs.splice( browser_tab.index - i, 0, getTabState( browser_tab ) )
        } else if( last_tab_group ) {
          tab_group = Object.assign( {}, tab_group, {
            tabs: [ ...tab_group.tabs, getTabState( browser_tab ) ],
            tabs_count: tab_group.tabs_count + 1
          })
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
      browser_tab
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

export function updateTab( state, { browser_tab, change_info } ) {
  // @todo change use the nature of change_info to ignore changes
  return Object.assign( {}, state, {
    windows: state.windows.map( window => {
      if( window.id !== browser_tab.windowId ) {
        return window
      }
      if( change_info.hasOwnProperty( 'pinned' ) ) {
        // @todo this is really a tab move, could use helper
        // @todo if unpin, add to active tab group id instead
        let i = 0
        const isTab = ( _tab ) => _tab.id === browser_tab.id
        const isNotTab = ( _tab ) => _tab.id !== browser_tab.id
        return Object.assign( {}, window, {
          tab_groups: window.tab_groups.map( tab_group => {
            if( tab_group.pinned ) {
              if( change_info.pinned ) {
                // Add tab to pinned group
                if( ! tab_group.tabs.some( isTab ) ) {
                  tab_group = Object.assign( {}, tab_group, {
                    // If the tab has already been added by the move, remove it
                    tabs: [ ...tab_group.tabs ],
                    tabs_count: tab_group.tabs_count + 1
                  })
                  tab_group.tabs.splice( browser_tab.index - i, 0, getTabState( browser_tab ) )
                }
              } else {
                // Remove tab from pinned group
                tab_group = Object.assign( {}, tab_group, {
                  tabs: tab_group.tabs.filter( isNotTab ),
                  tabs_count: tab_group.tabs_count - 1
                })
              }
            } else {
              if( change_info.pinned ) {
                // Remove tab if exists
                if( tab_group.tabs.some( isTab ) ) {
                  tab_group = Object.assign( {}, tab_group, {
                    tabs: tab_group.tabs.filter( isNotTab ),
                    tabs_count: tab_group.tabs_count - 1
                  })
                }
              } else if( browser_tab && browser_tab.index - i <= tab_group.tabs_count ) {
                // Add tab by index
                tab_group = Object.assign( {}, tab_group, {
                  tabs: [ ...tab_group.tabs ],
                  tabs_count: tab_group.tabs_count + 1
                })
                tab_group.tabs.splice( browser_tab.index - i, 0, getTabState( browser_tab ) )
                browser_tab = null
              }
            }
            // Increment offset to calc future index
            i += tab_group.tabs_count
            return tab_group
          })
        })
      } else {
        return Object.assign( {}, window, {
          tab_groups: window.tab_groups.map( tab_group => {
            const tab_index = tab_group.tabs.findIndex( _tab => _tab.id === browser_tab.id )
            if( tab_index > -1 ) {
              tab_group = Object.assign( {}, tab_group, {
                tabs: [ ...tab_group.tabs ]
              })
              tab_group.tabs[ tab_index ] = getTabState( browser_tab )
            }
            return tab_group
          })
        })
      }
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

/**
 * Return a copy of state with tab identified by source_data moved to the target
 * Only exported for testing
 * @todo should include multi-source
 * @todo what if source location doesn't match info
 * @param state
 * @param source_data
 *   { window_id, tab_group_id, tab_ids }
 *     tab_group_id optional
 *   { window_id, index, pinned }
 *   // @todo { browser_tabs }
 * @param target_data
 *   { window_id, index, pinned }
 *   { window_id, tab_group_id }
 *   { window_id, tab_group_id, tab_group_index }
 *   { window_id, pinned }
 */
export function moveTabs( state, source_data, target_data ) {
  let { windows } = state
  // @todo most of this can be removed

  // Load source_tabs with array of tabs

  let source_tabs
  if( source_data.tabs ) {
    source_tabs = source_data.tabs
  } else if( source_data.tab_ids ) {
    // source_tabs = Array( source_data.tab_ids ).fill( null )
    // const scanTabGroup = ( tab_group ) => {
    //   console.info('scanTabGroup', source_data.tab_ids, tab_group)
    //   tab_group.tabs.forEach( tab => {
    //     const tab_index = source_data.tab_ids.indexOf( tab.id )
    //     if( tab_index > -1 ) {
    //       source_tabs[ tab_index ] = tab
    //       console.info('found')
    //     }
    //   })
    // }

    // windows.forEach( window => {
    //   if( window.id !== source_data.window_id ) {
    //     return
    //   }

    //   const { tab_groups } = window
    //   if( source_data.tab_group_id != null ) {
    //     const tab_group_index = tab_groups.findIndex( _tab_group => _tab_group.id === source_data.tab_group_id )
    //     if( tab_group_index !== -1 ) {
    //       scanTabGroup( tab_groups[ tab_group_index ] )
    //     }
    //   } else {
    //     tab_groups.forEach( scanTabGroup )
    //   }
    // })
  } else {
    // console.warn( "Problem loading source tab", source_data )
    // return state
  }

  // if( source_tabs.includes( null ) ) {
  //   console.warn( "Problem loading source tab", source_tabs )
  //   return state
  // }

  // @todo check orphan tabs
  // @todo If source is same as target, noop
  return Object.assign( {}, state, {
    windows: windows.map( window => {
      if( window.id !== source_data.window_id && window.id !== target_data.window_id ) {
        return window
      }
      let index_offset = 0
      return Object.assign( {}, window, {
        tab_groups: window.tab_groups.map( tab_group => {
          let { tabs } = tab_group
          if( tabs.some( tab => source_tabs.includes( tab ) ) ) {
            tabs = tabs.filter( tab => ! source_tabs.includes( tab ) )
          }

          // if( target_data.tab_group_id == null && target_data.index <= index_offset + tabs.length ) {
          //   // @todo checks to validated pinned
          //   if( tab_group.pinned ) {
          //     console.warn('@todo handling for pinned group')
          //   }
          //   target_data = Object.assign( {}, target_data, {
          //     tab_group_id: tab_group.id,
          //     tab_group_index: target_data.index - index_offset
          //   })
          // }

          if( target_data.tab_group_id === tab_group.id ) {
            tabs = [ ...tabs ]
            if( target_data.tab_group_index === null ) {
              tabs.push( ...source_tabs )
            } else {
              tabs.splice( target_data.tab_group_index, 0, ...source_tabs )
            }
          }

          if( tabs !== tab_group.tabs ) {
            tab_group = Object.assign( {}, tab_group, {
              tabs,
              tabs_count: tabs.length
            })
          }

          index_offset += tab_group.tabs_count
          return tab_group
        })
      })
    })
  })
}

export function moveTab( state, { tab_id, window_id, index } ) {
  const source_data = {
    window_id,
    tab_ids: [ tab_id ],
    tabs: [ findTab( state, window_id, tab_id ) ]
  }

  const target_data = {
    window_id,
    index
  }

  return moveTabs( state, source_data, target_data )
}

export function attachTab( state, { tab_id, window_id, index } ) {
  let tab_index = state.orphan_tabs.findIndex( browser_tab => browser_tab.id === tab_id )
  if( tab_index === -1 ) {
    // If the tab that is being detached is the last in the window, the attach event is fired before the detach, scan for tab in windows
    const tab_window_id = findTabWindowId( state.windows, tab_id )
    if( tab_window_id == null ) {
      // @todo error
      return state
    }
    state = detachTab( state, { tab_id, window_id: tab_window_id } )
    tab_index = state.orphan_tabs.findIndex( browser_tab => browser_tab.id === tab_id )
  }

  const orphan_tabs = [ ...state.orphan_tabs ]
  const browser_tab = Object.assign( {}, orphan_tabs.splice( tab_index, 1 )[ 0 ], {
    windowId: window_id,
    index
  })

  return Object.assign( addTab( state, { browser_tab } ), {
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
    case TABS_MOVE:
      return moveTabs( state, action.source_data, action.target_data )
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