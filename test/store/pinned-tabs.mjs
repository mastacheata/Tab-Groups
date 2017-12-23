import tap from 'tap'
import { createTab } from './helpers'

import { init } from '../../src/store/reducers'

function testSingleWindowFreshInit( t ) {
  t.plan( 9 )

  const tabs = [
    createTab({
      id: 1,
      index: 0,
      windowId: 1,
      pinned: true
    }),
    createTab({
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
}

function testSingleWindowFreshPinnedInit() {
  const tabs = [
    createTab({
      id: 1,
      index: 0,
      windowId: 1
    }),
    createTab({
      id: 2,
      index: 1,
      windowId: 1
    })
  ]
  const window_tab_groups_map = new Map()

  // @todo toggle based on config
}

function testMultiWindowFreshInit() {
}

export default function() {
  // @todo run init on window with pinned tabs
  // @todo run update to pin a tab
  // @todo move pinned tabs
  // @todo run update to unpin a tab
  tap.test( testSingleWindowFreshInit )
  // testMultiWindowFreshInit()
}
