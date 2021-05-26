<template>
  <div
    v-if="disabled"
    v-bind:style="disabledStyle"
  >
    {{ picker }}
  </div>
  <v-edit-dialog
    v-else
    :return-value.sync="picker"
    @save="saveItem"
    @open="open"
    @close="closeDialog"
    ref="editDialog"
  > {{ picker }}
    <template v-slot:input>
      <ValidationObserver
        ref="observer"
        immediate
      >
        <ValidationProvider
          v-slot="{ errors }"
          :name="name"
          :rules="rules"
        >
          <v-text-field
            v-model="picker"
            :error-messages="errors"
            single-line
            counter
          />
        </ValidationProvider>
      </ValidationObserver>
    </template>
  </v-edit-dialog>
</template>

<script>
export default {
  props: {
    value: {
      type: String
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
    name: {
      type: String
    },
    rules: {
      type: String
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
      invalid: false
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
    async saveItem () {
      const valid = await this.$refs.observer.validate()
      if (valid) {
        // 入力値が適正な時のみセーブ処理を実行
        this.save()
      }
    },
    async closeDialog () {
      const valid = await this.$refs.observer.validate()
      if (!valid) {
        // 入力値が不正な時はダイアログを閉じさせない
        this.$refs.editDialog.isActive = true
        return
      }

      this.close()
    }
  }
}
</script>
