<template>
  <v-app>
    <div class="contents">
      <v-card width="400px">
        <v-card-title>
          <h1 class="display-1">ログイン</h1>
        </v-card-title>
        <v-card-text>
          <v-text-field
            prepend-icon="mdi-account-circle"
            label="ユーザ名"
            v-model="user.email"
            @keydown.enter="login"
          />
          <v-text-field
            v-bind:type="showPassword ? 'text' : 'password'"
            @click:append="showPassword = !showPassword"
            prepend-icon="mdi-lock"
            v-bind:append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            label="パスワード"
            v-model="user.password"
            @keydown.enter="login"
          />
          <v-card-actions>
            <v-btn class="info" @click="login">ログイン</v-btn>
            <v-btn
              v-if="isDev"
              class="info"
              @click="createTestUser"
            >
              テスト用ユーザー作成
            </v-btn>
          </v-card-actions>
        </v-card-text>
      </v-card>
    </div>

    <v-dialog
      v-model="dialog"
      max-width="500px"
      persistent
    >
      <v-card>
        <ValidationObserver v-slot="{ invalid }" immediate>
          <v-card-title>
            <span class="headline">テスト用ユーザー作成</span>
          </v-card-title>

          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12" sm="6" md="12">
                  <EmailField
                    v-model="editedItem.email"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="12">
                  <PasswordField
                    v-model="editedItem.password"
                  />
                </v-col>
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
                <v-col cols="12" sm="6" md="6">
                  <v-checkbox
                    prepend-icon="mdi-check-circle"
                    v-model="editedItem.adminFlg"
                    color="primary"
                    label="管理権限"
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="info darken-1"
              text
              @click="close"
            >
              Cancel
            </v-btn>
            <v-btn
              color="info darken-1"
              text
              @click="save"
              :disabled="invalid"
            >
              Save
            </v-btn>
          </v-card-actions>
        </ValidationObserver>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
import { User } from '@/models/user'
import { printJson, logger } from '@/libs/utils'
import { setting, ENV } from '@/libs/setting'
import { debugPostRequest } from '@/libs/api'

export default {
  name: 'App',
  data: () => ({
    showPassword: false,
    user: {
      email: '',
      password: ''
    },
    isDev: false,
    dialog: false,
    editedItem: {
      email: '',
      password: '',
      name: '',
      adminFlg: false
    }
  }),

  async created () {
    this.isDev = setting.env !== ENV.prod
  },

  methods: {
    async login () {
      this.loadingDialog.open()

      try {
        // ログイン
        const [user, token] = await User.signIn(this.user.email, this.user.password)
        logger.debug(`Logined user: ${printJson(user)}`)

        // ログイン中のユーザー情報を保持
        this.$store.dispatch('auth', {
          user: user,
          accessToken: token
        })
        // Topページに遷移
        this.$router.push('/lottery')
        logger.debug('Success login.')
      } catch (error) {
        logger.warn(error)
        logger.debug('Failed login.')
        this.$errorDialog({
          error: error.class
        })
      } finally {
        this.loadingDialog.close()
      }
    },

    async createTestUser () {
      this.open()
    },
    open () {
      this.dialog = true
    },
    close () {
      this.dialog = false
    },
    async save () {
      try {
        this.loadingDialog.open()

        var item = JSON.parse(JSON.stringify(this.editedItem))

        // 新規ユーザー作成
        await debugPostRequest('/v1/Debug/User/Create/', {
          ...item
        })

        const txt = '新規ユーザーを作成しました'

        this.$toasted.show(txt, {
          theme: 'toasted-primary',
          position: 'top-right',
          duration: 3000,
          type: 'success'
        })
      } catch (error) {
        this.$errorDialog({
          error: error.class
        })
      } finally {
        this.close()
        this.loadingDialog.close()
      }
    }
  },
  mounted () {
    if (this.$store.state.accessToken) {
      // アクセストークンがある状態でログイン画面にきたらTopページに遷移させる
      this.$router.push('/lottery')
    }
  }
}
</script>

<style scoped>
  .contents {
    margin: auto;
  }
</style>
