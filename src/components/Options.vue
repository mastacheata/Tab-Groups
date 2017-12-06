<template>
  <body class="options">
    <form v-on:submit.prevent>
      <section>
        <button v-on:click="clearAllData()">Clear All Data</button>
        <button v-on:click="reset()">Reset</button>
      </section>
    </form>
  </body>
</template>

<script>
const WINDOW_TAB_GROUPS_KEY = 'tab_groups'

export default {
  name: 'options',
  data() {
    return {
      window_ids: []
    }
  },
  created() {
    const loadState = ( state ) => {
      let window_ids = state.windows.map( window => window.id )

      // Use the extended splice to trigger change detection
      Object.getPrototypeOf( this.window_ids ).splice.apply( this.window_ids, [ 0, this.window_ids.length, ...window_ids ] )
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
  methods: {
    clearAllData: function() {
      for( window_id of this.window_ids ) {
        browser.sessions.removeWindowValue( window_id, WINDOW_TAB_GROUPS_KEY )
      }
    },
    reset: function() {
      console.info('reset')
    }
  }
}
</script>

<style scoped>
</style>
