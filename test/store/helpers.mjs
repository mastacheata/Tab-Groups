
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

export function getInitialState() {
  const initial_state = {
    tab_groups: [
      {
        id: 1,
        name: "Group 1",
        tabs: [
          Object.assign( {}, base_new_tab, {
            id: 1,
            index: 0,
            windowId: 1
          }),
          Object.assign( {}, base_new_tab, {
            id: 2,
            index: 1,
            windowId: 1
          })
        ],
        tabs_count: 2
      }
    ]
  }

  initial_state[ 'windows' ] = [
    {
      id: 1,
      active_tab_group_id: 1,
      tab_groups: [ ...initial_state.tab_groups ]
    }
  ]

  return initial_state
}

export function getMultiWindowInitialState() {
  const initial_state = getInitialState()

  initial_state.tab_groups.push({
    id: 2,
    name: "Group 1",
    tabs: [
      Object.assign( {}, base_new_tab, {
        id: 3,
        index: 0,
        windowId: 2
      }),
      Object.assign( {}, base_new_tab, {
        id: 4,
        index: 1,
        windowId: 2
      })
    ],
    tabs_count: 2
  })

  initial_state.windows.push({
    id: 2,
    active_tab_group_id: 2,
    tab_groups: [ initial_state.tab_groups[ 1 ] ]
  })

  return initial_state
}
