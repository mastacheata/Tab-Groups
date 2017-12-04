<template>
  <body class="action">
    <div class="panel">
      <div class="panel-section panel-section-search">
        <input v-model="query_text" on-keyup="updateQueryText | debounce 400" :placeholder="__MSG_tab_search_placeholder__"/>
      </div>

      <!-- @todo style classes -->
      <div class="panel-section panel-section-list panel-section-content">
        <div class="panel-list-item" v-for="tab_group in tab_groups" v-bind:key="tab_group.id" v-bind:class="{ 'active': tab_group.id == 2 }">
          <div class="text" v-on:click="selectTabGroup( tab_group.id )">
            {{ tab_group.name }}
          </div>
          <div v-on:click="viewTabGroupTabs( tab_group.id )">
            <!-- @todo hover effect -->
            <!-- @todo proper plural -->
            {{ tab_group.tabs_count }} tab(s)
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
export default {
  name: 'action',
  data() {
    // @todo load from the store
    // browser.tabs.query({ currentWindow: true, windowType: 'normal' })

    return {
      tab_groups: [
        {
          id: 1,
          name: "group 1"
        }
      ]
    }
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
    openOptionsPage: function() {
      browser.runtime.openOptionsPage()
    },
    openTabGroupPage: function() {
      const url = browser.extension.getURL( "sidebar.html" )

      browser.tabs.create({ url })
        .then( () => {
          // We don't want to sync this URL ever nor clutter the users history
          browser.history.deleteUrl({ url })
        })
        .catch( ( ex ) => {
          throw ex
        })
    },
    selectTabGroup: function( tab_group_id ) {
      // @todo
      console.info('Action.selectTabGroup', tab_group_id)
    },
    viewTabGroupTabs: function( tab_group_id ) {
      // @todo
      console.info('Action.viewTabGroupTabs', tab_group_id)
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
