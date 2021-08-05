<template>
  <div>
    <div class="btn">
      <v-icon
        size="20"
        v-on:click="onClickTitle"
      >
        {{ icon }}
      </v-icon>
      <div @click="onClick">{{ title }}</div>
    </div>
    <SlideUpDown :active="active" class="contents">
      <slot />
    </SlideUpDown>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String
    },
    onClick: {
      type: Function
    }
  },

  data () {
    return {
      active: false,
      icon: 'mdi-chevron-right'
    }
  },

  methods: {
    onClickTitle () {
      this.active = !this.active
      this.icon = this.active ? 'mdi-chevron-down' : 'mdi-chevron-right'
    }
  }
}
</script>

<style scoped>
  .btn {
    display: flex;
    align-items: center;
  }

  .contents {
    margin-left: 20px;
  }
</style>

<style>
  .btn .v-icon::after {
    background-color: rgba(0,0,0,0);
  }
</style>
