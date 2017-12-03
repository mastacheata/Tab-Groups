<template>
  <body class="options">
    <form>
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
    }
  }
}
</script>

<style scoped>
</style>
