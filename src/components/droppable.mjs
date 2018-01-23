
import {
  moveTabsToGroup,
} from '../integrations/index.mjs'

export function setTabTransferData( data_transfer, window_id, tab_group_id, tab_id ) {
  const event_data = { window_id, tab_group_id, tab_ids: [ tab_id ] }
  console.info('setTabTransferData', event_data)
  data_transfer.dropEffect = 'move'
  data_transfer.effectAllowed = 'move'
  data_transfer.setData( 'application/json', JSON.stringify( event_data ) )
}

// @todo extract helper to pull data transfer type
function isTabTransfer( event_data ) {
  return event_data && event_data.hasOwnProperty( 'tab_ids' )
}

function getTransferData( data_transfer ) {
  const event_data = JSON.parse( data_transfer.getData( 'application/json' ) )
  // @todo error guard
  console.info('getTransferData', event_data)

  return event_data
}

export function onTabGroupDragEnter( tab_group, event ) {
  console.info('onTabGroupDragEnter', tab_group, event)
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.dropEffect = 'move'
  event.preventDefault()
}

export function onTabGroupDragOver( tab_group, event ) {
  event.preventDefault()
  const event_data = getTransferData( event.dataTransfer )
  console.info('onTabGroupDragOver', tab_group, event)
  if( isTabTransfer( event_data ) ) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.dropEffect = 'move'
  }
}

export function onTabGroupDrop( tab_group, event ) {
  event.preventDefault()
  const event_data = getTransferData( event.dataTransfer )
  console.info('onTabGroupDrop', tab_group, event, event_data)
  if( isTabTransfer( event_data ) ) {
    console.info('detected tab drop', event_data)
    moveTabsToGroup( window.store, event_data, this.window_id, tab_group.id )
  }
}
