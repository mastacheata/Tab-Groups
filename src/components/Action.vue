<template>
  <body class="action" :class="theme">
    <div class="panel">
      <div class="panel-section panel-section-search">
        <input type="search" @input="onUpdateSearchText( search_text )" v-model="search_text" :placeholder="__MSG_tab_search_placeholder__"/>
      </div>

      <div class="panel-section panel-section-list panel-section-content">
        <div class="panel-list-item" v-for="tab_group in tab_groups" :key="tab_group.id" :class="{ 'active': tab_group.id === active_tab_group_id }">
          <div class="text" @click="selectTabGroup( tab_group )">
            {{ tab_group.title }}
          </div>
          <div @click="viewTabGroupTabs( tab_group )">
            <!-- @todo hover effect -->
            {{ getCountMessage( 'tabs', tab_group.tabs_count ) }}
          </div>
        </div>
      </div>

      <div class="panel-section panel-section-footer">
        <div class="panel-section-footer-button" @click="openTabGroupsPage()">
          <!-- @todo hi-res, context colours -->
          <img class="icon" src="/icons/action.png"/>
          <span class="text">{{ __MSG_tab_group_manage__ }}</span>
        </div>
        <div class="panel-section-footer-separator"></div>
        <div class="panel-section-footer-button panel-section-footer-button-options" @click="openOptionsPage()">
          <!-- @todo hi-res, context colours -->
          <img class="icon" src="/icons/options.png"/>
        </div>
      </div>
    </div>
  </body>
</template>

<script>
import { cloneTabGroup } from '../store/helpers.mjs'
import {
  getMessage,
  openOptionsPage,
  openTabGroupsPage,
  runTabSearch,
} from '../integrations/index.mjs'
import {
  debounce,
  getCountMessage,
  onStateChange,
} from './helpers.mjs'

export default {
  name: 'action',
  data() {
    return {
      window_id: window.current_window_id,
      active_tab_group_id: null,
      search_text: '',
      search_resolved: true,
      tab_groups: [
      ],
      theme: null
    }
  },
  created() {
    onStateChange( state => {
      const state_window = state.windows.find( ( window ) => window.id === this.window_id )
      if( state_window ) {
        this.active_tab_group_id = state_window.active_tab_group_id

        this.search_text = state_window.search_text
        this.search_resolved = state_window.search_resolved

        // Need to deep clone the objects because Vue extends prototypes when state added to the vm
        let tab_groups = state_window.tab_groups.map( cloneTabGroup )

        // Use the extended splice to trigger change detection
        Object.getPrototypeOf( this.tab_groups ).splice.apply( this.tab_groups, [ 0, this.tab_groups.length, ...tab_groups ] )

        this.theme = state.config.theme
      } else {
        // @todo error
      }
    })
  },
  computed: {
    __MSG_tab_group_manage__: function() {
      return getMessage( "tab_group_manage" )
    },
    __MSG_tab_search_placeholder__: function() {
      return getMessage( "tab_search_placeholder" )
    }
  },
  methods: {
    getCountMessage,
    onUpdateSearchText: debounce( function( search_text ) {
      console.info('runSearch', search_text)
      runTabSearch( window.store, this.window_id, search_text )
    }, 250 ),
    openOptionsPage() {
      openOptionsPage()
      window.close()
    },
    openTabGroupsPage() {
      openTabGroupsPage()
      window.close()
    },
    selectTabGroup( tab_group ) {
      console.info('@todo selectTabGroup')
      window.close()
    },
    viewTabGroupTabs( tab_group ) {
      console.info('@todo viewTabGroupTabs')
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

.light .panel-list-item.active {
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
</style>
