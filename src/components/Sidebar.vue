<template>
  <body class="sidebar">
    <div v-on:click="createTabGroup()">Create New Group</div>
    <div class="sidebar-tab-group-list">
      <div class="sidebar-tab-group-list-item" v-for="tab_group in tab_groups" v-bind:key="tab_group.id">
        <div class="sidebar-tab-group-list-item-header">
          <span class="text">
            <span v-on:click="toggleTabGroupOpen( tab_group )">{{ tab_group.is_open ? '–' : '+' }}</span>
            {{ tab_group.name }}
          </span>

          <span class="sidebar-tab-group-list-item-header-tab-count">{{ getMessage( 'tabs_count', [ tab_group.tabs_count ] ) }}</span>
        </div>
        <div v-if="tab_group.is_open" class="sidebar-tab-group-tabs-list">
          <SidebarTabItem class="sidebar-tab-group-tabs-list-item" v-bind:tab="tab" v-for="tab in tab_group.tabs" v-bind:key="tab.id"/>
        </div>
      </div>
    </div>
  </body>
</template>

<script>
import SidebarTabItem from './SidebarTabItem.vue'
import { createGroup } from '../store/actions.mjs'
import { cloneTabGroup } from '../store/helpers.mjs'

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
      ]
    }
  },
  created() {
    const loadState = ( state ) => {
      const state_window = state.windows.find( window => window.id === this.window_id )
      if( state_window ) {
        console.info('@todo update data from state', state)
        // @todo if active_tab_group_id has changed, open the new active group
        this.active_tab_group_id = state_window.active_tab_group_id

        // Need to deep clone the objects because Vue extends prototypes when state added to the vm
        let tab_groups = state_window.tab_groups.map( cloneTabGroup )
        tab_groups.forEach( tab_group => {
          // @todo check existing state
          tab_group.is_open = true
        })

        // Use the extended splice to trigger change detection
        Object.getPrototypeOf( this.tab_groups ).splice.apply( this.tab_groups, [ 0, this.tab_groups.length, ...tab_groups ] )
        // @todo what else is required here?
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
  // ready() {
  // },
  methods: {
    // @todo this is duplicated with Action
    getMessage: function( key, args ) {
      return browser.i18n.getMessage( key, args )
    },
    createTabGroup: function() {
      console.info('createTabGroup', this.window_id)
      // Create new group with default properties in the store
      window.store.dispatch( createGroup( this.window_id ) )
      // @todo create new tab in the new group
    },
    toggleTabGroupOpen: function( tab_group ) {
      console.info('toggleTabGroupOpen', tab_group.id)
      tab_group.is_open = ! tab_group.is_open
    }
  }
}
</script>

<style scoped>
.sidebar {
  color: #fff; /* Photon White */
  background-color: #202340; /* Photon Ink 80 */
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
