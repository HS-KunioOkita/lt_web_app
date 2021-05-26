<template>
  <div>
    <h2 class="heading16">ユーザー設定</h2>
    <div class="contents">
      <v-card>
        <v-card-title>
          <span class="text-h5">プロフィール</span>
        </v-card-title>

        <v-card-text>
          <div class="profile">
            <div class="image">
              <v-avatar size="150">
                <img :src="$store.state.user.imageSrc" />
              </v-avatar>
            </div>
            <table>
              <tr>
                <th>名前</th>
                <td>{{ $store.state.user.name }}</td>
              </tr>
              <tr>
                <th>Email</th>
                <td>{{ $store.state.user.email }}</td>
              </tr>
              <tr>
                <th>権限</th>
                <td>{{ $store.state.user.adminFlg ? '管理者' : '一般' }}</td>
              </tr>
            </table>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn class="info" @click="openProfileDialog">編集</v-btn>
        </v-card-actions>
      </v-card>

      <div class="card">
        <v-card>
          <v-card-title>
            <span class="text-h5">パスワード変更</span>
          </v-card-title>

          <ValidationObserver v-slot="{ invalid }" immediate>
            <v-card-text>
                <div class="password">
                  <div class="passwordContents">
                    <PasswordField
                      v-model="editedPassword.now"
                      vid="now"
                      label="現在のパスワード"
                    />
                    <PasswordField
                      v-model="editedPassword.new"
                      vid="new"
                      label="新しいパスワード"
                    />
                  </div>
                </div>
            </v-card-text>

            <v-card-actions>
              <v-spacer />
              <v-btn
                class="info"
                :disabled="invalid"
                @click="openPasswordDialog"
              >
                保存
              </v-btn>
            </v-card-actions>
          </ValidationObserver>
        </v-card>
      </div>
    </div>

    <v-dialog
      v-model="profileDialog"
      max-width="500px"
      persistent
    >
      <v-card>
        <ValidationObserver v-slot="{ invalid }" immediate>
          <v-card-title>
            <span class="headline">プロフィール編集</span>
          </v-card-title>

          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12" sm="6" md="12">
                  <ValidationProvider
                    v-slot="{ errors }"
                    name="名前"
                    rules="required|userName"
                  >
                    <v-text-field
                      prepend-icon="mdi-account-circle"
                      v-model="editedItem.name"
                      label="名前"
                      :error-messages="errors"
                    />
                  </ValidationProvider>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="info darken-1"
              text
              @click="closeProfileDialog"
            >
              Cancel
            </v-btn>
            <v-btn
              color="info darken-1"
              text
              @click="saveProfile"
              :disabled="invalid"
            >
              Save
            </v-btn>
          </v-card-actions>
        </ValidationObserver>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="passwordDialog"
      max-width="500px"
      persistent
    >
      <v-card>
        <v-card-title>
          <span class="headline">確認</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            パスワードを更新しますか？
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="info darken-1"
            text
            @click="closePasswordDialog"
          >
            Cancel
          </v-btn>
          <v-btn
            color="info darken-1"
            text
            @click="savePassword"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { reload } from '@/libs/utils'

export default {
  data () {
    return {
      profileDialog: false,
      passwordDialog: false,
      editedItem: {},
      editedPassword: {}
    }
  },
  created () {
    this.initialize()
  },
  methods: {
    initialize () {
      this.editedItem = {
        name: ''
      }
      this.editedPassword = {
        now: '',
        new: ''
      }
    },

    openProfileDialog () {
      this.editedItem = {
        name: this.$store.state.user.name
      }
      this.profileDialog = true
    },
    async saveProfile () {
      this.loadingDialog.open()

      await this.$store.state.user.updateProfile({
        name: this.editedItem.name
      })

      this.closeProfileDialog()
      this.loadingDialog.close()
    },
    closeProfileDialog () {
      this.profileDialog = false
      this.initialize()
    },
    openPasswordDialog () {
      this.passwordDialog = true
    },
    async savePassword () {
      this.loadingDialog.open()

      try {
        await this.$store.state.user.updatePassword(
          this.editedPassword.now,
          this.editedPassword.new
        )
        this.closePasswordDialog()

        // 更新完了ダイアログを表示
        this.$infoDialog({
          title: '成功',
          message: 'パスワードを更新しました。',
          close: () => {
            // ダイアログを閉じたらリロードする
            reload()
          }
        })
      } catch (error) {
        // エラーダイアログ表示
        this.$errorDialog({
          error: error.class
        })
        // 確認ダイアログを閉じる
        this.passwordDialog = false
      }

      this.loadingDialog.close()
    },
    closePasswordDialog () {
      this.passwordDialog = false
      this.initialize()
    }
  }
}
</script>

<style scoped>
  .contents {
    margin: 20px auto;
    width: 800px;
  }

  .profile {
    display: flex;
    justify-content: center;
    border: 1px solid #ddd;
    padding: 20px;
  }

  .password {
    border: 1px solid #ddd;
    padding: 20px;
  }

  .passwordContents {
    margin: auto;
    width: 500px;
  }

  .card {
    padding-top: 40px;
  }

  .image {
    padding-right: 30px;
  }

  table {
    width: 60%;
    border-spacing: 0;
  }

  table th {
    border-bottom: solid 2px #fb5144;
    padding: 10px 0;
  }

  table td {
    border-bottom: solid 2px #ddd;
    text-align: center;
    padding: 10px 0;
  }
</style>
