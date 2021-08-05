<template>
  <v-list-group
    no-action
    :prepend-icon="icon"
    @click="isOpen = !isOpen"
    :append-icon="isOpen ? 'mdi-chevron-down' : 'mdi-chevron-up'"
    class="custom-list-group"
  >
    <template v-slot:activator>
      <v-list-item-content>
        <v-list-item-title>{{ title }}</v-list-item-title>
      </v-list-item-content>
    </template>

    <slot />
  </v-list-group>
</template>

<script>
export default {
  props: {
    icon: {
      type: String,
      default: 'mdi-circle-small'
    },
    title: {
      type: String
    }
  },

  data () {
    return {
      isOpen: false
    }
  },
  methods: {

  }
}
</script>

<style>
  /* 余計な余白を削除 */
  .custom-list-group .v-list-item {
    padding: 0px;
  }
</style>
