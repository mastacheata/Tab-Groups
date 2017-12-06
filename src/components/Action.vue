<template>
  <body class="action">
    <div class="panel">
      <div class="panel-section panel-section-search">
        <input v-model="query_text" on-keyup="updateQueryText | debounce 400" :placeholder="__MSG_tab_search_placeholder__"/>
      </div>

      <!-- @todo style classes -->
      <div class="panel-section panel-section-list panel-section-content">
        <div class="panel-list-item" v-for="tab_group in tab_groups" v-bind:key="tab_group.id" v-bind:class="{ 'active': tab_group.id == active_tab_group_id }">
          <div class="text" v-on:click="selectTabGroup( tab_group )">
            {{ tab_group.title }}
          </div>
          <div v-on:click="viewTabGroupTabs( tab_group )">
            <!-- @todo hover effect -->
            <!-- @todo proper plural -->
            <!-- @todo localization -->
            {{ getMessage( 'tabs_count', [ tab_group.tabs_count ] ) }}
          </div>
        </div>
      </div>

      <div class="panel-section panel-section-footer">
        <div class="panel-section-footer-button" v-on:click="openTabGroupPage()">
          <i class="icon icon-tab-groups"></i>
          <span class="text">{{ __MSG_tab_group_manage__ }}</span>
        </div>
        <div class="panel-section-footer-separator"></div>
        <div class="panel-section-footer-button panel-section-footer-button-options" v-on:click="openOptionsPage()">
          <i class="icon icon-options"></i>
        </div>
      </div>
    </div>
  </body>
</template>

<script>
import { cloneTabGroup } from '../store/helpers.mjs'
import { activateGroup } from '../store/actions.mjs'

export default {
  name: 'action',
  data() {
    return {
      window_id: window.current_window_id,
      active_tab_group_id: null,
      tab_groups: [
      ]
    }
  },
  created() {
    const loadState = ( state ) => {
      const state_window = state.windows.find( ( window ) => window.id === this.window_id )
      if( state_window ) {
        console.info('@todo update data from state', state)
        this.active_tab_group_id = state_window.active_tab_group_id

        // Need to deep clone the objects because Vue extends prototypes when state added to the vm
        let tab_groups = state_window.tab_groups.map( cloneTabGroup )

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
  computed: {
    __MSG_tab_group_manage__: function() {
      return browser.i18n.getMessage( "tab_group_manage" )
    },
    __MSG_tab_search_placeholder__: function() {
      return browser.i18n.getMessage( "tab_search_placeholder" )
    }
  },
  methods: {
    getMessage: function( key, args ) {
      return browser.i18n.getMessage( key, args )
    },
    openOptionsPage: function() {
      browser.runtime.openOptionsPage()
      window.close()
    },
    openTabGroupPage: function() {
      // Using sidebar for now
      browser.sidebarAction.open()
        .then(
          () => {
            browser.sidebarAction.setPanel( { panel: browser.extension.getURL( "sidebar.html" ) } )
            window.close()
          }
        )

      // const url = browser.extension.getURL( "tab-groups.html" )

      // browser.tabs.create({ url })
      //   .then( () => {
      //     // We don't want to sync this URL ever nor clutter the users history
      //     browser.history.deleteUrl({ url })
      //   })
      //   .catch( ( ex ) => {
      //     throw ex
      //   })
    },
    selectTabGroup: function( tab_group ) {
      // @todo
      console.info('Action.selectTabGroup', tab_group.id)
    },
    viewTabGroupTabs: function( tab_group ) {
      // @todo
      console.info('Action.viewTabGroupTabs', tab_group.id)
    },
    updateQueryText: function() {
      this.content = this.query_text
      // @todo handle query change with page transition
    }
  }
}
</script>

<style scoped>
/* @todo which of these styles are required? */
.panel {
  overflow-x: hidden;
  width: 350px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.panel-section-search {
  padding: 5px;
}

.panel-section-search > input {
  width: 100%;
}

.panel-section-content {
  min-height: 100px;
  max-height: 200px;
  overflow: -moz-scrollbars-none;
}

.panel-list-item {
  min-height: 24px;
  max-height: 32px;
}

.panel-list-item.active {
  background-color: rgba(0, 0, 0, 0.06);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.panel-section-footer-button {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.panel-section-footer-button-options {
  flex: 0;
}

/* @todo should be moved to common css */
.icon {
  height: 16px;
  width: 16px;
  margin-right: 4px;
}

.icon-tab-groups {
  /* @todo high resolution if available */
  background-image: url( /icons/action.png );
}

.icon-options {
  /* @todo high resolution if available */
  background-image: url( /icons/options.png );
}
</style>
