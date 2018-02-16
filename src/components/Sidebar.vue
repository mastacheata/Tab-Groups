<template>
  <body class="sidebar" :class="theme">
    <div class="sidebar-header">
      <!-- @todo create icon -->
      <div class="sidebar-header-new_group"
          @click.left="createTabGroup()" @click.right.prevent
      >
        <!-- @todo use localized string -->
        New Group
      </div>
      <!-- @todo create icon -->
      <input class="sidebar-header-search" type="search" @input="onUpdateSearchText( search_text )" v-model="search_text" :placeholder="__MSG_tab_search_placeholder__"/>
      <div class="sidebar-header-config" @click="openOptionsPage()">
        <!-- @todo hi-res, context colours -->
        <img class="icon" src="/icons/options.png"/>
      </div>
    </div>
    <div class="sidebar-tabs-pinned-list" @click.right.prevent>
      <div class="sidebar-tabs-pinned-list-item"
          v-for="tab in pinned_tabs" :key="tab.id"
          :class="{ active: tab.active, selected: isSelected( tab ) }" :title="tab.title"
          @click.ctrl="toggleTabSelection( tab )" @click.exact="openTab( tab )" @click.middle="closeTab( tab )"
      >
        <!-- @todo fade styling for pinned tabs if search -->
        <img class="sidebar-tabs-pinned-list-item-icon" :src="tab.icon_url"/>
        <!-- @todo context bar -->
      </div>
    </div>
    <div class="sidebar-tab-group-list" @click.right.prevent>
      <div class="sidebar-tab-group-list-item"
          v-for="tab_group in tab_groups" :key="tab_group.id"
      >
        <div class="sidebar-tab-group-list-item-header"
            v-on:click="toggleTabGroupOpen( tab_group )"
            @dragenter="onTabGroupDragEnter( tab_group, $event )" @dragover="onTabGroupDragOver( tab_group, $event )" @drop="onTabGroupDrop( tab_group, $event )" @dragend="onTabGroupDragEnd( tab_group, $event )"
        >
          <span class="text">
            <!-- @todo icons -->
            <span>{{ tab_group.open ? '–' : '+' }}</span>
            {{ tab_group.title }}
          </span>

          <span class="sidebar-tab-group-list-item-header-tab-count">{{ getCountMessage( 'tabs', tab_group.tabs_count ) }}</span>
        </div>
        <div v-if="tab_group.open" class="sidebar-tab-group-tabs-list">
          <div class="sidebar-tab-group-tabs-list-item"
              v-for="tab in tab_group.tabs" :key="tab.id" :tab="tab"
              v-if="! search_text || ! search_resolved || tab.is_matched" :title="tab.title"
              :class="{ active: tab_group.active_tab_id === tab.id, selected: isSelected( tab ), source: isSelected( tab ) && is_dragging, target: target_tab_id === tab.id && ! isSelected( tab ) }"
              @click.ctrl="toggleTabSelection( tab )" @click.exact="openTab( tab )" @click.middle="closeTab( tab )"
              draggable="true" @dragstart="onTabDragStart( $event, tab )" @dragend="onTabDragEnd" @drop="onTabDrop( tab, $event )"
              @dragover="onTabDragOver( $event, tab_group, tab )"
          >
              <!-- @drag="onTabDrag" @dragenter="onTabDragEnter( tab_group, tab, $event )" @dragleave="onTabDragLeave( tab_group, tab, $event )" @dragexit="onTabDragExit" -->
            <div class="sidebar-tab-view-item" :class="{ active: tab_group.active_tab_id === tab.id }">
              <img class="sidebar-tab-view-item-icon" :src="tab.icon_url"/>
              <div class="sidebar-tab-view-item-text">
                <span class="sidebar-tab-view-item-title">{{ tab.title }}</span>
                <br>
                <span class="sidebar-tab-view-item-url">{{ tab.url }}</span>
              </div>
              <div v-if="tab.context_id" class="sidebar-tab-view-item-context" :style="context_styles[ tab.context_id ]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </body>
</template>

<script>
import {
  createGroupAction,
} from '../store/actions.mjs'
import {
  cloneTabGroup,
  cloneTab,
} from '../store/helpers.mjs'
import {
  closeTab,
  getMessage,
  moveTabsToGroup,
  openOptionsPage,
  runTabSearch,
  setTabActive,
} from '../integrations/index.mjs'
import {
  getTransferData,
  isTabTransfer,
  onTabGroupDragEnter,
  onTabGroupDragOver,
  onTabGroupDrop,
  setTabTransferData,
} from './droppable.mjs'
import {
  debounce,
  getCountMessage,
  onStateChange,
} from './helpers.mjs'

export default {
  name: 'sidebar',
  components: {
  },
  data() {
    return {
      window_id: window.current_window_id,
      active_tab_group_id: null,
      context_styles: {},
      is_dragging: false,
      is_tab_group_open: {},
      search_text: '',
      search_resolved: true,
      selected_tab_ids: [],
      pinned_tabs: [],
      tab_groups: [
      ],
      target_tab_group_id: null,
      target_tab_group_index: null,
      target_tab_id: null,
      theme: null
    }
  },
  created() {
    onStateChange( state => {
      this.theme = state.config.theme

      for( let context_id in state.contexts || {} ) {
        this.context_styles[ context_id ] = {
          'background-color': state.contexts[ context_id ].color
        }
      }

      const state_window = state.windows.find( window => window.id === this.window_id )
      if( state_window ) {
        // @todo if active_tab_group_id has changed, open the new active group
        this.active_tab_group_id = state_window.active_tab_group_id

        this.search_text = state_window.search_text
        this.search_resolved = state_window.search_resolved

        // @todo this could be done more efficiently
        const new_selected_tab_ids = []

        // Need to deep clone the objects because Vue extends prototypes when state added to the vm
        let tab_groups = state_window.tab_groups.map( cloneTabGroup )
        // Use the extended splice to trigger change detection
        Object.getPrototypeOf( this.pinned_tabs ).splice.apply( this.pinned_tabs, [ 0, this.pinned_tabs.length, ...tab_groups[ 0 ].tabs ] )
        tab_groups = tab_groups.filter( tab_group => tab_group.id )
        tab_groups.forEach( tab_group => {
          // Copy the `open` flag from original data
          const orig_tab_group = this.tab_groups.find( _tab_group => _tab_group.id === tab_group.id )
          if( orig_tab_group ) {
            tab_group.open = orig_tab_group.open
          } else {
            tab_group.open = ( tab_group.id === state_window.active_tab_group_id )
          }

          tab_group.tabs.forEach( tab => {
            if( this.selected_tab_ids.includes( tab.id ) ) {
              new_selected_tab_ids.push( tab.id )
            }
          })
        })
        Object.getPrototypeOf( this.selected_tab_ids ).splice.apply( this.selected_tab_ids, [ 0, this.selected_tab_ids.length, ...new_selected_tab_ids ] )
        // Use the extended splice to trigger change detection
        Object.getPrototypeOf( this.tab_groups ).splice.apply( this.tab_groups, [ 0, this.tab_groups.length, ...tab_groups ] )
      } else {
        // @todo error
      }
    })
  },
  computed: {
    __MSG_tab_search_placeholder__: function() {
      return getMessage( "tab_search_placeholder" )
    }
  },
  methods: {
    getCountMessage,
    createTabGroup() {
      // Create new group with default properties in the store
      window.store.dispatch( createGroupAction( this.window_id ) )
      // @todo create new tab in the new group
    },
    openTab( tab ) {
      console.info('openTab', tab)
      this.selected_tab_ids.splice( 0, this.selected_tab_ids.length )
      setTabActive( tab.id )
    },
    closeTab( tab ) {
      console.info('closeTab', tab)
      closeTab( tab.id )
    },
    isSelected( tab ) {
      return this.selected_tab_ids.includes( tab.id )
    },
    onTabDrag( event ) {
      // console.info('onTabDrag', event)
    },
    onTabDragStart( event, tab ) {
      console.info('onTabDragStart', event, this.window_id, this.selected_tab_ids)
      this.is_dragging = true

      // Use the selected tabs if the tab is selected
      if( this.isSelected( tab ) ) {
        setTabTransferData( event.dataTransfer, this.window_id, [ ...this.selected_tab_ids ] )
      } else {
        this.selected_tab_ids.splice( 0, this.selected_tab_ids.length, tab.id )
        setTabTransferData( event.dataTransfer, this.window_id, [ tab.id ] )
      }
    },
    onTabDragOver( event, tab_group, tab ) {
      event.preventDefault()
      const event_data = getTransferData( event.dataTransfer )
      // console.info('onTabDragOver', event)
      if( isTabTransfer( event_data ) ) {
        this.target_tab_group_id = tab_group.id
        this.target_tab_group_index = tab_group.tabs.indexOf( tab )
        this.target_tab_id = tab.id
        event.dataTransfer.effectAllowed = 'move'
        event.dataTransfer.dropEffect = 'move'
      }
    },
    onTabDragEnd( event ) {
      console.info('onTabDragEnd', event)
      this.is_dragging = false
      this.target_tab_group_id = null
      this.target_tab_group_index = null
      this.target_tab_id = null
    },
    onTabDrop( tab, event ) {
      const source_data = getTransferData( event.dataTransfer )
      console.info('onTabDrop', tab.id, event, source_data )

      const target_data = {
        window_id: this.window_id,
        tab_group_id: this.target_tab_group_id,
        tab_group_index: this.target_tab_group_index
      }

      moveTabsToGroup( window.store, source_data, target_data )
      this.selected_tab_ids.splice( 0, this.selected_tab_ids.length )
    },
    onTabGroupDragEnter,
    onTabGroupDragOver,
    onTabGroupDrop,
    onUpdateSearchText: debounce( function( search_text ) {
      console.info('runSearch', search_text)
      runTabSearch( window.store, this.window_id, search_text )
    }, 250 ),
    openOptionsPage,
    toggleTabGroupOpen( tab_group ) {
      tab_group.open = ! tab_group.open
    },
    toggleTabSelection( tab ) {
      console.info('toggleTabSelection', tab)
      const tab_index = this.selected_tab_ids.indexOf( tab.id )
      if( tab_index > -1 ) {
        this.selected_tab_ids.splice( tab_index, 1 )
      } else {
        this.selected_tab_ids.push( tab.id )
      }
      console.info('selected_tab_ids', this.selected_tab_ids)
    }
  }
}
</script>

<style scoped>
.sidebar {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
}

.sidebar.dark {
  color: #fff; /* Photon White */
  background-color: #0c0c0d; /* Dark Theme header background */
}

.sidebar.light {
  color: #0f1126; /* Photon Ink 90 */
  background-color: white;
}

.sidebar-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.light .sidebar-header {
  background-color: #f5f6f7; /* Light Theme header active tab background */
}

.dark .sidebar-header {
  background-color: #323234; /* Dark Theme header active tab background */
}

.sidebar-header-new_group {
  flex: 1;
  padding: 4px 8px;
  cursor: pointer;
}

.light .sidebar-header-new_group:hover {
  background-color: #cccdcf; /* Light Theme header tab hover background */
}

.dark .sidebar-header-new_group:hover {
  background-color: #252526; /* Dark Theme header tab hover background */
}

.sidebar-header-search {
  flex: 0;
  padding: 4px 8px;
  margin: 4px;
  border-radius: 2px;
  max-width: 50%;
}

.light .sidebar-header-search {
  background-color: #fff; /* Photon White */
  color: #0f1126; /* Photon Ink 90 */
  border: 1px solid #ccc;
}

.dark .sidebar-header-search {
  background-color: #474749; /* Dark Theme awesome bar background */
  color: #fff; /* Photon White */
  border: none;
}

.sidebar-header-config {
  width: 24px;
  height: 24px;
  padding: 4px;
  margin-right: 4px;
  cursor: pointer;
}

.light .sidebar-header-config:hover {
  background-color: #cccdcf; /* Light Theme header tab hover background */
}

.dark .sidebar-header-config:hover {
  background-color: #252526; /* Dark Theme header tab hover background */
}

.sidebar-tabs-pinned-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, 28px);
  grid-auto-columns: min-content;
  grid-auto-rows: max-content;
}

.light .sidebar-tabs-pinned-list {
}

.dark .sidebar-tabs-pinned-list {
}

.sidebar-tabs-pinned-list-item {
  padding: 2px;
}

.sidebar-tab-group-tabs-list-item.target {
  background-color: red;
}

.sidebar-tab-view-item {
  transition-property: margin-top;
  transition-duration: 250ms;
  transition-timing-function: cubic-bezier(.07,.95,0,1);
}

.sidebar-tab-group-tabs-list-item.target .sidebar-tab-view-item {
  margin-top: 54px;
}

.light .sidebar-tab-group-tabs-list-item.target .sidebar-tab-view-item {
  background-color: white;
}

.dark .sidebar-tab-group-tabs-list-item.target .sidebar-tab-view-item {
  background-color: white;
}

.light .sidebar-tab-group-tabs-list-item.source .sidebar-tab-view-item {
  background-color: blue;
}

.dark .sidebar-tabs-pinned-list-item {
}

.sidebar-tabs-pinned-list-item {
  padding: 2px;
}

.light .sidebar-tabs-pinned-list-item.active {
  background-color: #f5f6f7; /* Light Theme header active tab background */
}

.light .sidebar-tabs-pinned-list-item:hover {
  background-color: #cccdcf; /* Light Theme header tab hover background */
}

.light .sidebar-tabs-pinned-list-item.active:hover {
  background-color: #f5f6f7; /* Light Theme header active tab background */
}

.dark .sidebar-tabs-pinned-list-item.active {
  background-color: #323234; /* Dark Theme header active tab background */
}

.dark .sidebar-tabs-pinned-list-item:hover {
  background-color: #252526; /* Dark Theme header tab hover background */
}

.dark .sidebar-tabs-pinned-list-item.active:hover {
  background-color: #323234; /* Dark Theme header active tab background */
}

.sidebar-tabs-pinned-list-item-icon {
  width: 16px;
  height: 16px;
}

.sidebar-tab-group-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  overflow-y: auto;
}

.sidebar-tab-group-list-item {
  flex: 1;
}

.sidebar-tab-group-list-item-header {
  padding: 10px;

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
}

.sidebar-tab-group-list-item-header > span {
  flex: 1;
}

.sidebar-tab-group-list-item-header > .sidebar-tab-group-list-item-header-tab-count {
  text-align: right;
}

.sidebar-tab-group-tabs-list {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
}

.sidebar-tab-group-tabs-list-item {
  width: 100%;
  flex: 0;
}

.sidebar-tab-group-tabs-list-item.selected {
  /* @todo themed */
  background-color: purple;
}

.sidebar-tab-view-item {
  display: flex;
  align-items: center;
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: clip;
}

.sidebar-tab-view-item-icon {
  width: 24px;
  height: 24px;
  margin: 0 8px;
}

.sidebar-tab-view-item-text {
  flex: 1;
  padding-top: 10px;
  padding-bottom: 10px
}

.sidebar-tab-view-item-context {
  flex: 0;
  min-width: 4px;
  height: 52px;
}

.light .sidebar-tab-group-list-item-header {
  background-color: white;
  border-bottom: black 1px solid;
}

.light .sidebar-tab-view-item.active {
  background-color: #f5f6f7; /* Light Theme header active tab background */
}

.light .sidebar-tab-view-item:hover {
  background-color: #cccdcf; /* Light Theme header tab hover background */
}

.light .sidebar-tab-view-item.active:hover {
  background-color: #f5f6f7; /* Light Theme header active tab background */
}

.light .sidebar-tab-view-item-title {
  color: black;
}

.light .sidebar-tab-view-item-url {
  color: #737373; /* Photon Grey 50 */
}

.dark .sidebar-tab-group-list-item-header {
  background-color: black;
  border-bottom: white 1px solid;
}

.dark .sidebar-tab-view-item.active {
  background-color: #323234; /* Dark Theme header active tab background */
}

.dark .sidebar-tab-view-item:hover {
  background-color: #252526; /* Dark Theme header tab hover background */
}

.dark .sidebar-tab-view-item.active:hover {
  background-color: #323234; /* Dark Theme header active tab background */
}

.dark .sidebar-tab-view-item-title {
  color: #fff; /* Photon White */
}

.dark .sidebar-tab-view-item-url {
  color: #737373; /* Photon Grey 50 */
}

/* @todo should be moved to common css */
.icon {
  height: 16px;
  width: 16px;
  margin-right: 4px;
}
</style>
