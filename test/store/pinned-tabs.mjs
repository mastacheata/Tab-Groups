import tap from 'tap'
import { createTestTab } from './helpers'

import { init, updateTab } from '../../src/store/reducers'

function testSingleWindowFreshInit( t ) {
  const tabs = [
    createTestTab({
      id: 1,
      index: 0,
      windowId: 1,
      pinned: true
    }),
    createTestTab({
      id: 2,
      index: 1,
      windowId: 1
    })
  ]
  const window_tab_groups_map = new Map()

  let initial_state = init( null, { tabs, window_tab_groups_map })
  t.equal( initial_state.windows.length, 1 )
  t.equal( initial_state.windows[ 0 ].pinned_tabs.length, 1 )
  t.equal( initial_state.windows[ 0 ].pinned_tabs[ 0 ].id, 1 )
  t.equal( initial_state.windows[ 0 ].tab_groups.length, 1 )
  t.equal( initial_state.windows[ 0 ].tab_groups[ 0 ].id, 1 )
  t.equal( initial_state.windows[ 0 ].active_tab_group_id, initial_state.windows[ 0 ].tab_groups[ 0 ].id )
  t.equal( initial_state.windows[ 0 ].tab_groups[ 0 ].title, "Group 1" )
  t.equal( initial_state.windows[ 0 ].tab_groups[ 0 ].tabs.length, 1 )
  t.equal( initial_state.windows[ 0 ].tab_groups[ 0 ].tabs_count, initial_state.windows[ 0 ].tab_groups[ 0 ].tabs.length )
  t.end()
}

function testSingleWindowFreshPinnedInit() {
  const tabs = [
    createTestTab({
      id: 1,
      index: 0,
      windowId: 1
    }),
    createTestTab({
      id: 2,
      index: 1,
      windowId: 1
    })
  ]
  const window_tab_groups_map = new Map()

  // @todo toggle based on config
}

function testPinnedTabs( t ) {
  const tabs = [
    createTestTab({
      id: 1,
      index: 0,
      windowId: 1,
      pinned: true
    }),
    createTestTab({
      id: 2,
      index: 1,
      windowId: 1
    }),
    createTestTab({
      id: 3,
      index: 2,
      windowId: 1
    }),
    createTestTab({
      id: 4,
      index: 3,
      windowId: 1
    })
  ]
  const window_tab_groups_map = new Map()

  // Initial state with 1 pinned + 3 normal tabs in 1 window
  let state = init( null, { tabs, window_tab_groups_map })
  t.equal( state.windows.length, 1 )
  t.equal( state.windows[ 0 ].pinned_tabs.length, 1 )
  t.equal( state.windows[ 0 ].pinned_tabs[ 0 ].id, 1 )
  t.equal( state.windows[ 0 ].tab_groups.length, 1 )
  t.equal( state.windows[ 0 ].tab_groups[ 0 ].tabs.length, 3 )

  // Pin another tab
  let tab = Object.assign( {}, state.windows[ 0 ].tab_groups[ 0 ].tabs[ 1 ], { index: 1, pinned: true } )
  state = updateTab( state, { tab, change_info: { pinned: true } } )

  // Ensure added to pinned
  t.equal( state.windows[ 0 ].pinned_tabs.length, 2 )
  t.equal( state.windows[ 0 ].pinned_tabs[ 1 ].id, tab.id )
  // Ensure removed from groups
  t.equal( state.windows[ 0 ].tab_groups[ 0 ].tabs.length, 2 )

  // Unpin a tab
  tab = Object.assign( {}, state.windows[ 0 ].pinned_tabs[ 0 ], { index: 1, pinned: false } )
  state = updateTab( state, { tab, change_info: { pinned: false } } )

  t.end()
}

export default function() {
  // @todo run init on window with pinned tabs
  // @todo run update to pin a tab
  // @todo move pinned tabs
  // @todo run update to unpin a tab
  tap.test( testSingleWindowFreshInit )
  tap.test( testPinnedTabs )
}
