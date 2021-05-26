export default {
  data () {
    return {
      showLoadingDialog: false
    }
  },
  created () {
    this.$mount()
    document.body.appendChild(this.$el)
    this.showLoadingDialog = true
  },
  methods: {
    closeLoadingDialog () {
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
