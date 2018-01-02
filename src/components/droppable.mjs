
import {
  moveTabsToGroup,
} from '../integrations/index.mjs'

export function setTabTransferData( data_transfer, tab_id ) {
  data_transfer.dropEffect = 'move'
  data_transfer.effectAllowed = 'move'
  data_transfer.setData( 'text/plain', `tab:${ tab_id }` )
}

// @todo extract helper to pull data transfer type
function isTabTransfer( event_data ) {
  return event_data.startsWith( 'tab:' )
}

function getTabTransferData( event_data ) {
  // @todo error guard
  const tab_id = parseInt( event_data.substr( 4 ) )
  return tab_id
}

export function onTabGroupDragEnter( tab_group, event ) {
  console.info('onTabGroupDragEnter', tab_group, event)
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.dropEffect = 'move'
  event.preventDefault()
}

export function onTabGroupDragOver( tab_group, event ) {
  event.preventDefault()
  const event_data = event.dataTransfer.getData('text/plain')
  console.info('onTabGroupDragOver', tab_group, event)
  if( isTabTransfer( event_data ) ) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.dropEffect = 'move'
  }
}

export function onTabGroupDrop( tab_group, event ) {
  event.preventDefault()
  const event_data = event.dataTransfer.getData('text/plain')
  console.info('onTabGroupDrop', tab_group, event, event_data)
  if( isTabTransfer( event_data ) ) {
    const tab_id = getTabTransferData( event_data )
    console.info('detected tab drop', tab_id)
    moveTabsToGroup( window.store, [ tab_id ], this.window_id, tab_group.id )
  }
}
