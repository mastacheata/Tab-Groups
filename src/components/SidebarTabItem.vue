<template>
  <div class="sidebar-tab-view-item">
    <!-- @todo favicon & preview image -->
    <span>{{ tab.title }}</span>
    <span>{{ tab.url }}</span>
  </div>
</template>

<script>
export default {
  name: 'sidebar-tab-item',
  props: [
    'tab'
  ],
  // data() {
  //   console.info('current window_id', browser.windows.getCurrent())

  //   return {
  //     window_id: null,
  //     tab_groups: [
  //       {
  //         id: 1,
  //         name: "group 1"
  //       }
  //     ]
  //   }
  // }
}
</script>

<style scoped>
.sidebar-tab-view-item {
  padding: 10px;
  width: 100%;
  color: #fff;
  background-color: #202340; /* Photon Ink 80 */
}
</style>
