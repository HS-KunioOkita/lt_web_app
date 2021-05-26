export default {
  data () {
    return {
      showModalDialog: false
    }
  },
  created () {
    this.$mount()
    document.body.appendChild(this.$el)
    this.showModalDialog = true
  },
  methods: {
    closeModalDialog () {
      this.showModalDialog = false
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
