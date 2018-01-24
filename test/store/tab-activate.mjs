import { base_new_tab, getInitialState } from './helpers'

import { activateTab } from '../../src/store/reducers'

function testSingleWindowSingleGroupActivateTab( t ) {
  const state = getInitialState()
  const window = state.windows[ 0 ]

  const window_id = window.id
  const tab_id = window.tab_groups[ 0 ].tabs[ 1 ].id

  const new_state = activateTab( state, { tab_id, window_id } )
  const new_window = new_state.windows[ 0 ]

  t.equal( new_window.tab_groups[ 0 ].tabs.length, 2 )
  t.equal( new_window.tab_groups[ 0 ].tabs[ 0 ].is_active, false )
  t.equal( new_window.tab_groups[ 0 ].tabs[ 1 ].is_active, true )
  t.end()
}

function testSingleWindowMultiGroupActivateTab( t ) {
  const state = getInitialState()
  const window = state.windows[ 0 ]

  const last_tab = window.tab_groups[ 0 ].tabs[ window.tab_groups[ 0 ].tabs.length - 1 ]

  window.tab_groups.push({
    id: window.tab_groups[ 0 ].id + 1,
    name: `Group ${ window.tab_groups[ 0 ].id + 1 }`,
    tabs: [
      Object.assign( {}, base_new_tab, {
        id: last_tab.id + 1,
        index: last_tab.index + 1,
        windowId: window.id
      }),
      Object.assign( {}, base_new_tab, {
        id: last_tab.id + 2,
        index: last_tab.id + 2,
        windowId: window.id
      })
    ],
    tabs_count: 2
  })

  const window_id = window.id
  const tab_id = window.tab_groups[ 1 ].tabs[ 1 ].id

  const new_state = activateTab( state, { tab_id, window_id } )
  const new_window = new_state.windows[ 0 ]

  t.equal( new_window.tab_groups[ 0 ].tabs.length, 2 )
  t.equal( new_window.tab_groups[ 0 ].tabs[ 0 ].is_active, false )
  t.equal( new_window.tab_groups[ 0 ].tabs[ 1 ].is_active, false )
  t.equal( new_window.tab_groups[ 1 ].tabs[ 0 ].is_active, false )
  t.equal( new_window.tab_groups[ 1 ].tabs[ 1 ].is_active, true )
  t.end()
}

export default function( tap ) {
  tap.test( testSingleWindowSingleGroupActivateTab )
  tap.test( testSingleWindowMultiGroupActivateTab )
  tap.end()
}
