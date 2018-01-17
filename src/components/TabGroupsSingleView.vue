<template>
  <div class="page tab-groups-single-view">
    <section class="tab-groups-list-pane" @wheel="onTabGroupWheel( $event )">
      <article class="tab-groups-list-item" :class="{ active: tab_group.id === selected_tab_group.id }"
          v-for="tab_group in state_window.tab_groups" :key="tab_group.id"
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
      <section v-if="state_window.pinned_tabs" class="tab-group-pinned-tabs">
        <div class="tab-group-pinned-tab"
            v-for="tab in state_window.pinned_tabs" :key="tab.id"
            :title="tab.title"
            @click.left="selectTab( tab )" @click.middle="closeTab( tab )"
            draggable="true" @dragstart="onTabDragStart( tab, $event )" @dragend="onTabDragEnd( tab, $event )" @drop="onTabDrop( tab, $event )"
        >
          <img class="tab-group-pinned-tab-icon" :src="tab.favIconUrl"/>
        </div>
      </section>
      <div class="tab-groups-tabs-pane">
        <section class="tab-group-tabs-header-pane">
          <div class="tab-group-header-title" contenteditable="true" spellcheck="false" @blur="onTabGroupNameUpdate">{{ selected_tab_group.title }}</div>
          <!-- @todo add tab count -->
        </section>
        <section class="tab-group-tabs-list-pane">
          <div class="tab-group-tab-card"
              v-for="tab in selected_tab_group.tabs" :key="tab.id"
              :title="tab.title"
              @click.left="selectTab( tab )" @click.middle="closeTab( tab )"
              draggable="true" @dragstart="onTabDragStart( tab, $event )" @dragend="onTabDragEnd( tab, $event )" @drop="onTabDrop( tab, $event )"
          >
            <!-- @todo add mask on image -->
            <img v-if="tab.preview_image" class="tab-group-tab-card-preview" :src="tab.preview_image.uri"/>
            <svg class="tab-group-tab-card-favicon-bg">
              <circle cx="12px" cy="12px" r="16px"/>
              <!-- @todo clipPath for image with circle -->
            </svg>
            <img class="tab-group-tab-card-favicon" :src="tab.favIconUrl"/>
            <div class="tab-group-tab-title"><span>{{ tab.title }}</span></div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import {
  createGroup,
  updateGroup,
  moveTabToGroup,
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
      state_window: null,
      theme: null
    }
  },
  created() {
    onStateChange( state => {
      this.theme = state.config.theme

      const state_window = state.windows.find( ( window ) => window.id === this.window_id )
      if( state_window ) {
        // Need to deep clone the objects because Vue extends prototypes when state added to the vm
        this.state_window = cloneWindow( state_window )

        if( this.selected_tab_group ) {
          this.selected_tab_group = this.state_window.tab_groups.find( tab_group => tab_group.id === this.selected_tab_group.id )
        }

        if( ! this.selected_tab_group ) {
          // @todo if no selected tab group, use active instead
          this.selected_tab_group = this.state_window.tab_groups[ 0 ]
        }
      } else {
        // @todo error
      }
    })
  },
  methods: {
    createTabGroup() {
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
    onTabGroupNameUpdate( event ) {
      console.info('onTabGroupNameUpdate', event, event.target.textContent)
      window.store.dispatch( updateGroup( this.selected_tab_group.id, this.window_id, { title: event.target.textContent } ) )
    },
    onTabGroupWheel( event ) {
      console.info('onTabGroupWheel', event)
      event.currentTarget.scrollLeft += event.deltaY * 12
    },
    onTabsListWheel( event ) {
      console.info('onTabsListWheel', event)
      event.currentTarget.scrollTop += event.deltaY * 12
    },
    onTabDragStart( tab, event ) {
      console.info('onTabDragStart', tab, event)
      event.dataTransfer.dropEffect = "move"
      this.is_dragging_tab = true
      event.dataTransfer.setData( 'text/plain', `tab:${ tab.id }` )
      event.dataTransfer.effectAllowed = 'move'
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
  /* This is a hack to populate values used in filefox "chrome://" icons */
  -moz-context-properties: fill, stroke;
  fill: lime;
  stroke: purple;
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
