import { createBrowserTab } from './helpers'

import { init } from '../../src/store/reducers'

function testSingleWindowFreshInit( t ) {
  const browser_tabs = [
    createBrowserTab({
      id: 1,
      index: 0,
      windowId: 1
    }),
    createBrowserTab({
      id: 2,
      index: 1,
      windowId: 1
    })
  ]
  const window_tab_groups_map = new Map()

  let initial_state = init( null, { browser_tabs, window_tab_groups_map })
  t.equal( initial_state.windows[ 0 ].tab_groups.length, 1 )
  t.equal( initial_state.windows[ 0 ].tab_groups[ 0 ].id, 1 )
  t.equal( initial_state.windows[ 0 ].tab_groups[ 0 ].title, "Group 1" )
  t.equal( initial_state.windows[ 0 ].tab_groups[ 0 ].tabs.length, 2 )
  t.equal( initial_state.windows[ 0 ].tab_groups[ 0 ].tabs_count, initial_state.windows[ 0 ].tab_groups[ 0 ].tabs.length )
  t.equal( initial_state.windows.length, 1 )
  t.equal( initial_state.windows[ 0 ].active_tab_group_id, initial_state.windows[ 0 ].tab_groups[ 0 ].id )
  t.end()
}

function testMultiWindowFreshInit( t ) {
  const browser_tabs = [
    createBrowserTab({
      id: 1,
      index: 0,
      windowId: 1
    }),
    createBrowserTab({
      id: 2,
      index: 1,
      windowId: 1
    }),
    createBrowserTab({
      id: 3,
      index: 0,
      windowId: 2
    }),
    createBrowserTab({
      id: 4,
      index: 1,
      windowId: 2
    })
  ]
  const window_tab_groups_map = new Map()

  let initial_state = init( null, { browser_tabs, window_tab_groups_map })

  t.equal( initial_state.windows.length, 2 )

  t.equal( initial_state.windows[ 0 ].tab_groups[ 0 ].id, 1 )
  t.equal( initial_state.windows[ 0 ].tab_groups[ 0 ].title, "Group 1" )
  t.equal( initial_state.windows[ 0 ].tab_groups[ 0 ].tabs.length, 2 )
  t.equal( initial_state.windows[ 0 ].tab_groups[ 0 ].tabs_count, initial_state.windows[ 0 ].tab_groups[ 0 ].tabs.length )
  t.equal( initial_state.windows[ 0 ].active_tab_group_id, initial_state.windows[ 0 ].tab_groups[ 0 ].id )

  t.equal( initial_state.windows[ 1 ].tab_groups[ 0 ].id, 2 )
  // @todo may want to use Group 1 instead
  t.equal( initial_state.windows[ 1 ].tab_groups[ 0 ].title, "Group 2" )
  t.equal( initial_state.windows[ 1 ].tab_groups[ 0 ].tabs.length, 2 )
  t.equal( initial_state.windows[ 1 ].tab_groups[ 0 ].tabs_count, initial_state.windows[ 1 ].tab_groups[ 0 ].tabs.length )
  t.equal( initial_state.windows[ 1 ].active_tab_group_id, initial_state.windows[ 1 ].tab_groups[ 0 ].id )
  t.end()
}

export default function testInit( tap ) {
  tap.test( testSingleWindowFreshInit )
  tap.test( testMultiWindowFreshInit )
  tap.end()
}
