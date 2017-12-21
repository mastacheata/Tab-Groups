<template>
  <div class="page tab-groups-single-view" @dragend="onParentDragEnd( $event )">
    <section class="tab-groups-list-pane" @wheel="onTabGroupWheel( $event )">
      <article class="tab-groups-list-item" v-for="tab_group in tab_groups" :key="tab_group.id" @click.left="selectTabGroup( tab_group )" :class="{ active: tab_group.id === selected_tab_group.id }">
        {{ tab_group.title }}
      </article>
    </section>
    <section class="tab-group-header-pane">
      <div class="tab-group-header-title" contenteditable="true" @blur="onTabGroupNameUpdate">{{ selected_tab_group.title }}</div>
      <span v-if="is_dragging_tab">dragging</span>
    </section>
    <section class="tab-group-tabs-list-pane">
      <div class="tab-group-tab-card"
           v-for="tab in selected_tab_group.tabs" :key="tab.id"
           @click.left="selectTab( tab )"  @click.middle="closeTab( tab )"
           draggable="true" @dragstart="onTabDragStart( tab, $event )" @dragend="onTabDragEnd( tab, $event )"
      >
        <svg class="tab-group-tab-card-content">
          <g class="favicon">
            <circle cx="0" cy="0" r="32"/>
            <!-- @todo clipPath for image with circle -->
            <image :xlink:href="tab.favIconUrl" x="0" y="0" height="24px" width="24px"/>
          </g>
          <!-- @todo embed preview image -->
        </svg>
        <div class="tab-group-tab-title">{{ tab.title }}</div>
      </div>
    </section>
  </div>
</template>

<script>
import {
  createGroup,
  updateGroup,
} from '../store/actions.mjs'
import { cloneTabGroup } from '../store/helpers.mjs'
import {
  getMessage,
  closeTab,
  setTabActive,
  runTabSearch,
} from '../integrations/index.mjs'
import { debounce, getCountMessage } from './helpers.mjs'

export default {
  name: 'tab-groups-single-view',
  data() {
    return {
      is_dragging_tab: false,
      window_id: window.current_window_id,
      selected_tab_group: null,
      tab_groups: [],
      theme: null
    }
  },
  created() {
    const loadState = ( state ) => {
      this.theme = state.config.theme

      const state_window = state.windows.find( ( window ) => window.id === this.window_id )
      if( state_window ) {
        this.active_tab_group_id = state_window.active_tab_group_id

        // Need to deep clone the objects because Vue extends prototypes when state added to the vm
        let tab_groups = state_window.tab_groups.map( cloneTabGroup )

        if( this.selected_tab_group ) {
          this.selected_tab_group = tab_groups.find( tab_group => tab_group.id === this.selected_tab_group.id )
        }

        if( ! this.selected_tab_group ) {
          // @todo if no selected tab group, use active instead
          this.selected_tab_group = tab_groups[ 0 ]
        }

        // Use the extended splice to trigger change detection
        Object.getPrototypeOf( this.tab_groups ).splice.apply( this.tab_groups, [ 0, this.tab_groups.length, ...tab_groups ] )
      } else {
        // @todo error
      }
    }

    // @todo this code is duplicated
    loadState( window.store.getState() )

    // Attach listener to background state changes so we can update the data
    const unsubscribe = window.store.subscribe( () => {
      loadState( window.store.getState() )
    })
    window.addEventListener( 'unload', ( event ) => {
      unsubscribe()
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
    },
    onParentDragEnd( tab, event ) {
      console.info('onParentDragEnd', tab, event)
      this.is_dragging_tab = false
    },
    onTabDragEnd( tab, event ) {
      console.info('onTabDragEnd', tab, event)
      this.is_dragging_tab = false
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

.tab-group-header-pane {
  height: 30px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.light .tab-group-header-pane {
  color: #0f1126; /* Photon Ink 90 */
  background-color: #f5f6f7; /* Light Theme header active tab background */
}

.dark .tab-group-header-pane {
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
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
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

.tab-group-tab-card {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
}

.tab-group-tab-card-content {
  flex: 1;
  width: 100%;
}

.tab-group-tab-card-content .favicon circle {
  fill: #323234; /* Dark Theme header active tab background */
}

.tab-group-tab-title {
  height: 32px;
  max-width: 100px;
  text-overflow: clip;
  white-space: nowrap;
  overflow-x: hidden;
}
</style>
