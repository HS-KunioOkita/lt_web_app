<template>
  <div>
    <h2 class="heading16">管理者ページ</h2>
    <div class="contents">
      <v-card>
        <v-card-title>
          <span class="text-h5">ユーザー管理</span>
        </v-card-title>

        <v-card-text>
          <div class="users">
            <v-data-table
              :headers="headers"
              :items="allUserList"
              sort-by="createdAt"
              class="elevation-1"
              :footer-props="{
                'items-per-page-options': [10, 30, 50, 100, -1]
              }"
              :options="{
                itemsPerPage: -1
              }"
              :loading="loading"
            >
              <template v-slot:top>
                <v-toolbar flat color="white">
                  <v-toolbar-title>一覧</v-toolbar-title>
                  <v-divider
                    class="mx-4"
                    inset
                    vertical
                  ></v-divider>
                  <v-spacer></v-spacer>
                  <v-dialog
                    v-model="dialog"
                    max-width="500px"
                    persistent
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        color="primary"
                        dark
                        class="mb-2"
                        v-bind="attrs"
                        v-on="on"
                        :disabled="loading"
                      >
                        新規登録
                      </v-btn>
                    </template>
                    <v-card>
                      <ValidationObserver v-slot="{ invalid }" immediate>
                        <v-card-title>
                          <span class="headline">{{ formTitle }}</span>
                        </v-card-title>

                        <v-card-text>
                          <v-container>
                            <v-row>
                              <v-col v-if="isInsert()" cols="12" sm="6" md="12">
                                <EmailField
                                  v-model="editedItem.email"
                                />
                              </v-col>
                              <v-col v-if="isInsert()" cols="12" sm="6" md="12">
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
                </v-toolbar>
              </template>
              <template v-slot:[`item.name`]="{ item }">
                {{ item.name }} <v-icon v-if="item.adminFlg" color="primary">mdi-check-decagram</v-icon>
              </template>
              <template v-slot:[`item.disableFlg`]="{ item }">
                <v-chip
                  v-bind:disabled="item.uid === $store.state.user.uid"
                  :color="getAbleColor(item.disableFlg)"
                  dark @click="changeAble(item)"
                >
                  <b>{{ getAbleText(item.disableFlg) }}</b>
                </v-chip>
              </template>
              <template v-slot:[`item.actions`]="{ item }">
                <v-icon
                  v-if="item.uid != $store.state.user.uid"
                  small
                  class="mr-2"
                  @click="editItem(item)"
                >
                  mdi-pencil
                </v-icon>
                <v-icon
                  v-if="item.uid != $store.state.user.uid"
                  small
                  @click="deleteItem(item)"
                >
                  mdi-delete
                </v-icon>
              </template>
            </v-data-table>
          </div>
        </v-card-text>
      </v-card>

      <v-card class="card">
        <v-card-title>
          <span class="text-h5">LT設定（ToDo）</span>
        </v-card-title>

        <v-card-text>
          <div class="setting">
            <table>
              <tr>
                <th>発表者数</th>
                <td>{{ $store.state.ltSettings.numOfPresenters }}</td>
              </tr>
            </table>
          </div>
        </v-card-text>

        <!-- <v-card-actions>
          <v-spacer />
          <v-btn class="info" @click="openProfileDialog">編集</v-btn>
        </v-card-actions> -->
      </v-card>
    </div>
  </div>
</template>

<script>
import { sleep } from '@/libs/utils'
import { User } from '@/models/user'
import COLORS from '@/libs/colors'

const ActionType = {
  INSERT: '新規登録',
  UPDATE: '編集'
}

export default {
  data: () => ({
    loading: false,
    dialog: false,
    initialized: false,
    hasNotification: false,
    listner: null,
    myOperation: false,
    headers: [
      {
        text: '名前',
        value: 'name'
      },
      {
        text: 'Email',
        value: 'email',
        sortable: false
      },
      {
        text: '状態',
        value: 'disableFlg',
        sortable: false
      },
      {
        text: 'Actions',
        value: 'actions',
        sortable: false
      }
    ],
    allUserList: [],
    editedIndex: -1,
    actionType: null,
    editedItem: {
      name: '',
      adminFlg: false
    },
    defaultItem: {
      name: '',
      adminFlg: false
    }
  }),

  computed: {
    formTitle () {
      return this.actionType
    }
  },

  async created () {
    this.loadingDialog.open()

    await this.initOnSnapShot()
    await this.initialize()

    this.loadingDialog.close()
  },

  methods: {
    async initialize () {
      try {
        this.loading = true
        this.actionType = this.getActionType()

        // 管理者用ユーザー一覧を取得
        const admin = this.$store.state.user.admin
        const userList = await admin.getAllUsers()

        this.allUserList = userList.map((item) => {
          return {
            uid: item.uid,
            email: item.email,
            password: item.password,
            name: item.name,
            adminFlg: item.adminFlg,
            disableFlg: item.disableFlg,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt
          }
        })
      } catch (error) {
        this.$errorDialog({
          error: error.class
        })
      } finally {
        this.loading = false
      }
    },
    async initOnSnapShot () {
      this.listner = await User.onSnapshots(async (snapshot) => {
        if (this.myOperation) {
          // 自分の操作による変更の場合は通知しない
          this.myOperation = false
          return
        }
        if (snapshot.metadata.fromCache) {
          // キャッシュからの呼び出しは無視する
          return
        }

        if (this.initialized) {
          if (this.hasNotification) {
            // 既に通知が出ている場合は出さない
            return
          }

          this.hasNotification = false
          // 画面遷移後の初期設定が終わった後にしか通知しない
          this.$toasted.show('ユーザー情報が更新されました', {
            theme: 'toasted-primary',
            position: 'top-right',
            type: 'info',
            action: {
              text: '更新する',
              onClick: async (e, toastObject) => {
                this.loadingDialog.open()

                toastObject.goAway(0)
                await this.initialize()

                this.loadingDialog.close()
              }
            }
          })
          this.hasNotification = true

          return
        }
        this.initialized = true
      })
    },

    isInsert () {
      return this.actionType === ActionType.INSERT
    },

    getActionType () {
      return this.editedIndex === -1 ? ActionType.INSERT : ActionType.UPDATE
    },

    editItem (item) {
      this.editedIndex = this.allUserList.indexOf(item)
      this.actionType = this.getActionType()
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },

    changeAble (item) {
      if (item.disableFlg) {
        this.ableItem(item)
      } else {
        this.disableItem(item)
      }
    },

    ableItem (item) {
      const admin = this.$store.state.user.admin
      this.$modalDialog({
        title: '確認',
        message: `${item.name} アカウントを有効にしますか?`,
        ok: async () => {
          try {
            this.loadingDialog.open()
            this.loading = true

            this.myOperation = true

            // ユーザー情報更新
            await admin.updateUser(item.uid, {
              disableFlg: false
            })

            // データ読み込み
            await this.initialize()
          } catch (error) {
            this.$errorDialog({
              error: error.class
            })
          } finally {
            this.loading = false
            this.loadingDialog.close()
          }
        }
      })
    },

    disableItem (item) {
      const admin = this.$store.state.user.admin
      this.$modalDialog({
        title: '確認',
        message: `${item.name} アカウントを無効にしますか?`,
        ok: async () => {
          try {
            this.loadingDialog.open()
            this.loading = true

            this.myOperation = true

            // ユーザー情報更新
            await admin.updateUser(item.uid, {
              disableFlg: true
            })

            // データ読み込み
            await this.initialize()
          } catch (error) {
            this.$errorDialog({
              error: error.class
            })
          } finally {
            this.loading = false
            this.loadingDialog.close()
          }
        }
      })
    },

    deleteItem (item) {
      const index = this.allUserList.indexOf(item)

      this.$modalDialog({
        title: '編集',
        message: `${item.name} アカウントを削除しますか?`,
        ok: async () => {
          try {
            this.loadingDialog.open()
            this.loading = true

            this.myOperation = true

            const admin = this.$store.state.user.admin
            await admin.deleteUser(item.uid)

            this.allUserList.splice(index, 1)

            this.$toasted.show('ユーザーを削除しました', {
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
            this.loading = false
            this.loadingDialog.close()
          }
        }
      })
    },

    async close () {
      this.dialog = false

      // ダイアログが閉じるまで待機
      await sleep(500)

      this.editedItem = Object.assign({}, this.defaultItem)
      this.editedIndex = -1
      this.actionType = this.getActionType()
    },

    async save () {
      try {
        this.loadingDialog.open()
        this.loading = true

        this.myOperation = true

        const admin = this.$store.state.user.admin
        var item = JSON.parse(JSON.stringify(this.editedItem))

        var txt = ''

        switch (this.actionType) {
          case ActionType.INSERT:
            // 新規ユーザー作成
            await admin.createUser(item.email, item.password, item.name, item.adminFlg)

            txt = '新規ユーザーを作成しました'
            break
          case ActionType.UPDATE:
            // ユーザー情報更新
            await admin.updateUser(item.uid, item)

            txt = 'ユーザー情報を更新しました'
            break
        }
        // データ読み込み
        await this.initialize()

        await this.close()

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
        this.loading = false
        this.loadingDialog.close()
      }
    },

    getAbleColor (disableFlg) {
      if (disableFlg) return COLORS.light.error
      else return COLORS.light.success
    },

    getAbleText (disableFlg) {
      if (disableFlg) return '無効'
      else return '有効'
    }
  },

  beforeDestroy () {
    // 監視用リスナーを破棄
    this.listner()
    // 通知をクリア
    this.$toasted.clear()
  }
}
</script>

<style scoped>
  .contents {
    margin: 20px auto;
    width: 800px;
  }

  .users {
    display: flex;
    justify-content: center;
  }

  .setting {
    display: flex;
    justify-content: center;
    border: 1px solid #ddd;
    padding: 20px;
  }

  .card {
    margin-top: 40px;
  }

  .elevation-1 {
    width: 800px;
  }

  table {
    width: 60%;
    border-spacing: 0;
  }

  table th {
    border-bottom: solid 2px #445ffb;
    padding: 10px 0;
  }

  table td {
    border-bottom: solid 2px #ddd;
    text-align: center;
    padding: 10px 0;
  }
</style>
