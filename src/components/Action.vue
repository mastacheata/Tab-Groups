<template>
  <div class="panel">
    <div class="panel-section">
      <input v-model="query_text" on-keyup="updateQueryText | debounce 400" placeholder="Search for a tab…"/>
    </div>

    <!-- @todo remove -->
    {{ content }}

    <div class="panel-section-separator"></div>

    <!-- @todo style classes -->
    <div class="panel-section">
      <ul>
        <li v-for="tab_group in tab_groups" v-bind:key="tab_group.id">
          <div>
            <!-- @todo clickable to select -->
            {{ tab_group.name }}
          </div>
          <div>
            <!-- @todo clickable to open -->
            <!-- @todo hover effect -->
            <!-- @todo proper plural -->
            <!-- {{ tab_group.tabs.length }} tab(s) -->
          </div>
        </li>
      </ul>
    </div>

    <div class="panel-section-separator"></div>

    <!-- @todo style classes -->
    <!-- @todo flex -->
    <div class="panel-section">
      <div v-on:click="openTabGroupPage()">
        <!-- @todo icon -->
        <!-- @todo link to main groups page -->
        <span>Manage my groups</span>
      </div>
      <div v-on:click="openOptionsPage()">
        Settings
        <!-- @todo icon -->
        <!-- @todo link to main settings page -->
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'action',
  data() {
    return {
      tab_groups: [
        {
          id: 1,
          name: "group 1"
        }
      ]
    }
  },
  methods: {
    openOptionsPage: function() {
      browser.runtime.openOptionsPage()
    },
    openTabGroupPage: function() {
      const url = browser.extension.getURL( "tab-groups.html" )

      browser.tabs.create({ url })
        .then( () => {
          // We don't want to sync this URL ever nor clutter the users history
          browser.history.deleteUrl({ url })
        })
        .catch( ( ex ) => {
          throw ex
        })
    },
    updateQueryText: function() {
      this.content = this.query_text
      // @todo handle query change with page transition
    }
  }
}
</script>

<style scoped>
body {
  width: 350px;
}

a {
  margin: 10px;
  display: inline-block;
}

.switch-tabs a {
  display: block;
}

.panel {
  margin: 5px;
}
</style>
