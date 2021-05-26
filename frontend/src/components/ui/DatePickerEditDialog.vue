<template>
  <div
    v-if="disabled"
    v-bind:style="disabledStyle"
  >
    {{ convertStringFromDate(value) }}
  </div>
  <v-edit-dialog
    v-else
    :return-value.sync="picker"
    @save="saveItem"
    @open="open"
    @close="closeDialog"
    ref="editDialog"
  > {{ convertStringFromDate(value) }}
    <template v-slot:input>
      <DatePicker
        v-model="picker"
        :onClose="onClose"
        @validation="validation"
      />
    </template>
  </v-edit-dialog>
</template>

<script>
export default {
  props: {
    value: {
      type: Date
    },
    disabled: {
      type: Boolean,
      default: false
    },
    disabledStyle: {
      type: Object,
      default: () => ({
        background: 'rgb(202, 202, 202)',
        border: '1px solid rgb(146, 146, 146)',
        width: '100%',
        height: '100%',
        display: 'flex',
        'justify-content': 'center',
        'align-items': 'center'
      })
    },
    save: {
      type: [Function, Promise],
      default: () => {}
    },
    open: {
      type: [Function, Promise],
      default: () => {}
    },
    close: {
      type: [Function, Promise],
      default: () => {}
    }
  },
  data () {
    return {
      success: false
    }
  },
  computed: {
    picker: {
      get () {
        return this.value
      },
      set (val) {
        // value更新
        this.$emit('input', val)
      }
    }
  },
  methods: {
    validation (success) {
      this.success = success
    },
    saveItem () {
      if (this.success) {
        // 入力値が適正な時のみセーブ処理を実行
        this.save()
      }
    },
    closeDialog () {
      if (!this.success) {
        // 入力値が不正な時はダイアログを閉じさせない
        this.$refs.editDialog.isActive = true
        return
      }

      this.close()
    },
    onClose () {
      // DatePickerの入力が終わったら自動的にテキストフィールドにフォーカスする
      this.$refs.editDialog.focus()
    }
  }
}
</script>
