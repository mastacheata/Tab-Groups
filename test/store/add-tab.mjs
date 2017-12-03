import assert from 'assert'
import { getInitialState } from './helpers'

import { addTab } from '../../src/store/reducers'

export default function() {
  let state = getInitialState()

  let tab_group_id = state.tab_groups[ 0 ].id
  let tab = {
    id: 3,
    index: 2,
    windowId: 3,
    highlighted: false,
    active: false,
    pinned: false,
    status: "complete",
    discarded: false,
    incognito: false,
    width: 1918,
    height: 968,
    lastAccessed: 1510531570549,
    audible: false,
    mutedInfo: { muted: false },
    isArticle: false,
    isInReaderMode: false,
    url: "about:blank",
    title: "New Tab"
  }

  state = addTab( state, { tab_group_id, tab } )

  assert.equal( state.tab_groups.length, 1 )
  assert.equal( state.tab_groups[ 0 ].tabs.length, 3 )
  assert.equal( state.tab_groups[ 0 ].tabs_count, state.tab_groups[ 0 ].tabs.length )
  assert.equal( state.windows[ 0 ].tab_groups[ 0 ], state.tab_groups[ 0 ] )
}
