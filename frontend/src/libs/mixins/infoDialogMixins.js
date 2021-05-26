export default {
  data () {
    return {
      showInfoDialog: false
    }
  },
  created () {
    this.$mount()
    document.body.appendChild(this.$el)
    this.showInfoDialog = true
  },
  methods: {
    closeInfoDialog () {
      this.showInfoDialog = false
      this.removeChild()
    },
    removeChild () {
      setTimeout(() => {
        if (document.body.contains(this.$el)) document.body.removeChild(this.$el)
        this.$destroy()
      }, 200)
    }
  }
}
