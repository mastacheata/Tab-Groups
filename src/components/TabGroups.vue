<template>
  <div class="page">
    <div v-on:click="createTabGroup()">New Group</div>
  </div>
</template>

<script>
export default {
  name: 'page',
  data() {
    return {}
  },
  methods: {
    createTabGroup: function() {
      debugger;
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
