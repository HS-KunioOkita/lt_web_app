// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import vuetify from '@/plugins/vuetify'
import App from '@/App'
import router from '@/router'
import store from '@/store'
import ModalDialog from '@/components/ui/ModalDialog'
import axios from 'axios'
import VueAxios from 'vue-axios'
import Toasted from 'vue-toasted'
import {
  ValidationProvider,
  ValidationObserver,
  localize,
  extend
} from 'vee-validate'
import * as rules from 'vee-validate/dist/rules'
import ja from 'vee-validate/dist/locale/ja'
import StretchableSidebar from '@/components/ui/sidebar/StretchableSidebar'
import SidebarBorder from '@/components/ui/sidebar/SidebarBorder'
import Sidebar from '@/components/ui/sidebar/Sidebar'
import SlideUpDown from 'vue-slide-up-down'
import AccordionMenu from '@/components/ui/AccordionMenu'
import AccordionList from '@/components/ui/AccordionList'
import NumberField from '@/components/ui/NumberField'
import TextField from '@/components/ui/TextField'
import EmailField from '@/components/ui/EmailField'
import PasswordField from '@/components/ui/PasswordField'
import DatePicker from '@/components/ui/DatePicker'
import DatePickerEditDialog from '@/components/ui/DatePickerEditDialog'
import TextFieldEditDialog from '@/components/ui/TextFieldEditDialog'
import SelectFieldEditDialog from '@/components/ui/SelectFieldEditDialog'
import contextMenu from 'vue-context-menu'
import { VueLoading } from 'vue-loading-template'
import LoadingDialog from '@/components/ui/LoadingDialog'
import InfomationDialog from '@/components/ui/InfomationDialog'
import ErrorDialog from '@/components/ui/ErrorDialog'
import List from '@/components/ui/List'
import ListGroup from '@/components/ui/ListGroup'
import * as customRules from '@/libs/validation'
import mixins from '@/libs/mixins/mixins'
import '@/css/common.css'
import mavonEditor from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'
import 'mavon-editor/dist/markdown/github-markdown.min.css'
import 'mavon-editor/dist/highlightjs/highlight.min.js'
import 'mavon-editor/dist/katex/katex.min.css'
import 'mavon-editor/dist/katex/katex.min.js'

// ルール設定
for (var rule in rules) {
  extend(rule, rules[rule])
}
for (var customRule in customRules) {
  extend(customRule, customRules[customRule])
}

// 日本語化
localize('ja', ja)

Vue.config.productionTip = false
Vue.component('StretchableSidebar', StretchableSidebar)
Vue.component('SidebarBorder', SidebarBorder)
Vue.component('Sidebar', Sidebar)
Vue.component('ModalDialog', ModalDialog)
Vue.component('SlideUpDown', SlideUpDown)
Vue.component('AccordionMenu', AccordionMenu)
Vue.component('AccordionList', AccordionList)
Vue.component('TextField', TextField)
Vue.component('NumberField', NumberField)
Vue.component('EmailField', EmailField)
Vue.component('PasswordField', PasswordField)
Vue.component('DatePicker', DatePicker)
Vue.component('DatePickerEditDialog', DatePickerEditDialog)
Vue.component('TextFieldEditDialog', TextFieldEditDialog)
Vue.component('SelectFieldEditDialog', SelectFieldEditDialog)
Vue.component('ContextMenu', contextMenu)
Vue.component('ValidationObserver', ValidationObserver)
Vue.component('ValidationProvider', ValidationProvider)
Vue.component('VueLoading', VueLoading)
Vue.component('LoadingDialog', LoadingDialog)
Vue.component('InfomationDialog', InfomationDialog)
Vue.component('ErrorDialog', ErrorDialog)
Vue.component('List', List)
Vue.component('ListGroup', ListGroup)
Vue.use(VueAxios, axios)
Vue.use(Toasted)
Vue.use(mavonEditor)
Vue.mixin(mixins)

Vue.prototype.$version = 'v1.1.4'

/* eslint-disable no-new */
const vue = new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>',
  vuetify,
  store
})

export default vue
