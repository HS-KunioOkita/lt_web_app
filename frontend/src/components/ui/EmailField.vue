<template>
  <ValidationProvider
    v-slot="{ errors }"
    name="Email"
    rules="required|email"
    :vid="vid"
  >
    <v-text-field
      prepend-icon="mdi-email"
      v-model="field"
      label="Email"
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
