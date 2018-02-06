<template>
  <div class="page tab-groups-single-view">
    <section class="tab-groups-list-pane" @wheel="onTabGroupWheel( $event )">
      <article class="tab-groups-list-item" :class="{ active: tab_group.id === selected_tab_group.id }"
          v-for="tab_group in tab_groups" :key="tab_group.id"
          @click.left="selectTabGroup( tab_group )"
          draggable="true" @dragenter="onTabGroupDragEnter( tab_group, $event )" @dragover="onTabGroupDragOver( tab_group, $event )" @drop="onTabGroupDrop( tab_group, $event )" @dragend="onTabGroupDragEnd( tab_group, $event )"
      >
        {{ tab_group.title }}
      </article>
      <article class="tab-groups-list-item"
          @click.left="createTabGroup()"
          @dragenter="onTabGroupDragEnter( null, $event )" @dragover="onTabGroupDragOver( null, $event )" @drop="onTabGroupDrop( null, $event )"
      >
        +
      </article>
    </section>
    <div class="tab-groups-main-pane">
      <section v-if="pinned_tabs" class="tab-group-pinned-tabs">
        <div class="tab-group-pinned-tab"
            v-for="tab in pinned_tabs" :key="tab.id"
            :title="tab.title"
            @click.left="selectTab( tab )" @click.middle="closeTab( tab )"
            draggable="true" @dragstart="onTabDragStart( tab, null, $event )" @dragend="onTabDragEnd( tab, $event )" @drop="onTabDrop( tab, $event )"
        >
          <img class="tab-group-pinned-tab-icon" :src="tab.icon_url"/>
        </div>
      </section>
      <div class="tab-groups-tabs-pane">
        <section class="tab-group-tabs-header-pane">
          <div class="tab-group-header-title" contenteditable="true" spellcheck="false" @blur="onTabGroupNameUpdate" @keyup.enter="onTabGroupNamePressEnter">{{ selected_tab_group.title }}</div>
          <!-- @todo add tab count -->
        </section>
        <section class="tab-group-tabs-list-pane">
          <div class="tab-group-tab-card"
              v-for="tab in selected_tab_group.tabs" :key="tab.id"
              :title="tab.title"
              @click.left="selectTab( tab )" @click.middle="closeTab( tab )"
              draggable="true" @dragstart="onTabDragStart( tab, selected_tab_group.id, $event )" @dragend="onTabDragEnd( tab, $event )" @drop="onTabDrop( tab, $event )"
          >
            <!-- @todo add mask on image -->
            <img v-if="tab.preview_image" class="tab-group-tab-card-preview" :src="tab.preview_image.uri"/>
            <svg class="tab-group-tab-card-favicon-bg">
              <circle cx="12px" cy="12px" r="16px"/>
              <!-- @todo clipPath for image with circle -->
            </svg>
            <img class="tab-group-tab-card-favicon" :src="tab.icon_url"/>
            <div class="tab-group-tab-title"><span>{{ tab.title }}</span></div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import {
  createGroupAction,
  updateGroupAction,
} from '../store/actions.mjs'
import {
  cloneWindow,
  cloneTabGroup,
} from '../store/helpers.mjs'
import {
  getMessage,
  closeTab,
  setTabActive,
  runTabSearch,
} from '../integrations/index.mjs'
import {
  debounce,
  getCountMessage,
  onStateChange,
} from './helpers.mjs'
import {
  setTabTransferData,
  onTabGroupDragEnter,
  onTabGroupDragOver,
  onTabGroupDrop,
} from './droppable.mjs'

export default {
  name: 'tab-groups-single-view',
  data() {
    return {
      is_dragging_tab: false,
      window_id: window.current_window_id,
      selected_tab_group: null,
      pinned_tabs: [],
      tab_groups: [],
      theme: null
    }
  },
  created() {
    onStateChange( state => {
      this.theme = state.config.theme

      const state_window = state.windows.find( ( window ) => window.id === this.window_id )
      if( state_window ) {
        // Need to deep clone the objects because Vue extends prototypes when state added to the vm
        let tab_groups = state_window.tab_groups.map( cloneTabGroup )
        // Use the extended splice to trigger change detection
        Object.getPrototypeOf( this.pinned_tabs ).splice.apply( this.pinned_tabs, [ 0, this.pinned_tabs.length, ...tab_groups[ 0 ].tabs ] )
        tab_groups = tab_groups.filter( tab_group => tab_group.id )
        tab_groups.forEach( tab_group => {
          // @todo check existing state
          tab_group.open = true
        })
        // Use the extended splice to trigger change detection
        Object.getPrototypeOf( this.tab_groups ).splice.apply( this.tab_groups, [ 0, this.tab_groups.length, ...tab_groups ] )

        if( this.selected_tab_group ) {
          this.selected_tab_group = this.tab_groups.find( tab_group => tab_group.id === this.selected_tab_group.id )
        }
        if( ! this.selected_tab_group ) {
          if( state_window.active_tab_group_id ) {
            this.selected_tab_group = this.tab_groups.find( tab_group => tab_group.id === state_window.active_tab_group_id )
          }
          if( ! this.selected_tab_group ) {
            this.selected_tab_group = this.tab_groups[ 0 ]
          }
        }
      } else {
        // @todo error
      }
    })
  },
  methods: {
    createTabGroup() {
      // Create new group with default properties in the store
      window.store.dispatch( createGroupAction( this.window_id ) )
      // @todo create new tab in the new group
    },
    selectTabGroup( tab_group ) {
      console.info('selectTabGroup', tab_group)
      this.selected_tab_group = tab_group
    },
    closeTab( tab ) {
      console.info('closeTab', tab)
      closeTab( tab.id )
    },
    selectTab( tab ) {
      console.info('selectTab', tab)
      setTabActive( tab.id )
    },
    onTabGroupNamePressEnter( event ) {
      console.info('onTabGroupNamePressEnter', event)
      event.preventDefault()
      event.target.textContent = event.target.textContent.replace( /\n/g, '' )
      event.currentTarget.blur()
      window.getSelection().removeAllRanges()
    },
    onTabGroupNameUpdate( event ) {
      console.info('onTabGroupNameUpdate', event, event.target.textContent)
      window.store.dispatch( updateGroupAction( this.selected_tab_group.id, this.window_id, { title: event.target.textContent } ) )
    },
    onTabGroupWheel( event ) {
      console.info('onTabGroupWheel', event)
      event.currentTarget.scrollLeft += event.deltaY * 12
    },
    onTabsListWheel( event ) {
      console.info('onTabsListWheel', event)
      event.currentTarget.scrollTop += event.deltaY * 12
    },
    onTabDragStart( tab, tab_group_id, event ) {
      console.info('onTabDragStart', tab, event)
      this.is_dragging_tab = true
      setTabTransferData( event.dataTransfer, this.window_id, tab_group_id, tab.id )
    },
    onTabDragEnd( tab, event ) {
      console.info('onTabDragEnd', tab, event)
      this.is_dragging_tab = false
    },
    onTabDrop( tab, event ) {
      console.info('onTabDrop', tab, event)
    },
    onTabGroupDragEnter,
    onTabGroupDragOver,
    onTabGroupDrop,
    onTabGroupDragEnd( tab_group, event ) {
      console.info('onTabGroupDragEnd', event)
      event.preventDefault()
    }
  }
}
</script>

<style>
.page {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.tab-groups-list-pane {
  width: 100%;
  height: 80px;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  overflow-x: hidden;
}

.light .tab-groups-list-pane {
  color: #0f1126; /* Photon Ink 90 */
  background-color: white; /* Dark Theme header background */
}

.dark .tab-groups-list-pane {
  color: #fff; /* Photon White */
  background-color: #0c0c0d; /* Dark Theme header background */
}

.tab-groups-list-item {
  height: 80px;
  min-width: 80px;
  flex: 0;
}

.light .tab-groups-list-item.active {
  background-color: #f5f6f7; /* Light Theme header active tab background */
}

.light .tab-groups-list-item:hover {
  background-color: #cccdcf; /* Light Theme header tab hover background */
}

.light .tab-groups-list-item.active:hover {
  background-color: #f5f6f7; /* Light Theme header active tab background */
}

.light .tab-groups-list-item-title {
  color: black;
}

.light .tab-groups-list-item-url {
  color: #737373; /* Photon Grey 50 */
}

.dark .tab-groups-list-item.active {
  background-color: #323234; /* Dark Theme header active tab background */
}

.dark .tab-groups-list-item:hover {
  background-color: #252526; /* Dark Theme header tab hover background */
}

.dark .tab-groups-list-item.active:hover {
  background-color: #323234; /* Dark Theme header active tab background */
}

.tab-group-pinned-tabs {
  display: grid;
  grid-template-rows: repeat(auto-fill, 24px);
  grid-auto-columns: max-content;
  grid-auto-rows: min-content;
}

.tab-group-pinned-tab-icon {
  width: 24px;
  height: 24px;
}

.tab-group-tabs-header-pane {
  height: 30px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.light .tab-group-tabs-header-pane {
  color: #0f1126; /* Photon Ink 90 */
  background-color: #f5f6f7; /* Light Theme header active tab background */
}

.dark .tab-group-tabs-header-pane {
  color: #fff; /* Photon White */
  background-color: #323234; /* Dark Theme header active tab background */
}

.tab-group-header-title {
  padding: 8px;
  min-width: 80px;
}

.tab-group-tabs-list-pane {
  padding: 8px;
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  grid-auto-columns: min-content;
  grid-auto-rows: max-content;
  overflow-y: auto;
}

.light .tab-group-tabs-list-pane {
  color: #0f1126; /* Photon Ink 90 */
  background-color: #f5f6f7; /* Light Theme header active tab background */
}

.dark .tab-group-tabs-list-pane {
  color: #fff; /* Photon White */
  background-color: #323234; /* Dark Theme header active tab background */
}

.tab-groups-main-pane {
  display: flex;
  flex-direction: row;
  flex: 1;
}

.tab-group-pinned-tabs {
  flex-grow: 0;
}

.light .tab-group-pinned-tabs {
  background-color: #f5f6f7; /* Light Theme header active tab background */
}

.dark .tab-group-pinned-tabs {
  background-color: #323234; /* Dark Theme header active tab background */
}

.tab-groups-tabs-pane {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.tab-group-tab-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
}

.tab-group-tab-card-content {
  flex: 1;
  width: 100%;
}

.tab-group-tab-card-favicon {
  position: absolute;
  top: 0;
  left: 0;
  width: 24px;
  height: 24px;
}

.tab-group-tab-card-favicon-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 28px;
  height: 28px;
}

.tab-group-tab-card-preview {
  width: 100%;
}

.tab-group-tab-card-content .favicon circle {
  fill: #323234; /* Dark Theme header active tab background */
}

.tab-group-tab-title {
  max-width: 100px;
  padding: 4px;
  text-overflow: clip;
  white-space: nowrap;
  overflow-x: hidden;
}
</style>
