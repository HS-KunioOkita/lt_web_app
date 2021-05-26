<template>
  <v-dialog
    v-model="showErrorDialog"
    width="300px"
    persistent
  >
    <v-card>
      <v-card-title>
        <span class="text-h5">エラー</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <div>
            エラーコード: {{ error.errorCode || 'undefined' }}
          </div>
          <div class="message">{{ message || error.errorMessage }}</div>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          color="info darken-1"
          text
          @click="_close"
        >OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import mixins from '@/libs/mixins/errorDialogMixins'

export default {
  mixins: [mixins],
  props: {
    error: {
      type: Function
    },
    message: {
      type: String,
      default: null
    },
    close: {
      type: [Function, Promise],
      default: () => {}
    }
  },
  methods: {
    _close () {
      this.close()
      this.closeErrorDialog()
    }
  }
}
</script>

<style scoped>
  .message {
    white-space: pre-wrap;
  }
</style>
