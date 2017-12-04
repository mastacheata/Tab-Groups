import assert from 'assert'
import { base_new_tab, getInitialState, getMultiWindowInitialState } from './helpers'

import { addTab } from '../../src/store/reducers'

function testSingleWindowAdd() {
  let state = getInitialState()

  let tab_group_id = state.tab_groups[ 0 ].id
  let tab = Object.assign( {}, base_new_tab, {
    id: 3,
    index: 2,
    windowId: 3
  })

  state = addTab( state, { tab_group_id, tab } )

  assert.equal( state.tab_groups.length, 1 )
  assert.equal( state.tab_groups[ 0 ].tabs.length, 3 )
  assert.equal( state.tab_groups[ 0 ].tabs_count, state.tab_groups[ 0 ].tabs.length )
  assert.equal( state.windows[ 0 ].tab_groups[ 0 ], state.tab_groups[ 0 ] )
}

function testMultiWindowAdd() {
  let state = getMultiWindowInitialState()

  let tab_group_id = state.tab_groups[ 1 ].id
  let tab = Object.assign( {}, base_new_tab, {
    id: 5,
    index: 2,
    windowId: state.windows[ 1 ].id
  })

  state = addTab( state, { tab } )

  assert.equal( state.tab_groups.length, 2 )
  assert.equal( state.tab_groups[ 0 ].tabs.length, 2 )
  assert.equal( state.tab_groups[ 0 ].tabs_count, state.tab_groups[ 0 ].tabs.length )
  assert.equal( state.tab_groups[ 1 ].tabs.length, 3 )
  assert.equal( state.tab_groups[ 1 ].tabs_count, state.tab_groups[ 1 ].tabs.length )
  assert.equal( state.windows[ 1 ].tab_groups[ 0 ], state.tab_groups[ 1 ] )
}

export default function() {
  testSingleWindowAdd()
  testMultiWindowAdd()
}
