<template>
  <body class="options">
    <form v-on:submit.prevent>
      <section>
        <label>
          <button v-on:click="reset()">Reset</button>
        </label>
      </section>
    </form>
  </body>
</template>

<script>
export default {
  name: 'options',
  data() {
    return {
    }
  },
  methods: {
    reset: function() {
      console.info('reset')
    }
  }
}
</script>

<style scoped>
</style>
