import tap from 'tap'
import { createTab } from './helpers'
import { createTabGroup, createWindow } from '../../src/store/helpers.mjs'

import { moveTab } from '../../src/store/reducers'

function testSingleWindowMove( t ) {
  const initial_state = {
    windows: [
      createWindow( 1, [
        createTabGroup( 1, [
          createTab({ id: 1 }),
          createTab({ id: 2 }),
          createTab({ id: 3 })
        ]),
        createTabGroup( 2, [
          createTab({ id: 4 }),
          createTab({ id: 5 })
        ])
      ])
    ]
  }

  // Move middle tab of group1 to end of group1
  const state1 = moveTab( initial_state, { tab_id: 2, window_id: 1, index: 2 } )
  t.equal( state1.windows[ 0 ].tab_groups[ 0 ].tabs_count, 3 )

  // Move middle tab of group1 to end of group2
  const state2 = moveTab( initial_state, { tab_id: 2, window_id: 1, index: 4 } )
  // Counts are updated appropriately
  t.equal( state2.windows[ 0 ].tab_groups[ 0 ].tabs_count, 2 )
  t.equal( state2.windows[ 0 ].tab_groups[ 1 ].tabs_count, 3 )
  // Object is moved by reference
  t.equal( state2.windows[ 0 ].tab_groups[ 1 ].tabs[ 2 ], initial_state.windows[ 0 ].tab_groups[ 0 ].tabs[ 1 ] )
  t.end()
}

function testMoveToNewGroup( t ) {
  const initial_state = {
    pinned_tabs: [],
    windows: [
      createWindow( 1, [
        createTabGroup( 1, [
          createTab({ id: 1 }),
          createTab({ id: 2 }),
          createTab({ id: 3 })
        ]),
        createTabGroup( 2, [
        ])
      ])
    ]
  }
  // Move middle tab of group1 to group2
  const state1 = moveTab( initial_state, { tab_id: 2, window_id: 1, tab_group_id: 2 } )
  t.equal( state1.windows[ 0 ].tab_groups[ 0 ].tabs_count, 2 )
  t.equal( state1.windows[ 0 ].tab_groups[ 1 ].tabs_count, 1 )
  t.equal( initial_state.windows[ 0 ].tab_groups[ 0 ].tabs[ 1 ], state1.windows[ 0 ].tab_groups[ 1 ].tabs[ 0 ] )

  // Move middle tab of group1 to end of group2
  const state2 = moveTab( state1, { tab_id: 2, window_id: 1, index: 2 } )
  // There should be no update
  t.equal( state2.windows[ 0 ].tab_groups[ 0 ].tabs_count, 2 )
  t.equal( state2.windows[ 0 ].tab_groups[ 1 ].tabs_count, 1 )
  // Object reference is maintained
  t.equal( state2.windows[ 0 ].tab_groups[ 1 ], state1.windows[ 0 ].tab_groups[ 1 ] )
  t.end()
}

export default function() {
  tap.test( testSingleWindowMove )
  tap.test( testMoveToNewGroup )
}
