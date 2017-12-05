
export const base_new_tab = {
  id: null,
  index: null,
  windowId: null,
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

export function createWindow( window_id, tab_groups ) {
  // @todo scan through tabs in tab_groups and update windowId and index
  return {
    id: window_id,
    active_tab_group_id: tab_groups[ 0 ].id,
    tab_groups: tab_groups
  }
}

export function createTabGroup( tab_group_id, tabs ) {
  return {
    id: tab_group_id,
    name: `Group ${ tab_group_id }`,
    tabs,
    tabs_count: tabs.length
  }
}

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
            index: 0,
            windowId: 1,
            active: true
          }),
          createTab({
            id: 2,
            index: 1,
            windowId: 1
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
          index: 0,
          windowId: 2,
          active: true
        }),
        createTab({
          id: 4,
          index: 1,
          windowId: 2
        })
      ])
    ])
  )

  return initial_state
}
