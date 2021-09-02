<template>
  <div>
    <div class="btn">
      <v-icon
        size="20"
        v-on:click="onClickTitle"
      >
        {{ icon }}
      </v-icon>
      <div
        @click="onClick"
        :class="selected ? 'selected' : ''"
      >
        {{ title }}
      </div>
    </div>
    <SlideUpDown :active="active" class="contents">
      <slot />
    </SlideUpDown>
  </div>
</template>

<script>
export default {
  props: {
    on: {
      type: Boolean,
      default: false
    },
    selected: {
      type: Boolean,
      default: false
    },
    title: {
      type: String
    },
    onClick: {
      type: Function
    }
  },

  watch: {
    on: function (newValue, oldValue) {
      this.active = newValue
    },

    active: function (newValue, oldValue) {
      this.icon = newValue ? 'mdi-chevron-down' : 'mdi-chevron-right'
    }
  },

  data () {
    return {
      active: false,
      icon: 'mdi-chevron-right'
    }
  },

  created () {
    this.initialize()
  },

  methods: {
    initialize () {
      this.active = this.on
    },

    onClickTitle () {
      this.active = !this.active
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

  .selected {
    font-weight: bold;
  }
</style>

<style>
  .btn .v-icon::after {
    background-color: rgba(0,0,0,0);
  }
</style>
