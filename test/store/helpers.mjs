
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
            windowId: 3
          }),
          Object.assign( {}, base_new_tab, {
            id: 2,
            index: 1,
            windowId: 3
          })
        ],
        tabs_count: 2
      }
    ]
  }

  initial_state[ 'windows' ] = [
    {
      id: 3,
      active_tab_group_id: 1,
      tab_groups: [ ...initial_state.tab_groups ]
    }
  ]

  return initial_state
}
