import {
  INIT,
  WINDOW_ADD,
  WINDOW_REMOVE,
  GROUP_ACTIVATE,
  GROUP_CREATE,
  GROUP_REMOVE,
  GROUP_UPDATE,
  GROUP_MOVE,
  TAB_ACTIVATE,
  TAB_ADD,
  TAB_REMOVE,
  TAB_UPDATE,
  TAB_MOVE,
  TAB_ATTACH,
  TAB_DETACH,
} from './action-types.mjs'

export function init({ tabs, window_tab_groups_map }) {
  return {
    type: INIT,
    tabs,
    window_tab_groups_map
  }
}

export function addWindow( window ) {
  return {
    type: WINDOW_ADD,
    window
  }
}

export function removeWindow( window_id ) {
  return {
    type: WINDOW_REMOVE,
    window_id
  }
}

export function activateGroup( tab_group_id, window_id ) {
  return {
    type: GROUP_ACTIVATE,
    tab_group_id,
    window_id
  }
}

export function createGroup( window_id ) {
  return {
    type: GROUP_CREATE,
    window_id
  }
}

export function removeGroup( tab_group_id, window_id ) {
  return {
    type: GROUP_REMOVE,
    tab_group_id,
    window_id
  }
}

export function updateGroup( tab_group, window_id, change_info ) {
  return {
    type: GROUP_UPDATE,
    tab_group,
    window_id,
    change_info
  }
}

export function moveGroup( tab_group_id, window_id, index ) {
  return {
    type: GROUP_MOVE,
    tab_group_id,
    window_id,
    index
  }
}

export function activateTab( tab_id, window_id ) {
  return {
    type: TAB_ACTIVATE,
    tab_id,
    window_id
  }
}

export function addTab( tab, tab_group_id ) {
  return {
    type: TAB_ADD,
    tab,
    tab_group_id
  }
}

export function removeTab( tab_id, window_id ) {
  return {
    type: TAB_REMOVE,
    tab_id,
    window_id
  }
}

export function updateTab( tab, change_info ) {
  return {
    type: TAB_UPDATE,
    tab,
    change_info
  }
}

export function moveTab( tab_id, window_id, index ) {
  return {
    type: TAB_MOVE,
    tab_id,
    window_id,
    index
  }
}

export function attachTab( tab_id, window_id, index ) {
  return {
    type: TAB_ATTACH,
    tab_id,
    window_id,
    index
  }
}

export function detachTab( tab_id, window_id, index ) {
  return {
    type: TAB_DETACH,
    tab_id,
    window_id,
    index
  }
}
