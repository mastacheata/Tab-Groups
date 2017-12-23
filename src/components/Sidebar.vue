<template>
  <body class="sidebar" :class="theme">
    <div class="sidebar-header">
      <!-- @todo create icon -->
      <div class="sidebar-header-new_group" @click.left="createTabGroup()" @click.right="$event.preventDefault()">New Group</div>
      <!-- @todo create icon -->
      <input class="sidebar-header-search" type="search" @input="onUpdateSearchText( search_text )" v-model="search_text" :placeholder="__MSG_tab_search_placeholder__"/>
    </div>
    <div class="sidebar-tab-group-list" @click.right="$event.preventDefault()">
      <div class="sidebar-tab-group-list-item" v-for="tab_group in tab_groups" :key="tab_group.id">
        <div class="sidebar-tab-group-list-item-header">
          <span class="text">
            <span v-on:click="toggleTabGroupOpen( tab_group )">{{ tab_group.is_open ? '–' : '+' }}</span>
            {{ tab_group.title }}
          </span>

          <span class="sidebar-tab-group-list-item-header-tab-count">{{ getCountMessage( 'tabs', tab_group.tabs_count ) }}</span>
        </div>
        <div v-if="tab_group.is_open" class="sidebar-tab-group-tabs-list">
          <SidebarTabItem class="sidebar-tab-group-tabs-list-item" :tab="tab" v-for="tab in tab_group.tabs" :key="tab.id" v-if="! search_text || ! search_resolved || tab.is_matched"/>
        </div>
      </div>
    </div>
  </body>
</template>

<script>
import { createGroup } from '../store/actions.mjs'
import { cloneTabGroup, cloneTab } from '../store/helpers.mjs'
import {
  getMessage,
  runTabSearch,
} from '../integrations/index.mjs'
import { debounce, getCountMessage } from './helpers.mjs'
import SidebarTabItem from './SidebarTabItem.vue'

export default {
  name: 'sidebar',
  components: {
    SidebarTabItem
  },
  data() {
    return {
      window_id: window.current_window_id,
      active_tab_group_id: null,
      is_tab_group_open: {},
      search_text: '',
      search_resolved: true,
      pinned_tabs: [],
      tab_groups: [
        // {
        //   id: 1,
        //   name: "group 1",
        //   tabs_count: 2,
        //   tabs: [
        //     {
        //       id: 1,
        //       title: 'Test',
        //       favicon_url: null
        //     },
        //     {
        //       id: 2,
        //       title: 'Test 2',
        //       favicon_url: null
        //     }
        //   ]
        // }
      ],
      theme: null
    }
  },
  created() {
    const loadState = ( state ) => {
      const state_window = state.windows.find( window => window.id === this.window_id )
      if( state_window ) {
        // @todo if active_tab_group_id has changed, open the new active group
        this.active_tab_group_id = state_window.active_tab_group_id

        this.search_text = state_window.search_text
        this.search_resolved = state_window.search_resolved

        // Need to deep clone the objects because Vue extends prototypes when state added to the vm
        let tab_groups = state_window.tab_groups.map( cloneTabGroup )
        tab_groups.forEach( tab_group => {
          // @todo check existing state
          tab_group.is_open = true
        })

        // Use the extended splice to trigger change detection
        Object.getPrototypeOf( this.tab_groups ).splice.apply( this.tab_groups, [ 0, this.tab_groups.length, ...tab_groups ] )

        // Need to deep clone the objects because Vue extends prototypes when state added to the vm
        let pinned_tabs = state.window.pinned_tabs.map( cloneTab )

        // Use the extended splice to trigger change detection
        Object.getPrototypeOf( this.pinned_tabs ).splice.apply( this.pinned_tabs, [ 0, this.pinned_tabs.length, ...pinned_tabs ] )

        this.theme = state.config.theme
      } else {
        // @todo error
      }
    }

    loadState( window.store.getState() )

    // Attach listener to background state changes so we can update the data
    const unsubscribe = window.store.subscribe( () => {
      loadState( window.store.getState() )
    })
    window.addEventListener( 'unload', ( event ) => {
      unsubscribe()
    })
  },
  computed: {
    __MSG_tab_search_placeholder__: function() {
      return getMessage( "tab_search_placeholder" )
    }
  },
  methods: {
    getCountMessage,
    createTabGroup: function() {
      // Create new group with default properties in the store
      window.store.dispatch( createGroup( this.window_id ) )
      // @todo create new tab in the new group
    },
    onUpdateSearchText: debounce( function( search_text ) {
      console.info('runSearch', search_text)
      runTabSearch( window.store, this.window_id, search_text )
    }, 250 ),
    toggleTabGroupOpen: function( tab_group ) {
      tab_group.is_open = ! tab_group.is_open
    }
  }
}
</script>

<style scoped>
.sidebar {
  width: 100%;
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

.sidebar-tab-group-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
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
  flex: 1;
}
</style>
