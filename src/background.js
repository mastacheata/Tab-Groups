// @todo this is not currently run through build, so includes don't work

browser.storage.onChanged.addListener( ( changes, area ) => {
})

// Attach listeners for changes to tabs

browser.tabs.onCreated.addListener( ( tab ) => {
  console.info('tabs.onCreated', tab)
})

browser.tabs.onRemoved.addListener( ( tab_id, remove_info ) => {
  // @todo can start process to capture image here
  console.info('tabs.onRemoved', tab_id, remove_info)
})

browser.tabs.onMoved.addListener( ( tab_id, { windowId, fromIndex, toIndex } ) => {
  // @todo can start process to capture image here
  console.info('tabs.onMoved', tab_id, windowId, fromIndex, toIndex)
})

browser.tabs.onAttached.addListener( ( tab_id, { newWindowId, newPosition } ) => {
  console.info('tabs.onAttached', tab_id, newWindowId, newPosition)
})

browser.tabs.onDetached.addListener( ( tab_id, { oldWindowId, oldPosition } ) => {
  console.info('tabs.onDetached', tab_id, oldWindowId, oldPosition)
})

browser.tabs.onReplaced.addListener( ( added_tab_id, removed_tab_id ) => {
  console.info('tabs.onReplaced', added_tab_id, removed_tab_id)
})

browser.tabs.onUpdated.addListener( ( tab_id, change_info, tab ) => {
  console.info('tabs.onUpdated', tab_id, change_info, tab)
})

browser.tabs.onActivated.addListener( ( { tabId, windowId } ) => {
  // @todo can start process to capture image here
  // tabs.captureVisibleTab()
  console.info('tabs.onActivated', tabId, windowId)
})

// Load initial state for the tabs
browser.tabs.query({})
  .then(
    ( tabs ) => {
      console.info('tabs', tabs)
      // @todo load from tabs
    }
  )

browser.runtime.onMessage.addListener( ( message, sender, sendResponse ) => {
  console.info('runtime.onMessage', message, sender, sendResponse)
})

// @todo load from storage
// @todo sync changes
