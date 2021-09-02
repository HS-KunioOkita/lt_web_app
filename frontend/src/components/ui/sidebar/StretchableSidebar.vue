<template>
  <aside id="strechable-sidebar">
    <div :style="sidebarContentComputedStyle">
      <slot />
    </div>
  </aside>
</template>
<script>
export default {
  props: {
    isSidebarOpened: {
      type: Boolean,
      required: true
    }
  },
  computed: {
    sidebarContentComputedStyle () {
      if (this.isSidebarClosed) {
        return { transform: `translateX(-${window.innerWidth}px)` }
      } else {
        return {}
      }
    },
    isSidebarClosed () {
      return !this.isSidebarOpened
    }
  }
}
</script>
<style scoped>
  #strechable-sidebar {
    position: relative;
    overflow: hidden;
    user-select: none;
    overflow-y: scroll;
    padding: 10px;
  }
</style>
