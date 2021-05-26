import { convertStringFromDate } from '../utils'
import Vue from 'vue'
import ModalDialog from '@/components/ui/ModalDialog'
import InfomationDialog from '@/components/ui/InfomationDialog'
import ErrorDialog from '@/components/ui/ErrorDialog'
import LoadingDialog from '@/components/ui/LoadingDialog'

const mixins = {
  data () {
    return {
      loadingDialogInstance: null,
      loadingDialog: {
        open: async () => {
          this.loadingDialogInstance = await this.$dialog({
            components: LoadingDialog,
            propsData: {}
          })
        },
        close: () => {
          this.loadingDialogInstance.closeLoadingDialog()
          this.loadingDialogInstance = null
        }
      }
    }
  },
  methods: {
    convertStringFromDate (date) {
      return convertStringFromDate(date)
    },
    async $dialog (payload) {
      const VM = Vue.extend(payload.components)
      return new VM({
        parent: this,
        propsData: payload.propsData
      })
    },
    async $modalDialog (paylod) {
      await this.$dialog({
        components: ModalDialog,
        propsData: paylod
      })
    },
    async $infoDialog (paylod) {
      await this.$dialog({
        components: InfomationDialog,
        propsData: paylod
      })
    },
    async $errorDialog (paylod) {
      await this.$dialog({
        components: ErrorDialog,
        propsData: paylod
      })
    }
  }
}
export default mixins
