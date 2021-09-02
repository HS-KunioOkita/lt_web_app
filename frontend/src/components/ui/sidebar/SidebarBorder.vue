<template>
  <div
    id="sidebar-border"
  >
    <span
      id="sidebar-border-btn"
      v-on:click="toggleSidebar"
    />
  </div>
</template>
<script>
export default {
  props: {
    isSidebarOpened: {
      type: Boolean,
      required: true
    }
  },
  methods: {
    toggleSidebar () {
      this.$emit('toggle-sidebar')
    }
  }
}
</script>
<style scoped>
  #sidebar-border {
    width: 11px;
    height: 100%;
    position: relative;
    right: -8px;
    z-index: 10;
  }
  #sidebar-border:hover {
    cursor: col-resize;
  }
  #sidebar-border-btn {
    position: absolute;
    width: 4px;
    height: 14px;
    top: 50%;
    left: 6px;
    background-image: url("https://spdlybra.nintendo.co.jp/confluence/s/bbtp2o/8402/5ff8b7711c026b858b516680bf4cbce6e3b009f8/1.0.9/_/download/resources/com.atlassian.confluence.plugins.confluence-icons:confluence-icon-resources/assets/icons/confluence-icon-grab-handle.svg");
  }
</style>
