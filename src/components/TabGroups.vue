<template>
  <body class="tab-groups" :class="theme">
    <TabGroupsSingleView></TabGroupsSingleView>
  </body>
</template>

<script>
import TabGroupsSingleView from './TabGroupsSingleView.vue'

export default {
  name: 'tab-groups',
  components: {
    TabGroupsSingleView
  },
  data() {
    return {
      theme: null
    }
  },
  created() {
    const loadState = ( state ) => {
      this.theme = state.config.theme
    }

    // @todo this code is duplicated
    loadState( window.store.getState() )

    // Attach listener to background state changes so we can update the data
    const unsubscribe = window.store.subscribe( () => {
      loadState( window.store.getState() )
    })
    window.addEventListener( 'unload', ( event ) => {
      unsubscribe()
    })
  },
  methods: {
    createTabGroup: function() {
    }
  }
}
</script>

<style>
body {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    margin: 0;
}

.app {
    color: #444;
    margin-top: 100px;
    max-width: 600px;
    font-family: Helvetica, sans-serif;
    text-align: center;
    display: flex;
    align-items: center;
}
</style>
