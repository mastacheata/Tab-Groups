import { createTestTab } from './helpers'
import { createTabGroup, createWindow } from '../../src/store/helpers.mjs'

import { moveTabs } from '../../src/store/reducers'

function testSingleWindowMoveOne( t ) {
  const initial_state = {
    windows: [
      createWindow( 1, [
        createPinnedTabGroup( [] ),
        createTabGroup( 2, [
          createTestTab({ id: 4 }),
          createTestTab({ id: 5 }),
          createTestTab({ id: 6 })
        ]),
        createTabGroup( 3, [
          createTestTab({ id: 7 }),
          createTestTab({ id: 8 })
        ])
      ])
    ]
  }

  // Move middle tab of group1 to end of group1
  let source_tabs_data = {
    window_id: 1,
    tab_ids: [ 4, 5 ]
  }
  let target_data = {
    window_id: 1
  }
  const state1 = moveTabs( initial_state, { source_tabs_data, target_data } )
  t.end()
}

export default function( tap ) {
  tap.test( testSingleWindowMoveOne )
  tap.end()
}
