import tap from 'tap'
import { createTab } from './helpers'

import { init } from '../../src/store/reducers'

function testSingleWindowFreshInit() {
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

  let initial_state = init( null, { tabs, window_tab_groups_map })
  tap.equal( initial_state.windows[ 0 ].tab_groups.length, 1 )
  tap.equal( initial_state.windows[ 0 ].tab_groups[ 0 ].id, 1 )
  tap.equal( initial_state.windows[ 0 ].tab_groups[ 0 ].title, "Group 1" )
  tap.equal( initial_state.windows[ 0 ].tab_groups[ 0 ].tabs.length, 2 )
  tap.equal( initial_state.windows[ 0 ].tab_groups[ 0 ].tabs_count, initial_state.windows[ 0 ].tab_groups[ 0 ].tabs.length )
  tap.equal( initial_state.windows.length, 1 )
  tap.equal( initial_state.windows[ 0 ].active_tab_group_id, initial_state.windows[ 0 ].tab_groups[ 0 ].id )
}

function testMultiWindowFreshInit() {
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
    }),
    createTab({
      id: 3,
      index: 0,
      windowId: 2
    }),
    createTab({
      id: 4,
      index: 1,
      windowId: 2
    })
  ]
  const window_tab_groups_map = new Map()

  let initial_state = init( null, { tabs, window_tab_groups_map })

  tap.equal( initial_state.windows.length, 2 )

  tap.equal( initial_state.windows[ 0 ].tab_groups[ 0 ].id, 1 )
  tap.equal( initial_state.windows[ 0 ].tab_groups[ 0 ].title, "Group 1" )
  tap.equal( initial_state.windows[ 0 ].tab_groups[ 0 ].tabs.length, 2 )
  tap.equal( initial_state.windows[ 0 ].tab_groups[ 0 ].tabs_count, initial_state.windows[ 0 ].tab_groups[ 0 ].tabs.length )
  tap.equal( initial_state.windows[ 0 ].active_tab_group_id, initial_state.windows[ 0 ].tab_groups[ 0 ].id )

  tap.equal( initial_state.windows[ 1 ].tab_groups[ 0 ].id, 2 )
  // @todo may want to use Group 1 instead
  tap.equal( initial_state.windows[ 1 ].tab_groups[ 0 ].title, "Group 2" )
  tap.equal( initial_state.windows[ 1 ].tab_groups[ 0 ].tabs.length, 2 )
  tap.equal( initial_state.windows[ 1 ].tab_groups[ 0 ].tabs_count, initial_state.windows[ 1 ].tab_groups[ 0 ].tabs.length )
  tap.equal( initial_state.windows[ 1 ].active_tab_group_id, initial_state.windows[ 1 ].tab_groups[ 0 ].id )
}

export default function() {
  testSingleWindowFreshInit()
  testMultiWindowFreshInit()
}
