import tap from 'tap'
import { base_new_tab, getInitialState, getMultiWindowInitialState } from './helpers'

import { addTab } from '../../src/store/reducers'

function testSingleWindowAdd() {
  let state = getInitialState()

  let tab_group_id = state.windows[ 0 ].tab_groups[ 0 ].id
  let tab = Object.assign( {}, base_new_tab, {
    id: 3,
    index: 2,
    windowId: state.windows[ 0 ].id
  })

  state = addTab( state, { tab_group_id, tab } )

  tap.equal( state.windows[ 0 ].tab_groups.length, 1 )
  tap.equal( state.windows[ 0 ].tab_groups[ 0 ].tabs.length, 3 )
}

function testMultiWindowAdd() {
  let state = getMultiWindowInitialState()

  // let tab_group_id = state.tab_groups[ 1 ].id
  let tab = Object.assign( {}, base_new_tab, {
    id: 5,
    index: 2,
    windowId: state.windows[ 1 ].id
  })

  state = addTab( state, { tab } )

  // tap.equal( state.tab_groups.length, 2 )
  // tap.equal( state.tab_groups[ 0 ].tabs.length, 2 )
  // tap.equal( state.tab_groups[ 0 ].tabs_count, state.tab_groups[ 0 ].tabs.length )
  // tap.equal( state.tab_groups[ 1 ].tabs.length, 3 )
  // tap.equal( state.tab_groups[ 1 ].tabs_count, state.tab_groups[ 1 ].tabs.length )
  // tap.equal( state.windows[ 1 ].tab_groups[ 0 ], state.tab_groups[ 1 ] )
}

export default function() {
  testSingleWindowAdd()
  testMultiWindowAdd()
}
