import {
  getInitialState,
  getMultiWindowInitialState,
} from './helpers.mjs'

import {
  startWindowSearch,
  finishWindowSearch,
} from '../../src/store/reducers.mjs'

function testSingleWindowSearch( t ) {
  let state = getInitialState()
  let search_text = 'test'

  state = startWindowSearch( state, { window_id: state.windows[ 0 ].id, search_text } )

  t.equal( state.windows[ 0 ].search_text, search_text )
  t.equal( state.windows[ 0 ].search_resolved, false )

  let matching_tab_ids = [ state.windows[ 0 ].tab_groups[ 1 ].tabs[ 0 ].id ]
  state = finishWindowSearch( state, { window_id: state.windows[ 0 ].id, search_text, matching_tab_ids })

  t.equal( state.windows[ 0 ].search_text, search_text )
  t.equal( state.windows[ 0 ].search_resolved, true )
  t.equal( state.windows[ 0 ].tab_groups[ 1 ].tabs[ 0 ].is_matched, true )
  t.equal( state.windows[ 0 ].tab_groups[ 1 ].tabs[ 1 ].is_matched, undefined )
  t.end()
}

export default function( tap ) {
  tap.test( testSingleWindowSearch )
  tap.end()
}
