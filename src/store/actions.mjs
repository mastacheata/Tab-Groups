import {
  INIT,
  TAB_ACTIVATE,
  TAB_ADD,
  TAB_REMOVE,
  TAB_UPDATE,
  TAB_MOVE,
  TAB_ATTACH,
  TAB_DETACH,
} from './action-types.mjs'

export function init({ tabs, tab_groups, tab_group_id_map, window_active_tab_group_id_map }) {
  return {
    type: INIT,
    tabs,
    tab_groups,
    tab_group_id_map,
    window_active_tab_group_id_map
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
