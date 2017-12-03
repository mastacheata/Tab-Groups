import assert from 'assert'

import { init } from '../../src/store/reducers'

// Test initialization for single window

const tabs = [
  {
    id: 1,
    index: 0,
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
  },
  {
    id: 2,
    index: 1,
    windowId: 3,
    highlighted: true,
    active: true,
    pinned: false,
    status: "complete",
    discarded: false,
    incognito: false,
    width: 1918,
    height: 968,
    lastAccessed: 1510531664937,
    audible: false,
    mutedInfo: { muted: false },
    isArticle: false,
    isInReaderMode: false,
    url: "about:debugging",
    title: "Debugging with Firefox Developer Tools"
  }
]
const tab_groups = []
const tab_group_id_map = new Map()
const window_active_tab_group_id_map = new Map()

export default function() {
  let initial_state = init( null, { tabs, tab_groups, tab_group_id_map, window_active_tab_group_id_map })
  assert.equal( initial_state.tab_groups.length, 1 )
  assert.equal( initial_state.tab_groups[ 0 ].id, 1 )
  assert.equal( initial_state.tab_groups[ 0 ].name, "Group 1" )
  assert.equal( initial_state.tab_groups[ 0 ].tabs.length, 2 )
  assert.equal( initial_state.tab_groups[ 0 ].tabs_count, initial_state.tab_groups[ 0 ].tabs.length )
  assert.equal( initial_state.windows.length, 1 )
  assert.equal( initial_state.windows[ 0 ].active_tab_group_id, initial_state.tab_groups[ 0 ].id )
  assert.equal( initial_state.windows[ 0 ].tab_groups[ 0 ], initial_state.tab_groups[ 0 ] )
}
