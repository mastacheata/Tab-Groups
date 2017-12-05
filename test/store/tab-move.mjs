import assert from 'assert'
import { createTab, createTabGroup, createWindow } from './helpers'

import { moveTab } from '../../src/store/reducers'

function testSingleWindowMove() {
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
  assert.equal( state1.windows[ 0 ].tab_groups[ 0 ].tabs_count, 3 )

  // Move middle tab of group1 to end of group2
  const state2 = moveTab( initial_state, { tab_id: 2, window_id: 1, index: 4 } )
  // Counts are updated appropriately
  assert.equal( state2.windows[ 0 ].tab_groups[ 0 ].tabs_count, 2 )
  assert.equal( state2.windows[ 0 ].tab_groups[ 1 ].tabs_count, 3 )
  // Object is moved by reference
  assert.equal( state2.windows[ 0 ].tab_groups[ 1 ].tabs[ 2 ], initial_state.windows[ 0 ].tab_groups[ 0 ].tabs[ 1 ] )
}

export default function() {
  testSingleWindowMove()
}
