
export const base_new_tab = {
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

import { createWindow, createTabGroup } from '../../src/store/helpers.mjs'

export function createTab( tab ) {
  return Object.assign( {}, base_new_tab, tab )
}

export function getInitialState() {
  const initial_state = {
    orphan_tabs: [],
    windows: [
      createWindow( 1, [
        createTabGroup( 1, [
          createTab({
            id: 1,
            active: true
          }),
          createTab({
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
        createTab({
          id: 3,
          active: true
        }),
        createTab({
          id: 4
        })
      ])
    ])
  )

  return initial_state
}
