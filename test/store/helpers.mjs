
export function getInitialState() {
  const initial_state = {
    tab_groups: [
      {
        id: 1,
        name: "Group 1",
        tabs: [
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
