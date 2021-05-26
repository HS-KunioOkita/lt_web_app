<template>
  <ValidationObserver ref="observer" immediate>
    <ValidationProvider v-slot="{ errors }" name="日時" :rules="rules">
      <v-text-field
        v-model="dateTxt"
        :label="label"
        :width="width"
        :height="height"
        :disabled="disabled"
        :error-messages="errors"
        v-bind:counter="counter"
        v-bind:single-line="singleLine"
        @blur="convert"
        @keydown.enter="enter"
        ref="field"
      >
        <template v-slot:append-outer>
          <v-menu
            v-model="menu"
            offset-y
            :close-on-content-click="false"
            :disabled="disabled || pickerDisabled"
          >
            <template v-slot:activator="{ on }">
              <v-btn
                icon color="primary"
                dark
                elevation="0"
                v-on="on"
              >
                <v-icon>mdi-calendar</v-icon>
              </v-btn>
            </template>
            <v-date-picker
              v-model="picker"
              @click="menu = false"
              v-bind:range="range"
              locale="jp-ja"
              :day-format="date => new Date(date).getDate()"
            />
          </v-menu>
        </template>
      </v-text-field>
    </ValidationProvider>
  </ValidationObserver>
</template>

<script>
import {
  dateFormat,
  convertStringFromDate,
  convertDateFromString
} from '@/libs/utils'

export default {
  props: {
    value: {
      type: [Date, Array]
    },
    label: {
      type: String
    },
    width: {
      type: String
    },
    height: {
      type: String
    },
    disabled: {
      type: Boolean,
      default: false
    },
    counter: {
      type: String
    },
    'single-line': {
      type: String
    },
    required: {
      type: Boolean,
      default: false
    },
    range: {
      type: Boolean,
      default: false
    },
    onClose: {
      type: Function,
      default: () => {}
    }
  },
  data () {
    return {
      menu: false,
      rules: '',
      dateTxt: '',
      pickerDisabled: false
    }
  },
  created () {
    this.rules = this.required ? 'required|' : ''
    this.rules += 'date'
  },
  watch: {
    value: {
      immediate: true,
      handler (n, o) {
        this.dateTxt = convertStringFromDate(n)
      }
    }
  },
  computed: {
    picker: {
      get () {
        return convertStringFromDate(this.value, 'YYYY-MM-DD')
      },
      set (val) {
        if (this.range) {
          const vals = val.map(x => convertDateFromString(x))
          this.$emit('input', vals)
          if (val.length === 2) {
            this.menu = false
            this.onClose()
          }
          return
        }

        // 文字列からDateを生成
        const date = convertDateFromString(val)
        // text-fieldの値も更新する
        this.dateTxt = convertStringFromDate(date)
        // value更新
        this.$emit('input', date)

        // date-pickerを閉じる
        this.menu = false
        this.onClose()
      }
    }
  },
  methods: {
    convert (event) {
      if (this.check()) {
        this.pickerDisabled = false
        // value更新
        this.$emit('input', convertDateFromString(this.dateTxt))
        this.$emit('validation', true)
        this.onClose()

        return true
      } else {
        this.pickerDisabled = true
        // 日時形式でない文字列の場合はフォーカスを外させない
        this.$nextTick(() => this.$refs.field.focus())
        this.$emit('validation', false)

        return false
      }
    },
    enter (event) {
      if (this.convert(event)) {
        // フォーカスを外す
        this.$nextTick(() => this.$refs.field.blur())
      }
    },
    check () {
      return this.dateTxt === '' || dateFormat.test(this.dateTxt)
    }
  }
}
</script>
