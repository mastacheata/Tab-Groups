import {
  INIT,
  CONFIG_UPDATE,
  WINDOW_ADD,
  WINDOW_REMOVE,
  WINDOW_SEARCH_START,
  WINDOW_SEARCH_FINISH,
  GROUP_ACTIVATE,
  GROUP_CREATE,
  GROUP_REMOVE,
  GROUP_UPDATE,
  GROUP_MOVE,
  TABS_MOVE,
  TAB_ACTIVATE,
  TAB_ADD,
  TAB_REMOVE,
  TAB_UPDATE,
  TAB_UPDATE_IMAGE,
  TAB_MOVE,
  TAB_ATTACH,
  TAB_DETACH,
} from './action-types.mjs'

export function initAction({ browser_tabs, window_tab_groups_map }) {
  return {
    type: INIT,
    browser_tabs,
    window_tab_groups_map
  }
}

export function addWindowAction( window ) {
  return {
    type: WINDOW_ADD,
    window
  }
}

export function removeWindowAction( window_id ) {
  return {
    type: WINDOW_REMOVE,
    window_id
  }
}

export function activateGroupAction( tab_group_id, window_id ) {
  return {
    type: GROUP_ACTIVATE,
    tab_group_id,
    window_id
  }
}

export function createGroupAction( window_id ) {
  return {
    type: GROUP_CREATE,
    window_id
  }
}

export function removeGroupAction( tab_group_id, window_id ) {
  return {
    type: GROUP_REMOVE,
    tab_group_id,
    window_id
  }
}

export function updateGroupAction( tab_group_id, window_id, change_info ) {
  return {
    type: GROUP_UPDATE,
    tab_group_id,
    window_id,
    change_info
  }
}

export function moveGroupAction( tab_group_id, window_id, index ) {
  return {
    type: GROUP_MOVE,
    tab_group_id,
    window_id,
    index
  }
}

export function activateTabAction( tab_id, window_id ) {
  return {
    type: TAB_ACTIVATE,
    tab_id,
    window_id
  }
}

export function addTabAction( browser_tab, tab_group_id ) {
  return {
    type: TAB_ADD,
    browser_tab,
    tab_group_id
  }
}

export function removeTabAction( tab_id, window_id ) {
  return {
    type: TAB_REMOVE,
    tab_id,
    window_id
  }
}

export function updateTabAction( browser_tab, change_info ) {
  return {
    type: TAB_UPDATE,
    browser_tab,
    change_info
  }
}

export function updateTabImageAction( tab_id, window_id, preview_image_uri ) {
  return {
    type: TAB_UPDATE_IMAGE,
    tab_id,
    window_id,
    preview_image_uri
  }
}

export function moveTabsToGroupAction( source_tabs_data, target_data ) {
  return {
    type: TABS_MOVE,
    source_tabs_data,
    target_data,
  }
}

export function moveTabAction( tab_id, window_id, index ) {
  return {
    type: TAB_MOVE,
    tab_id,
    window_id,
    index
  }
}

export function moveTabToGroupAction( tab_id, window_id, tab_group_id ) {
  return {
    type: TAB_MOVE,
    tab_id,
    window_id,
    tab_group_id
  }
}

export function attachTabAction( tab_id, window_id, index ) {
  return {
    type: TAB_ATTACH,
    tab_id,
    window_id,
    index
  }
}

export function detachTabAction( tab_id, window_id, index ) {
  return {
    type: TAB_DETACH,
    tab_id,
    window_id,
    index
  }
}

export function startSearchAction( window_id, search_text ) {
  return {
    type: WINDOW_SEARCH_START,
    window_id,
    search_text
  }
}

export function finishSearchAction( window_id, search_text, matching_tab_ids ) {
  return {
    type: WINDOW_SEARCH_FINISH,
    window_id,
    search_text,
    matching_tab_ids
  }
}

export function updateConfigAction( config ) {
  return {
    type: CONFIG_UPDATE,
    config
  }
}
