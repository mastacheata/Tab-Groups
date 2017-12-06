import assert from 'assert'
import { base_new_tab, getInitialState, getMultiWindowInitialState } from './helpers'

import { addWindow } from '../../src/store/reducers'

function testSingleWindowAdd() {
  let state = {
    orphan_tabs: [],
    windows: []
  }

  state = addWindow( state, { window: { id: 1 } } )

  assert.equal( state.windows.length, 1 )
  assert.equal( state.windows[ 0 ].id, 1 )

  state = addWindow( state, { window: { id: 2 } } )

  assert.equal( state.windows.length, 2 )
  assert.equal( state.windows[ 1 ].id, 2 )
}

export default function() {
  testSingleWindowAdd()
}
