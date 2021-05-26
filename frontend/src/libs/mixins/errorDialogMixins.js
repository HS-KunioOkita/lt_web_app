export default {
  data () {
    return {
      showErrorDialog: false
    }
  },
  created () {
    this.$mount()
    document.body.appendChild(this.$el)
    this.showErrorDialog = true
  },
  methods: {
    closeErrorDialog () {
      this.showErrorDialog = false
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
