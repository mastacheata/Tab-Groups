import Vue from 'vue'

import Action from './components/Action.vue'
import Options from './components/Options.vue'
import TabGroups from './components/TabGroups.vue'
import Sidebar from './components/Sidebar.vue'

new Vue({
  el: '#action',
  render: ( h ) => h( Action )
})

new Vue({
  el: '#options',
  render: ( h ) => h( Options )
})

new Vue({
  el: '#tab-groups',
  render: ( h ) => h( TabGroups )
})

new Vue({
  el: '#sidebar',
  render: ( h ) => h( Sidebar )
})
