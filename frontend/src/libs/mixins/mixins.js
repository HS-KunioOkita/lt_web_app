import { convertStringFromDate } from '@/libs/utils'
import Vue from 'vue'
import ModalDialog from '@/components/ui/ModalDialog'
import InfomationDialog from '@/components/ui/InfomationDialog'
import ErrorDialog from '@/components/ui/ErrorDialog'
import LoadingDialog from '@/components/ui/LoadingDialog'
import Md from 'markdown-it'
import hljs from 'highlight.js'
import sanitizer from 'markdown-it-sanitizer'
import emoji from 'markdown-it-emoji'
import katex from '@iktakahiro/markdown-it-katex'
import resizeImg from 'markdown-it-imsize'
import sup from 'markdown-it-sup'
import sub from 'markdown-it-sub'
import checkbox from 'markdown-it-checkbox'
import container from 'markdown-it-container'
import ins from 'markdown-it-ins'
import mark from 'markdown-it-mark'
import footnote from 'markdown-it-footnote'
import deflist from 'markdown-it-deflist'
import abbr from 'markdown-it-abbr'
import plantuml from 'markdown-it-plantuml'
import multimdTable from 'markdown-it-multimd-table'
import br from 'markdown-it-br'

// 全コンポーネントで使用できる共通データ
const mixins = {
  mounted () {
    let { title } = this.$options
    if (title) {
      title = typeof title === 'function' ? title.call(this) : title
      document.title = title
    }
  },

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
      },

      md: new Md({
        highlight: function (code, lang) {
          return hljs.highlightAuto(code, [lang]).value
        },
        html: true,
        linkify: false,
        breaks: true,
        typographer: true
      })
        .use(katex, { throwOnError: false, errorColor: '#cc0000' })
        .use(emoji)
        .use(checkbox)
        .use(sanitizer)
        .use(resizeImg, { autofill: true })
        .use(sup)
        .use(sub)
        .use(ins)
        .use(mark)
        .use(footnote)
        .use(deflist)
        .use(abbr)
        .use(container, 'info')
        .use(container, 'success')
        .use(container, 'warning')
        .use(container, 'danger')
        .use(plantuml)
        .use(multimdTable, {
          multiline: true,
          rowspan: true,
          headerless: true
        })
        .use(br)
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
