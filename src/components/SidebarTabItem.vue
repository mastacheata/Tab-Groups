<template>
  <div class="sidebar-tab-view-item" :class="{ active: tab.active }" :title="tab.title"
       @click.left="openTab( tab )" @click.middle="closeTab( tab )"
  >
    <!-- @todo favicon & preview image -->
    <span class="sidebar-tab-view-item-title">{{ tab.title }}</span>
    <br>
    <span class="sidebar-tab-view-item-url">{{ tab.url }}</span>
  </div>
</template>

<script>
import {
  setTabActive,
  closeTab,
} from '../integrations/index.mjs'

export default {
  name: 'sidebar-tab-item',
  props: [
    'tab'
  ],
  methods: {
    openTab: function( tab ) {
      setTabActive( tab.id )
    },
    closeTab: function( tab ) {
      closeTab( tab.id )
    }
  }
}
</script>

<style scoped>
.sidebar-tab-view-item {
  padding: 10px;
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: clip;
}

.light .sidebar-tab-view-item.active {
  background-color: #f5f6f7; /* Light Theme header active tab background */
}

.light .sidebar-tab-view-item:hover {
  background-color: #cccdcf; /* Light Theme header tab hover background */
}

.light .sidebar-tab-view-item.active:hover {
  background-color: #f5f6f7; /* Light Theme header active tab background */
}

.light .sidebar-tab-view-item-title {
  color: black;
}

.light .sidebar-tab-view-item-url {
  color: #737373; /* Photon Grey 50 */
}

.dark .sidebar-tab-view-item.active {
  background-color: #323234; /* Dark Theme header active tab background */
}

.dark .sidebar-tab-view-item:hover {
  background-color: #252526; /* Dark Theme header tab hover background */
}

.dark .sidebar-tab-view-item.active:hover {
  background-color: #323234; /* Dark Theme header active tab background */
}

.dark .sidebar-tab-view-item-title {
  color: #fff; /* Photon White */
}

.dark .sidebar-tab-view-item-url {
  color: #737373; /* Photon Grey 50 */
}
</style>
