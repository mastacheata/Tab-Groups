import assert from 'assert'
import { base_new_tab } from './helpers'

import { init } from '../../src/store/reducers'

function testSingleWindowFreshInit() {
  const tabs = [
    Object.assign( {}, base_new_tab, {
      id: 1,
      index: 0,
      windowId: 1
    }),
    Object.assign( {}, base_new_tab, {
      id: 2,
      index: 1,
      windowId: 1
    })
  ]
  const tab_groups = []
  const tab_group_id_map = new Map()
  const window_active_tab_group_id_map = new Map()

  let initial_state = init( null, { tabs, tab_groups, tab_group_id_map, window_active_tab_group_id_map })
  // assert.equal( initial_state.tab_groups.length, 1 )
  // assert.equal( initial_state.tab_groups[ 0 ].id, 1 )
  // assert.equal( initial_state.tab_groups[ 0 ].name, "Group 1" )
  // assert.equal( initial_state.tab_groups[ 0 ].tabs.length, 2 )
  // assert.equal( initial_state.tab_groups[ 0 ].tabs_count, initial_state.tab_groups[ 0 ].tabs.length )
  assert.equal( initial_state.windows.length, 1 )
  // assert.equal( initial_state.windows[ 0 ].active_tab_group_id, initial_state.tab_groups[ 0 ].id )
  // assert.equal( initial_state.windows[ 0 ].tab_groups[ 0 ], initial_state.tab_groups[ 0 ] )
}

function testMultiWindowFreshInit() {
  const tabs = [
    Object.assign( {}, base_new_tab, {
      id: 1,
      index: 0,
      windowId: 1
    }),
    Object.assign( {}, base_new_tab, {
      id: 2,
      index: 1,
      windowId: 1
    }),
    Object.assign( {}, base_new_tab, {
      id: 3,
      index: 0,
      windowId: 2
    }),
    Object.assign( {}, base_new_tab, {
      id: 4,
      index: 1,
      windowId: 2
    })
  ]
  const tab_groups = []
  const tab_group_id_map = new Map()
  const window_active_tab_group_id_map = new Map()

  let initial_state = init( null, { tabs, tab_groups, tab_group_id_map, window_active_tab_group_id_map })

  // assert.equal( initial_state.tab_groups.length, 2 )
  // assert.equal( initial_state.tab_groups[ 0 ].id, 1 )
  // assert.equal( initial_state.tab_groups[ 0 ].name, "Group 1" )
  // assert.equal( initial_state.tab_groups[ 0 ].tabs.length, 2 )
  // assert.equal( initial_state.tab_groups[ 0 ].tabs_count, initial_state.tab_groups[ 0 ].tabs.length )
  // assert.equal( initial_state.tab_groups[ 1 ].id, 2 )
  // // @todo may want to use Group 1 instead
  // assert.equal( initial_state.tab_groups[ 1 ].name, "Group 2" )
  // assert.equal( initial_state.tab_groups[ 1 ].tabs.length, 2 )
  // assert.equal( initial_state.tab_groups[ 1 ].tabs_count, initial_state.tab_groups[ 1 ].tabs.length )

  assert.equal( initial_state.windows.length, 2 )
  // assert.equal( initial_state.windows[ 0 ].active_tab_group_id, initial_state.tab_groups[ 0 ].id )
  // assert.equal( initial_state.windows[ 0 ].tab_groups[ 0 ], initial_state.tab_groups[ 0 ] )
  // assert.equal( initial_state.windows[ 1 ].tab_groups[ 0 ], initial_state.tab_groups[ 1 ] )
}

export default function() {
  testSingleWindowFreshInit()
  testMultiWindowFreshInit()
}
