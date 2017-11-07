
export function loadInitialState({ tabs, tab_groups, tab_group_id_map, window_active_tab_group_id_map }) {
  const initial_state = {
    windows: [
      /*
      id,
      active_tab_group_id,
      tab_groups: [
        {
          id,
          name,
          active_tab_id,
          tabs,
        }
      ]
      */
    ]
  }

  return initial_state
}
