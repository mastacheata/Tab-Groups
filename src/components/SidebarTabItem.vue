<template>
  <div class="sidebar-tab-view-item" v-on:click="openTab( tab )" v-bind:title="tab.title" v-bind:class="{ active: tab.active }">
    <!-- @todo favicon & preview image -->
    <span class="sidebar-tab-view-item-title">{{ tab.title }}</span>
    <br>
    <span class="sidebar-tab-view-item-url">{{ tab.url }}</span>
  </div>
</template>

<script>
export default {
  name: 'sidebar-tab-item',
  props: [
    'tab'
  ],
  methods: {
    openTab: function( tab ) {
      // Activate the given tab in the window
      browser.tabs.update( tab.id, { active: true } )
    }
  }
}
</script>

<style scoped>
.sidebar-tab-view-item {
  padding: 10px;
  width: 100%;
  background-color: #202340; /* Photon Ink 80 */
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.sidebar-tab-view-item.active {
  background-color: #002275; /* Photon Blue 80 */
}

.sidebar-tab-view-item:hover {
  background-color: #002275; /* Photon Blue 80 */
}

.sidebar-tab-view-item-title {
  color: #fff; /* Photon White */
}

.sidebar-tab-view-item-url {
  color: #737373; /* Photon Grey 50 */
}
</style>
