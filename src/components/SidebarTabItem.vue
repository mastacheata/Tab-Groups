<template>
  <div class="sidebar-tab-view-item-container">
    <div class="sidebar-tab-view-item" :class="{ active: tab.active }" :title="tab.title"
        @click.left="openTab" @click.middle="closeTab"
        draggable="true" @drag="onTabDrag" @dragstart="onTabDragStart" @dragenter="onTabDragEnter" @dragover="onTabDragOver" @dragexit="onTabDragExit" @dragleave="onTabDragLeave" @dragend="onTabDragEnd" @drop="onTabDrop"
    >
      <img class="sidebar-tab-view-item-icon" :src="tab.favIconUrl"/>
      <div>
        <span class="sidebar-tab-view-item-title">{{ tab.title }}</span>
        <br>
        <span class="sidebar-tab-view-item-url">{{ tab.url }}</span>
      </div>
    </div>
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
    openTab() {
      setTabActive( this.tab.id )
    },
    closeTab() {
      closeTab( this.tab.id )
    },
    onTabDrag( event ) {
      console.info('onTabDrag', event)
    },
    onTabDragStart( event ) {
      console.info('onTabDragStart', event)
      event.dataTransfer.setData( 'text/plain', `tab:${ this.tab.id }` )
      event.dataTransfer.effectAllowed = 'move'
    },
    onTabDragEnter( event ) {
      console.info('onTabDragEnter', event)
    },
    onTabDragExit( event ) {
      console.info('onTabDragExit', event)
    },
    onTabDragLeave( event ) {
      console.info('onTabDragLeave', event)
    },
    onTabDragOver( event ) {
      console.info('onTabDragOver', event)
      event.dataTransfer.dropEffect = 'move'
    },
    onTabDragEnd( event ) {
      console.info('onTabDragEnd', event)
    },
    onTabDrop( event ) {
      console.info('onTabDrop', event, event.dataTransfer.getData( 'text/plain' ) )
    }
  }
}
</script>

<style scoped>
.sidebar-tab-view-item-container {
  width: 100%;
}

.sidebar-tab-view-item {
  display: flex;
  align-items: center;
  padding: 10px;
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: clip;
}

.sidebar-tab-view-item-icon {
  width: 24px;
  height: 24px;
  margin-right: 8px;
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
