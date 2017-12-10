import tap from 'tap'
import { base_new_tab, getInitialState } from './helpers'

import { activateTab } from '../../src/store/reducers'

function testSingleWindowSingleGroupActivateTab() {
  const state = getInitialState()
  const window = state.windows[ 0 ]

  const window_id = window.id
  const tab_id = window.tab_groups[ 0 ].tabs[ 1 ].id

  const new_state = activateTab( state, { tab_id, window_id } )
  const new_window = new_state.windows[ 0 ]

  tap.equal( new_window.tab_groups[ 0 ].tabs.length, 2 )
  tap.equal( new_window.tab_groups[ 0 ].tabs[ 0 ].active, false )
  tap.equal( new_window.tab_groups[ 0 ].tabs[ 1 ].active, true )
}

function testSingleWindowMultiGroupActivateTab() {
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

  tap.equal( new_window.tab_groups[ 0 ].tabs.length, 2 )
  tap.equal( new_window.tab_groups[ 0 ].tabs[ 0 ].active, false )
  tap.equal( new_window.tab_groups[ 0 ].tabs[ 1 ].active, false )
  tap.equal( new_window.tab_groups[ 1 ].tabs[ 0 ].active, false )
  tap.equal( new_window.tab_groups[ 1 ].tabs[ 1 ].active, true )
}

export default function() {
  testSingleWindowSingleGroupActivateTab()
  testSingleWindowMultiGroupActivateTab()
}
