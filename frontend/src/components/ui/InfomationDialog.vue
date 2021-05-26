<template>
  <v-dialog
    v-model="showInfoDialog"
    width="300px"
    persistent
  >
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ title }}</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <div class="message">{{ message }}</div>
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
import mixins from '@/libs/mixins/infoDialogMixins'

export default {
  mixins: [mixins],
  props: {
    title: {
      type: String,
      default: ''
    },
    message: {
      type: String,
      default: ''
    },
    close: {
      type: [Function, Promise],
      default: () => {}
    }
  },
  methods: {
    _close () {
      this.close()
      this.closeInfoDialog()
    }
  }
}
</script>

<style scoped>
  .message {
    white-space: pre-wrap;
  }
</style>
