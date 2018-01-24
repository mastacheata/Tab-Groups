import {
  createBrowserTab,
  createTestTab,
  getInitialState,
  getMultiWindowInitialState,
} from './helpers'

import { addTab } from '../../src/store/reducers'

function testSingleWindowAdd( t ) {
  let state = getInitialState()

  let tab_group_id = state.windows[ 0 ].tab_groups[ 0 ].id
  let browser_tab = createBrowserTab({
    id: 3,
    index: 2,
    windowId: state.windows[ 0 ].id
  })

  state = addTab( state, { tab_group_id, browser_tab } )

  t.equal( state.windows[ 0 ].tab_groups.length, 1 )
  t.equal( state.windows[ 0 ].tab_groups[ 0 ].tabs.length, 3 )
  t.end()
}

function testMultiWindowAdd( t ) {
  let state = getMultiWindowInitialState()

  // let tab_group_id = state.tab_groups[ 1 ].id
  let browser_tab = createBrowserTab({
    id: 5,
    index: 2,
    windowId: state.windows[ 1 ].id
  })

  state = addTab( state, { browser_tab } )

  t.equal( state.windows[ 0 ].tab_groups[ 0 ].tabs.length, 2 )
  t.equal( state.windows[ 0 ].tab_groups[ 0 ].tabs_count, state.windows[ 0 ].tab_groups[ 0 ].tabs.length )
  t.equal( state.windows[ 1 ].tab_groups[ 0 ].tabs.length, 3 )
  t.equal( state.windows[ 1 ].tab_groups[ 0 ].tabs_count, state.windows[ 1 ].tab_groups[ 0 ].tabs.length )
  t.end()
}

export default function( tap ) {
  tap.test( testSingleWindowAdd )
  tap.test( testMultiWindowAdd )
  tap.end()
}
