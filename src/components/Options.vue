<template>
  <body class="options">
    <nav class="sidenav">
      <ul>
        <li :class="{ 'active': selected_section === 'preferences' }">
          <a href="javascript:void(0)" @click="selectSection( 'preferences' )">Preferences</a>
        </li>
        <li :class="{ 'active': selected_section === 'data' }">
          <a href="javascript:void(0)" @click="selectSection( 'data' )">Data</a>
        </li>
      </ul>
    </nav>
    <article class="main">
      <section v-if="selected_section === 'preferences'">
        <form @submit.prevent>
          Theme:
          <div class="browser-style">
            <input type="radio" id="theme_light" value="light" v-model="preferences.theme" @input="selectTheme( 'light' )">
            <label for="theme_light">Light</label>
          </div>
          <div class="browser-style">
            <input type="radio" id="theme_dark" value="dark" v-model="preferences.theme" @input="selectTheme( 'dark' )">
            <label for="theme_dark">Dark</label>
          </div>
        </form>
      </section>
      <section v-if="selected_section === 'data'">
        <form @submit.prevent>
          <button @click="clearAllData()" class="browser-style">Clear All Data</button>
          <button @click="reset()" class="browser-style">Reset</button>
        </form>
      </section>
    </article>
  </body>
</template>

<script>
import {
  resetBrowserState,
  setTheme,
} from '../integrations/index.mjs'
import {
  onStateChange,
} from './helpers.mjs'

export default {
  name: 'options',
  data() {
    return {
      preferences: {
        theme: null
      },
      selected_section: 'preferences',
      window_ids: []
    }
  },
  created() {
    onStateChange( state => {
      console.info('loadState', state)
      let window_ids = state.windows.map( window => window.id )

      // Use the extended splice to trigger change detection
      Object.getPrototypeOf( this.window_ids ).splice.apply( this.window_ids, [ 0, this.window_ids.length, ...window_ids ] )

      this.preferences.theme = state.config.theme
    })
  },
  methods: {
    clearAllData() {
      resetBrowserState( window.store )
    },
    reset() {
      console.info('@todo reset')
    },
    selectSection( section_id ) {
      this.selected_section = section_id
    },
    selectTheme( theme_id ) {
      setTheme( theme_id )
    }
  }
}
</script>

<style scoped>
.options {
  display: flex;
  align-items: flex-start;
  flex-direction: row;
  justify-content: flex-start;
  align-content: stretch;
}

.sidenav {
  flex: 1;
  flex-grow: 0;
}

.sidenav ul {
  list-style: none;
  padding-left: 0;
}

.sidenav a {
  display: block;
  padding: 16px;
  font-size: 22px; font-weight: 300; /* Title 30 */
  color: #0c0c0d; /* Photon Primary Text */
  text-decoration: none;
}

.sidenav a:hover,
.sidenav a:focus {
  background-color: #d7d7db; /* Photon Grey 30 */
}

.sidenav a:focus {
  border: none;
}

.sidenav li.active a {
  color: #0a84ff; /* Photon Blue 50 */
}

.main {
  flex: 1;
  padding: 16px;
}
</style>
