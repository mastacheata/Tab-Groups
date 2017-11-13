<template>
  <body class="sidebar">
    <div class="sidebar-tab-group-list">
      <div class="sidebar-tab-group-list-item" v-for="tab_group in tab_groups" v-bind:key="tab_group.id">
        <div class="sidebar-tab-group-list-item-header">
          <span class="text">
            <span v-on:click="toggleTabGroupOpen( tab_group.id )">{{ is_tab_group_open[ tab_group.id ] ? '-' : '+' }}</span>
            {{ tab_group.name }}
          </span>

          <span class="sidebar-tab-group-list-item-header-tab-count">{{ tab_group.tabs_count }}&nbsp;tabs</span>
        </div>
        <div v-if="is_tab_group_open[ tab_group.id ] || true" class="sidebar-tab-group-tabs-list">
          <SidebarTabItem class="sidebar-tab-group-tabs-list-item" v-bind:tab="tab" v-for="tab in tab_group.tabs" v-bind:key="tab.id"/>
        </div>
      </div>
    </div>
  </body>
</template>

<script>
import '../store/actions.mjs'

import SidebarTabItem from './SidebarTabItem.vue'

export default {
  name: 'sidebar',
  components: {
    SidebarTabItem
  },
  data() {
    // @todo pull data from binding

    return {
      window_id: null,
      active_tab_group_id: null,
      is_tab_group_open: [],
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
    window.addEventListener( 'beforeunload', this.unload() )

    browser.windows.getCurrent()
      .then(
        ( current_window ) => {
          console.info('current_window', current_window)
          this.window_id = current_window.id

          if( ! window.background.store ) {
            return
          }

          const loadState = ( state ) => {
            const state_window = state.windows.find( ( window ) => window.id = this.window_id )
            if( state_window ) {
              console.info('@todo update data from state', state)
              this.active_tab_group_id = state_window.active_tab_group_id
              this.tab_groups = state_window.tab_groups
              // @todo what else is required here?
            } else {
              // @todo error
            }
          }

          window.background.store
            .then(
              ( store ) => {
                loadState( store.getState() )

                // Attach listener to background state changes so we can update the data
                this.unsubscribe = store.subscribe( () => {
                  loadState( store.getState() )
                })
              }
            )
        },
        ( err ) => {
          console.error('err')
        }
      )
  },
  // ready() {
  // },
  methods: {
    toggleTabGroupOpen: function( tab_group_id ) {
      console.info('toggleTabGroupOpen',tab_group_id)
      this.is_tab_group_open[ tab_group_id ] = ! this.is_tab_group_open[ tab_group_id ]
    },
    // @todo add functions here to dispatch on the window.background.store
    unload: function() {
      console.info('calling unsubscribe')
      if( this.unsubscribe ) {
        this.unsubscribe()
      }
    }
  }
}
</script>

<style scoped>
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
  flex: 0;
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
