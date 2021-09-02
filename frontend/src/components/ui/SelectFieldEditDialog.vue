<template>
  <div
    v-if="disabled"
    v-bind:style="disabledStyle"
  >
    {{ text }}
  </div>
  <v-edit-dialog
    v-else
    :return-value.sync="picker"
    @save="save"
    @open="open"
    @close="close"
  > {{ text }}
    <template v-slot:input>
      <v-select
        v-model="picker"
        :items="items"
        :item-text="itemText"
        :item-value="itemValue"
        single-line
      />
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
    text: {
      type: String
    },
    items: {
      type: Array,
      default: () => []
    },
    itemText: {
      type: String
    },
    itemValue: {
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
  }
}
</script>
