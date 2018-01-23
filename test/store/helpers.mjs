import tap from 'tap'

import { getTabState } from '../../src/integrations/index.mjs'
import {
  createWindow,
  createTabGroup,
  findTab,
} from '../../src/store/helpers.mjs'

export const base_new_browser_tab = {
  id: null,
  // index: null,
  // windowId: null,
  highlighted: false,
  active: false,
  pinned: false,
  status: "complete",
  discarded: false,
  incognito: false,
  width: 1278,
  height: 968,
  lastAccessed: 1512330352266,
  audible: false,
  mutedInfo: { muted: false },
  isArticle: false,
  isInReaderMode: false,
  url: "about:blank",
  title: "New Tab"
}

export const base_new_tab = getTabState( base_new_browser_tab )

export function createBrowserTab( tab ) {
  return Object.assign( {}, base_new_browser_tab, tab )
}

export function createTestTab( tab ) {
  return Object.assign( {}, base_new_tab, tab )
}

export function getInitialState() {
  const initial_state = {
    orphan_tabs: [],
    windows: [
      createWindow( 1, [
        createTabGroup( 1, [
          createTestTab({
            id: 1,
            active: true
          }),
          createTestTab({
            id: 2
          })
        ])
      ])
    ]
  }

  return initial_state
}

export function getMultiWindowInitialState() {
  const initial_state = getInitialState()

  initial_state.windows.push(
    createWindow( 2, [
      createTabGroup( 2, [
        createTestTab({
          id: 3,
          active: true
        }),
        createTestTab({
          id: 4
        })
      ])
    ])
  )

  return initial_state
}

function testFindTab( t ) {
  let state = getInitialState()
  let tab = findTab( state, state.windows[ 0 ].id, state.windows[ 0 ].tab_groups[ 0 ].tabs[ 0 ].id )
  t.end()
}

export default function() {
  tap.test( testFindTab )
}
