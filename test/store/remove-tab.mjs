import assert from 'assert'
import { base_new_tab, getInitialState } from './helpers'

import { removeTab } from '../../src/store/reducers'

function testRemoveFirstTab() {
  let state = getInitialState()

  let tab_id = state.tab_groups[ 0 ].tabs[ 0 ].id

  state = removeTab( state, { tab_id } )

  assert.equal( state.tab_groups.length, 1 )
  assert.equal( state.tab_groups[ 0 ].tabs.length, 1 )
  assert.equal( state.tab_groups[ 0 ].tabs_count, state.tab_groups[ 0 ].tabs.length )
  assert.equal( state.windows[ 0 ].tab_groups[ 0 ], state.tab_groups[ 0 ] )
}

function testRemoveLastTab() {
  let tab_groups = [
    {
      id: 1,
      name: "Group 1",
      tabs: [
        Object.assign( {}, base_new_tab, {
          id: 1,
          index: 0,
          windowId: 3
        }),
        Object.assign( {}, base_new_tab, {
          id: 2,
          index: 1,
          windowId: 3
        }),
        Object.assign( {}, base_new_tab, {
          id: 3,
          index: 2,
          windowId: 3
        })
      ],
      tabs_count: 3
    }
  ]
  let state = {
    tab_groups,
    windows: [
      {
        id: 3,
        active_tab_group_id: tab_groups[ 0 ].id,
        tab_groups: [ ...tab_groups ]
      }
    ]
  }

  let tab_id = state.tab_groups[ 0 ].tabs[ state.tab_groups[ 0 ].tabs.length - 1 ].id

  state = removeTab( state, { tab_id } )

  assert.equal( state.tab_groups.length, 1 )
  assert.equal( state.tab_groups[ 0 ].tabs.length, 2 )
  assert.equal( state.tab_groups[ 0 ].tabs_count, state.tab_groups[ 0 ].tabs.length )
  assert.equal( state.windows[ 0 ].tab_groups[ 0 ], state.tab_groups[ 0 ] )
}

export default function() {
  testRemoveFirstTab()
  testRemoveLastTab()
}
