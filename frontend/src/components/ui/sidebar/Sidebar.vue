<template>
  <div
    id="sidebar"
    :style="stretchableSidebarComputedStyle"
  >
    <StretchableSidebar
      :isSidebarOpened="isSidebarOpened"
      class="stretchableSidebar"
    >
      <div>{{ title }}</div>
      <v-divider />
      <slot />
    </StretchableSidebar>
    <SidebarBorder
      :isSidebarOpened="isSidebarOpened"
      @mousedown.native="startStretch"
      @toggle-sidebar="toggleSidebar"
    />
  </div>
</template>

<script>
const LEEWAY = 10

export default {
  props: {
    value: {
      type: Number
    },
    contentsId: {
      type: String,
      default: 'app'
    },
    defaultWidth: {
      type: Number,
      required: true
    },
    maxWidth: {
      type: Number,
      required: true
    },
    minWidth: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      stretchableSidebarStyle: {
        width: 0
      },
      pageRect: {
        width: 0,
        height: 0
      },
      toggleBtnStyle: {
        width: null
      }
    }
  },

  created () {
    this.stretchableSidebarStyle.width = this.defaultWidth
  },

  computed: {
    stretchableSidebarComputedStyle () {
      return {
        '--width': `${this.stretchableSidebarStyle.width}px`
      }
    },
    isSidebarOpened () {
      return this.stretchableSidebarStyle.width > this.minWidth
    }
  },
  mounted () {
    this.setScreenData()
    this.addResizeEvent()
  },
  beforeDestroy () {
    this.removeResizeEvent()
  },
  methods: {
    setScreenData () {
      this.setPageRect()
    },
    setPageRect () {
      // サイドバーの親要素の横幅と高さを保存。
      const { width, height } = document.getElementById(this.contentsId).getBoundingClientRect()
      this.pageRect.width = width
      this.pageRect.height = height
    },
    startStretch () {
      // 画面上でポインターを動かす度に、handleMoveが呼ばれるようにする。
      window.addEventListener('mousemove', this.handleMove)
      window.addEventListener('mouseup', this.finishStretch)
    },
    finishStretch () {
      window.removeEventListener('mousemove', this.handleMove)
      window.removeEventListener('mouseup', this.finishStretch)
    },
    handleMove (event) {
      const { pageX } = event
      if (pageX > this.minWidth - LEEWAY && pageX < this.maxWidth + LEEWAY) {
        this.stretchableSidebarStyle.width = pageX
      } else if (pageX >= this.maxWidth + LEEWAY) {
        this.stretchableSidebarStyle.width = this.maxWidth
        this.finishStretch()
      } else {
        this.stretchableSidebarStyle.width = this.minWidth
        this.finishStretch()
      }
      this.$emit('input', this.stretchableSidebarStyle.width)
    },
    addResizeEvent () {
      window.addEventListener('resize', this.setScreenData)
    },
    removeResizeEvent () {
      window.removeEventListener('resize', this.setScreenData)
    },
    toggleSidebar () {
      if (this.stretchableSidebarStyle.width === this.minWidth) {
        this.stretchableSidebarStyle.width = this.defaultWidth
      } else {
        this.stretchableSidebarStyle.width = this.minWidth
      }
      this.$emit('input', this.stretchableSidebarStyle.width)
    }
  }
}
</script>
<style scoped>
  #sidebar {
    display: flex;
    width: var(--width);
  }

  .stretchableSidebar {
    width: 100%;
  }
</style>
