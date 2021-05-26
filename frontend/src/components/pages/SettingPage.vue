<template>
  <div>
    <h2 class="heading16">アプリ設定</h2>
    <div class="contents">
      <v-card>
        <v-card-title>
          <span class="text-h5">設定</span>
        </v-card-title>

        <v-card-text>
          <div class="setting">
            ToDo
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn class="info" @click="openDialog">編集</v-btn>
        </v-card-actions>
      </v-card>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    openDialog () {}
  }
}
</script>

<style scoped>
  .contents {
    margin: 20px auto;
    width: 800px;
  }

  .setting {
    display: flex;
    justify-content: center;
    border: 1px solid #ddd;
    padding: 20px;
  }
</style>
