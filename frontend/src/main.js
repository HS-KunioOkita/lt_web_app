// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import vuetify from '@/plugins/vuetify'
import App from './App'
import router from './router'
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
import NumberField from '@/components/ui/NumberField'
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
import * as customRules from '@/libs/validation'
import mixins from '@/libs/mixins/mixins'
import '@/css/common.css'

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
Vue.component('ModalDialog', ModalDialog)
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
Vue.use(VueAxios, axios)
Vue.use(Toasted)
Vue.mixin(mixins)

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
