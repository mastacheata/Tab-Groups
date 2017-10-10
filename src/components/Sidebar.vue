<template>
  <div>
    <ul>
      <li v-for="tab_group in tab_groups" v-bind:key="tab_group.id">
        {{ tab_group.name }}
        <ul>
          <li v-for="tab in tab_group.tabs" v-bind:key="tab.id">
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'sidebar',
  data() {
    return {
      tab_groups: [
        {
          id: 1,
          name: "group 1"
        }
      ]
    }
  }
}
</script>

<style scoped>
h1 {
  padding: 0 .25em;
}
</style>
