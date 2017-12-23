import tap from 'tap'
import { base_new_tab, getInitialState, getMultiWindowInitialState } from './helpers'

import { startWindowSearch, finishWindowSearch } from '../../src/store/reducers'

function testSingleWindowSearch() {
  let state = getInitialState()
  let search_text = 'test'

  state = startWindowSearch( state, { window_id: state.windows[ 0 ].id, search_text } )

  tap.equal( state.windows[ 0 ].search_text, search_text )
  tap.equal( state.windows[ 0 ].search_resolved, false )

  let matching_tab_ids = [ state.windows[ 0 ].tab_groups[ 0 ].tabs[ 0 ].id ]
  state = finishWindowSearch( state, { window_id: state.windows[ 0 ].id, search_text, matching_tab_ids })

  tap.equal( state.windows[ 0 ].search_text, search_text )
  tap.equal( state.windows[ 0 ].search_resolved, true )
  tap.equal( state.windows[ 0 ].tab_groups[ 0 ].tabs[ 0 ].is_matched, true )
  tap.equal( state.windows[ 0 ].tab_groups[ 0 ].tabs[ 1 ].is_matched, undefined )
}

export default function() {
  testSingleWindowSearch()
}
