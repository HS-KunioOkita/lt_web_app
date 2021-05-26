<template>
  <v-dialog
    v-model="showLoadingDialog"
    width="100px"
    persistent
  >
    <v-card height="100px">
      <v-container fill-height fluid>
        <v-row align="center" justify="center">
          <VueLoading
            type="spiningDubbles"
            :color="color"
            :size="{
              width: '50px',
              height: '50px'
            }"
          />
        </v-row>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script>
import mixins from '@/libs/mixins/loadingDialogMixins'
import COLORS from '@/libs/colors'

export default {
  mixins: [mixins],
  data: () => ({
    color: COLORS.light.primary
  })
}
</script>
