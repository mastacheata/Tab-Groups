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
  const initial_state = init( null, { tabs, tab_groups, tab_group_id_map, window_active_tab_group_id_map })
  console.info( 'loadInitialState', JSON.stringify( initial_state ) )
}
