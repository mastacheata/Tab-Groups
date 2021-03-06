import {
  createTestTab,
  getInitialState,
  validateState,
} from './helpers.mjs'

import { createTabGroup } from '../../src/store/helpers.mjs'
import { activateTab } from '../../src/store/reducers.mjs'

function testSingleWindowSingleGroupActivateTab( t ) {
  const state = getInitialState()
  const window = state.windows[ 0 ]

  const window_id = window.id
  const tab_id = window.tab_groups[ 1 ].tabs[ 1 ].id

  const new_state = activateTab( state, { tab_id, window_id } )
  t.ok( validateState( new_state ), "new_state validates", validateState.errors )
  const new_window = new_state.windows[ 0 ]

  t.equal( new_window.tab_groups[ 1 ].tabs.length, 2 )
  t.equal( new_window.tab_groups[ 1 ].active_tab_id, tab_id )
  t.end()
}

function testSingleWindowMultiGroupActivateTab( t ) {
  const state = getInitialState()
  const window = state.windows[ 0 ]

  const last_tab = window.tab_groups[ 1 ].tabs[ window.tab_groups[ 1 ].tabs.length - 1 ]

  window.tab_groups.push( createTabGroup( window.tab_groups[ 1 ].id + 1, [
    createTestTab({
      id: last_tab.id + 1
    }),
    createTestTab({
      id: last_tab.id + 2
    })
  ]))

  const window_id = window.id
  const tab_id = window.tab_groups[ 2 ].tabs[ 1 ].id

  const new_state = activateTab( state, { tab_id, window_id } )
  t.ok( validateState( new_state ), "new_state validates", validateState.errors )
  const new_window = new_state.windows[ 0 ]

  t.equal( new_window.tab_groups[ 2 ].tabs.length, 2 )
  t.equal( new_window.tab_groups[ 2 ].active_tab_id, tab_id )
  t.end()
}

export default function( tap ) {
  tap.test( testSingleWindowSingleGroupActivateTab )
  tap.test( testSingleWindowMultiGroupActivateTab )
  tap.end()
}
