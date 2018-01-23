import tap from 'tap'
import { createTestTab, getInitialState } from './helpers'

import { removeTab } from '../../src/store/reducers'
import { createWindow, createTabGroup } from '../../src/store/helpers'

function testRemoveFirstTab() {
  let state = getInitialState()

  let tab_id = state.windows[ 0 ].tab_groups[ 0 ].tabs[ 0 ].id

  state = removeTab( state, { tab_id, window_id: state.windows[ 0 ].id } )

  tap.equal( state.windows[ 0 ].tab_groups.length, 1 )
  tap.equal( state.windows[ 0 ].tab_groups[ 0 ].tabs.length, 1 )
  tap.equal( state.windows[ 0 ].tab_groups[ 0 ].tabs_count, state.windows[ 0 ].tab_groups[ 0 ].tabs.length )
}

function testRemoveMiddleTab() {
  const window_id = 1
  let state = {
    windows: [
      createWindow( window_id, [
        createTabGroup( 1, [
          createTestTab({
            id: 1,
            index: 0
          }),
          createTestTab({
            id: 2,
            index: 1
          }),
          createTestTab({
            id: 3,
            index: 2
          })
        ])
      ])
    ]
  }

  let tab_id = state.windows[ 0 ].tab_groups[ 0 ].tabs[ 1 ].id

  state = removeTab( state, { tab_id, window_id } )

  tap.equal( state.windows[ 0 ].tab_groups.length, 1 )
  tap.equal( state.windows[ 0 ].tab_groups[ 0 ].tabs.length, 2 )
  tap.equal( state.windows[ 0 ].tab_groups[ 0 ].tabs_count, state.windows[ 0 ].tab_groups[ 0 ].tabs.length )
}

function testRemoveLastTab() {
  let window_id = 1
  let state = {
    windows: [
      createWindow( window_id, [
        createTabGroup( 1, [
          createTestTab({
            id: 1,
            index: 0
          }),
          createTestTab({
            id: 2,
            index: 1
          }),
          createTestTab({
            id: 3,
            index: 2
          })
        ])
      ])
    ]
  }

  let tab_id = state.windows[ 0 ].tab_groups[ 0 ].tabs[ state.windows[ 0 ].tab_groups[ 0 ].tabs.length - 1 ].id

  state = removeTab( state, { tab_id, window_id } )

  tap.equal( state.windows[ 0 ].tab_groups.length, 1 )
  tap.equal( state.windows[ 0 ].tab_groups[ 0 ].tabs.length, 2 )
  tap.equal( state.windows[ 0 ].tab_groups[ 0 ].tabs_count, state.windows[ 0 ].tab_groups[ 0 ].tabs.length )
}

export default function() {
  testRemoveFirstTab()
  testRemoveMiddleTab()
  testRemoveLastTab()
}
