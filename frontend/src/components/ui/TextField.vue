<template>
  <ValidationProvider
    v-slot="{ errors }"
    :name="name"
    :rules="rules"
    :vid="vid"
  >
    <v-text-field
      v-model="field"
      :label="label"
      :error-messages="errors"
    />
  </ValidationProvider>
</template>

<script>
export default {
  props: {
    value: {
      type: String
    },
    vid: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    rules: {
      type: String,
      default: ''
    }
  },

  computed: {
    field: {
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
