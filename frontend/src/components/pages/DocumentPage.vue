<template>
  <div class="contents">
    <h2 class="heading16">ドキュメント</h2>
    <div class="document">
      <Sidebar
        v-model="sideBarWidth"
        class="secondary sideMenu"
        :defaultWidth="defaultWidth"
        :maxWidth="600"
        :minWidth="50"
        title="ページツリー"
      >
        <AccordionList
          :item="documentList"
          keyName="id"
          sortKey="name"
          :onClick="selectItem"
          :onId="onId"
          class="pageTree"
        />
      </Sidebar>
      <div class="documentContents" :style="contentsStyle">
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
        <div
          v-if="htmlResource.id !== null"
          class="pageName"
        >
          {{ htmlResource.path }}
        </div>
        <div class="documentResource">
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
                :toolbars="mavonEditor.toolbars"
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

const DEFAULT_SIDEBAR_WIDTH = 300

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
      allDocumentListForList: [],
      documentListForList: [],
      editPageDialog: false,
      deletePageDialog: false,
      name: '',
      parentId: null,

      editing: false,
      newHtml: '',
      editedHtml: '',
      onId: null,

      defaultWidth: DEFAULT_SIDEBAR_WIDTH,
      sideBarWidth: DEFAULT_SIDEBAR_WIDTH,

      mavonEditor: {
        toolbars: {
          bold: true,
          italic: true,
          header: true,
          underline: true,
          strikethrough: true,
          mark: true,
          superscript: true,
          subscript: true,
          quote: true,
          ol: true,
          ul: true,
          link: true,
          code: true,
          table: true,
          help: true,
          alignleft: true,
          aligncenter: true,
          alignright: true,
          subfield: true,
          preview: true,
          fullscreen: true,
          // false
          imagelink: false,
          undo: false,
          redo: false,
          readmodel: false,
          htmlcode: false,
          trash: false,
          save: false,
          navigation: false
        },
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
      documentListnerInitialized: false,
      myOperation: false
    }
  },

  async created () {
    this.loadingDialog.open()

    await this.initOnSnapShots()
    this.initialize()

    this.loadingDialog.close()
  },

  computed: {
    contentsStyle () {
      return {
        '--sidebarWidth': `${this.sideBarWidth}px`
      }
    }
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
        if (this.myOperation) {
          // 自分の操作による変更の場合は通知しない
          this.myOperation = false
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

    changePageIdQueryParams (pageId = null) {
      // URLにページIDが指定されているときは自動表示する
      if (pageId === null) {
        pageId = this.$route.query.pageId
      } else {
        this.$router.push(
          {
            query: {
              pageId: pageId
            }
          },
          () => {}
        )
      }

      const resource = this.htmlResources[pageId]
      if (!pageId || resource === undefined) {
        this.initHtmlResource()
        return
      }

      this.htmlResource = resource
      this.onId = resource.id
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

      this.allDocumentListForList = documentListForList
      this.documentList = documentList

      this.changePageIdQueryParams()
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
      // URLにpageIdを設定
      this.changePageIdQueryParams(item.id)
    },

    /**
     * 新規ページを作成する
     */
    createNewPage () {
      this.parentId = this.htmlResource.id
      this.documentListForList = this.allDocumentListForList.concat()
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
        this.myOperation = true
        await func()

        this.initResource()
        this.initHtmlResource()
        this.changePageIdQueryParams('')
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

      var documentListForList = this.allDocumentListForList.concat()
      const id = this.htmlResource.id
      this.documentListForList = this.createDocumentListForList(documentListForList, id)

      this.editing = true
      this.editedHtml = this.htmlResource.resource
      this.name = this.htmlResource.name
      this.parentId = this.htmlResource.parentId
      this.openEditPageDialog()
    },
    createDocumentListForList (list, id) {
      var documentListForList = list.concat()

      var idList = []
      // IDが一致するものを除く
      documentListForList = documentListForList.filter((x) => {
        if (x.parentId === id) {
          idList.push(x.id)
          return false
        }

        return x.id !== id
      })

      // 親ページIDが一致するものも全て除く
      for (var id_ of idList) {
        documentListForList = this.createDocumentListForList(documentListForList, id_)
      }

      return documentListForList
    },

    openEditPageDialog () {
      this.editPageDialog = true
    },
    async closeEditPageDialog () {
      await this.htmlResource.update({
        editing: null
      })
      this.documentListForList = []
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
        this.myOperation = true

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
        this.changePageIdQueryParams(pageId)
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
      if (this.htmlResource.editing === null) {
        return false
      }
      return this.htmlResource.editing !== this.$store.state.user.uid
    }
  },

  beforeDestroy () {
    // 監視用リスナーを破棄
    this.documentListner()
  }
}
</script>

<style scoped>
  .contents {
    position: relative;
    padding: 20px auto;
    height: calc(100vh - 90px);
  }

  .pageName {
    font-family: "M Plus 1p" !important;
    font-size: 30px;
    border-bottom: solid 3px rgb(201, 201, 201);
  }

  .document {
    position: relative;
    height: calc(100% - 60px);
    display: flex;
    align-items: center;
  }

  .documentContents {
    position: relative;
    width: calc(100% - var(--sidebarWidth));
    height: 100%;
    padding: 0px 20px;
  }

  .documentResource {
    position: relative;
    width: 100%;
    height: calc(100% - 100px);
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
    height: 100%;
    font-family: "M Plus 1p" !important;
  }
  .pageTree {
    margin-top: 5px;
  }

  .selectParentLabel {
    font-size: 12px;
  }
  .selectParent {
    margin-top: -10px;
  }
</style>
