<template>
  <div class="contents">
    <h2 class="heading16">ドキュメント</h2>
      <div class="document">
        <div
          class="sideMenu"
        >
          <AccordionList
            :item="documentList"
            keyName="id"
            sortKey="name"
            :onClick="selectItem"
          />
        </div>
        <div class="documentContents">
          <v-btn
            class="info"
            @click="createNewPage"
          >
            新規ページ作成
          </v-btn>
          <v-btn
            v-if="htmlResource.id !== null"
            class="info"
            @click="editPage"
            :disabled="otherUserEditing()"
          >
            {{ otherUserEditing() ? "編集中..." : "編集" }}
          </v-btn>
          <v-btn
            v-if="htmlResource.id !== null"
            class="info"
            @click="deletePage"
            :disabled="otherUserEditing()"
          >
            削除
          </v-btn>
          <div class="documentResource">
            <div
              v-if="htmlResource.id !== null"
              class="pageName"
            >
              {{ htmlResource.path }}
            </div>
            <div
              class="markdown-body detail"
            >
              <div v-html="md.render(htmlResource.resource)" />
            </div>
        </div>
      </div>
    </div>

    <!-- ドキュメント編集ダイアログ -->
    <v-dialog
      v-model="editPageDialog"
      width="1000px"
      persistent
    >
      <v-card>
        <v-card-title>
          <div>編集</div>
        </v-card-title>
        <ValidationObserver v-slot="{ invalid }" immediate>
          <v-card-text>
            <v-container>
              <span class="selectParentLabel">親ページ</span>
              <v-select
                class="selectParent"
                v-model="parentId"
                :items="documentListForList"
                item-text="path"
                item-value="id"
                single-line
              />
              <TextField
                v-model="name"
                name="name"
                label="タイトル"
                rules="required|documentTitle"
              />
              <mavon-editor
                v-model="editedHtml"
                :externalLink="mavonEditor.externalLink"
                language="ja"
                placeholder="編集エリア"
                class="editor"
              />
            </v-container>
          </v-card-text>

          <v-card-actions>
            <div class="resultButtons">
              <v-btn color="info darken-1" text @click="closeEditPageDialog">Cancel</v-btn>
              <v-btn
                color="info darken-1"
                text
                @click="savePage"
                :disabled="invalid"
              >
                Save
              </v-btn>
            </div>
          </v-card-actions>
        </ValidationObserver>
      </v-card>
    </v-dialog>

    <!-- 子ページ削除確認ダイアログ -->
    <v-dialog
      v-model="deletePageDialog"
      width="300px"
      persistent
    >
      <v-card>
        <v-card-title>
          <div>確認</div>
        </v-card-title>

        <v-card-text>
          <v-container>
            <div>下記子ページも削除されます。削除しますか？</div>
            <AccordionList
              :item="subDocumentList"
              keyName="id"
              sortKey="name"
            />
          </v-container>
        </v-card-text>

        <v-card-actions>
            <div class="resultButtons">
              <v-btn color="info darken-1" text @click="closeDeletePageDialog">Cancel</v-btn>
              <v-btn
                color="info darken-1"
                text
                @click="deletePageWithSubAsync"
              >
                Save
              </v-btn>
            </div>
          </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { DocumentResource } from '@/models/DocumentResource'

export default {
  data () {
    return {
      htmlResources: {},
      pageId: '',
      htmlResource: {
        id: null,
        name: '',
        resource: ''
      },
      documentList: [],
      subDocumentList: [],
      documentListForList: [],
      editPageDialog: false,
      deletePageDialog: false,
      name: '',
      parentId: null,

      editing: false,
      newHtml: '',
      editedHtml: '',

      mavonEditor: {
        externalLink: {
          markdown_css: function () {
            return '/static/css/markdown/github-markdown.min.css'
          },
          hljs_js: function () {
            return '/static/js/highlightjs/highlight.min.js'
          },
          katex_css: function () {
            return '/static/css/katex/katex.min.css'
          },
          katex_js: function () {
            return '/static/js/katex/katex.min.js'
          }
        }
      },

      documentListner: null,
      hasNotification: false,
      documentListnerInitialized: false
    }
  },

  async created () {
    this.loadingDialog.open()

    await this.initOnSnapShots()
    window.onhashchange = this.initOnHashChange
    this.initialize()

    this.loadingDialog.close()
  },

  methods: {
    /**
     * Firestoreのスナップショットの初期処理
     */
    async initOnSnapShots () {
      // ドキュメント情報の変更を監視
      this.documentListner = await DocumentResource.onSnapshots(async (snapshot) => {
        if (snapshot.metadata.fromCache) {
          // キャッシュからの呼び出しは無視する
          return
        }

        if (this.documentListnerInitialized) {
          if (this.hasNotification) {
            // 既に通知が出ている場合は出さない
            return
          }

          // 自分による変更は通知しない
          if (this.htmlResource.editing === this.$store.state.user.uid) {
            return
          }
          // 現在開いているページと異なるページの変更は無視する
          const pageId = snapshot.docs[0].id
          if (this.htmlResource.id !== pageId) {
            return
          }
          // 編集中ユーザーIDの更新は保持する
          const document = await DocumentResource.get(pageId)
          if (this.htmlResource.editing !== document.editing) {
            this.htmlResource.editing = document.editing

            // 変数が開始された場合の更新は通知しない
            if (document.editing !== null) {
              return
            }
          }

          this.hasNotification = true
          // 画面遷移後の初期設定が終わった後にしか通知しない
          this.$toasted.show('ページが更新されました', {
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

                this.hasNotification = false
              }
            }
          })

          return
        }
        this.documentListnerInitialized = true
      })
    },

    initOnHashChange () {
      // URLにページIDが指定されているときは自動表示する
      const pageId = window.location.hash.replace('#', '')

      const resource = this.htmlResources[pageId]
      if (!pageId || resource === undefined) {
        this.initHtmlResource()
        return
      }

      this.htmlResource = resource
    },
    initResource () {
      this.name = ''
      this.editedHtml = ''
      this.parentId = null
    },
    initHtmlResource () {
      this.htmlResource = {
        id: null,
        name: '',
        resource: ''
      }
    },
    /**
     * 初期処理
     */
    async initialize () {
      // ドキュメントのリソースを取得
      const resources = await DocumentResource.getAllResource()

      var documentListForList = [{
        id: null,
        path: ''
      }]
      var documentList = []
      var subDocumentList = []

      for (var resource of resources) {
        if (resource.parentId === null) {
          documentList.push(resource)
        } else {
          subDocumentList.push(resource)
        }

        this.htmlResources[resource.id] = resource
      }

      // 親ページがあるドキュメントは親に設定する
      this.createDocumentList(documentList, subDocumentList)

      // ページのフルパスを保持したリストを作成
      for (resource of resources) {
        const path = this.createPath(resource)
        documentListForList.push({
          path: path,
          ...resource
        })

        this.htmlResources[resource.id].path = path
      }

      this.documentListForList = documentListForList
      this.documentList = documentList

      this.initOnHashChange()
    },
    /**
     * ページのパスを生成する
     * @param {DocumentResource} resource resource
     * @returns パス
     */
    createPath (resource) {
      if (resource.parentId === null) {
        return resource.name
      }

      var parent = this.htmlResources[resource.parentId]
      var path = this.createPath(parent)
      path = path + '/' + resource.name

      return path
    },
    createDocumentList (documentList, subDocumentList) {
      for (var document of documentList) {
        var subList = subDocumentList.filter(x => {
          return x.parentId === document.id
        })
        if (subList.length > 0) {
          document.sub = subList
          this.createDocumentList(document.sub, subDocumentList)
        }
      }
    },

    /**
     * 目次をクリックしたときに走る処理
     * @param {DocumentResource} item item
     */
    selectItem (item) {
      this.htmlResource = this.htmlResources[item.id]
      // フラグメント識別子を設定
      window.location.hash = item.id
    },

    /**
     * 新規ページを作成する
     */
    createNewPage () {
      this.parentId = this.htmlResource.id
      this.openEditPageDialog()
    },

    /**
     * ページを削除する
     */
    deletePage () {
      // 子ページがある場合は保持しておく
      var hasSub = this.htmlResource.sub !== undefined
      if (hasSub) {
        this.subDocumentList = this.htmlResource.sub
      }

      // 確認ダイアログを表示
      this.$modalDialog({
        title: '確認',
        message: `「${this.htmlResource.name}」を削除しますか?`,
        ok: async () => {
          if (hasSub) {
            this.openDeletePageDialog()
          } else {
            await this.deletePageAsync(async () => {
              await this.htmlResource.delete()
            })
          }
        }
      })
    },
    /**
     * ページを削除する一連の処理
     * @param {function} func 削除処理
     */
    async deletePageAsync (func) {
      try {
        this.loadingDialog.open()
        await func()

        this.initResource()
        this.initHtmlResource()
        window.location.hash = ''
        // データ読み込み
        await this.initialize()
      } catch (error) {
        this.$errorDialog({
          error: error.class
        })
      } finally {
        this.loadingDialog.close()
      }
    },
    /**
     * 子ページを含めたページを削除する一連の処理
     */
    async deletePageWithSubAsync () {
      await this.deletePageAsync(async () => {
        await this.deleteAllSub(this.htmlResource.sub)
        await this.htmlResource.delete()
      })

      this.closeDeletePageDialog()
    },
    /**
     * 子ページを全て削除する
     */
    async deleteAllSub (item) {
      for (var sub of item) {
        await sub.delete()
        if (sub.sub !== undefined) {
          await this.deleteAllSub(sub.sub)
        }
      }
    },

    openDeletePageDialog () {
      this.deletePageDialog = true
    },
    closeDeletePageDialog () {
      this.deletePageDialog = false
    },

    /**
     * ページを編集する
     */
    async editPage () {
      await this.htmlResource.update({
        editing: this.$store.state.user.uid
      })
      this.editing = true
      this.editedHtml = this.htmlResource.resource
      this.name = this.htmlResource.name
      this.parentId = this.htmlResource.parentId
      this.openEditPageDialog()
    },

    openEditPageDialog () {
      this.editPageDialog = true
    },
    async closeEditPageDialog () {
      await this.htmlResource.update({
        editing: null
      })
      this.editing = false
      this.initResource()

      this.editPageDialog = false
    },

    /**
     * 新規作成 or 編集したページを保存する
     */
    async savePage () {
      try {
        this.loadingDialog.open()

        var pageId = ''
        if (this.editing) {
          await this.htmlResource.update({
            name: this.name,
            resource: this.editedHtml,
            parentId: this.parentId
          })
          pageId = this.htmlResource.id
        } else {
          const newPage = await DocumentResource.create(this.name, this.editedHtml, this.parentId)
          pageId = newPage.id
        }

        // データ読み込み
        window.location.hash = pageId
        this.initHtmlResource()
        await this.initialize()
      } catch (error) {
        this.$errorDialog({
          error: error.class
        })
      } finally {
        this.name = ''
        this.editedHtml = ''
        await this.closeEditPageDialog()
        this.loadingDialog.close()
      }
    },

    otherUserEditing () {
      return this.htmlResource.editing !== null
    }
  },

  beforeDestroy () {
    // 監視用リスナーを破棄
    window.onhashchange = null
    this.documentListner()
  }
}
</script>

<style scoped>
  .contents {
    position: relative;
    padding: 20px auto;
    height: calc(100% - 64px);
  }

  .pageName {
    font-size: 30px;
    border-bottom: solid 3px rgb(201, 201, 201);
  }

  .document {
    position: relative;
    height: 100%;
    display: flex;
    align-items: center;
  }

  .documentContents {
    position: relative;
    width: calc(100% - 250px);
    height: 100%;
    padding: 0px 10px;
  }

  .documentResource {
    position: relative;
    width: 100%;
    height: 100%;
    overflow-y: scroll;
    padding: 10px;
  }

  .detail {
    position: relative;
    padding: 20px 10px 10px;
  }

  .editor {
    position: relative;
    width: 100%;
    height: 800px;
  }

  .sideMenu {
    position: relative;
    width: 250px;
    height: 100%;
    background-color: #c4ffb5;
    overflow-y: scroll;
    padding: 10px;
  }

  .selectParentLabel {
    font-size: 12px;
  }
  .selectParent {
    margin-top: -10px;
  }
</style>
