<template>
  <ValidationProvider
    v-slot="{ errors }"
    name="Password"
    rules="required|password|passwordLength"
    :vid="vid"
  >
    <v-text-field
      v-bind:type="showPassword ? 'text' : 'password'"
      @click:append="showPassword = !showPassword"
      prepend-icon="mdi-lock"
      v-bind:append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
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
    label: {
      type: String
    }
  },
  data: () => ({
    showPassword: false
  }),
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
