import { base_new_tab, getInitialState, getMultiWindowInitialState } from './helpers'

import { addWindow } from '../../src/store/reducers'

function testSingleWindowAdd( t ) {
  let state = {
    orphan_tabs: [],
    windows: []
  }

  state = addWindow( state, { window: { id: 1 } } )

  t.equal( state.windows.length, 1 )
  t.equal( state.windows[ 0 ].id, 1 )

  state = addWindow( state, { window: { id: 2 } } )

  t.equal( state.windows.length, 2 )
  t.equal( state.windows[ 1 ].id, 2 )
  t.end()
}

export default function( tap ) {
  tap.test( testSingleWindowAdd )
  tap.end()
}
