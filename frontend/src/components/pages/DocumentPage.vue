<template>
  <div class="contents">
    <h2 class="heading16">ドキュメント</h2>
    <div class="document">
      <div class="sideMenu">
        <AccordionList
          :item="documentList"
          keyName="name"
          :onClick="selectItem"
        />
      </div>
      <div class="documentContents">
        <v-btn
          v-if="!editing"
          class="info"
          @click="editPage"
        >
          編集
        </v-btn>
        <v-btn
          v-else
          class="info"
          @click="savePage"
        >
          保存
        </v-btn>
        <div class="documentResource">
          <div
            v-if="!editing"
            v-html="htmlResource.resource"
          />
          <div v-else>
            <Editor
              ref="editor"
              v-model="editedHtml"
              :api-key="tinyMCE.apikey"
              :initialValue="editedHtml"
              :init="init"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { DocumentResource } from '@/models/DocumentResource'
import Router from '@/router/index.js'

export default {
  data () {
    return {
      htmlResources: {},
      pageId: '',
      htmlResource: '',
      documentList: [],

      editing: false,
      init: {
        height: 800,
        menubar: false,
        table_toolbar: [
          'tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol'
        ],
        plugins: [
          'print preview fullpage importcss searchreplace autolink autosave save directionality visualblocks visualchars fullscreen image link media template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists wordcount imagetools textpattern noneditable help charmap quickbars emoticons'
        ],
        toolbar: [
          'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help table'
        ]
      },
      editedHtml: ''
    }
  },

  created () {
    this.initialize()
  },

  methods: {
    async initialize () {
      // ドキュメントのリソースを取得
      // const resources = await DocumentResource.getAllResource()
      const resources = [
        {
          id: 'id1',
          name: 'test1',
          resource: '<div>test だよ<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br><br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>a<br>aa<br>a</div>'
        },
        {
          id: 'id2',
          name: 'test2',
          resource: '<div>うおおおおおおおおお</div>',
          sub: [
            {
              id: 'id2-1',
              name: 'test2-1',
              resource: '<div>ahee</div>',
              sub: [
                {
                  id: 'id2-1-1',
                  name: 'test2-1-1',
                  resource: '<div>待て！！！！</div>'
                }
              ]
            }
          ]
        }
      ]

      var documentList = []

      for (var resource of resources) {
        console.log(resource)
        documentList.push({
          id: resource.id,
          name: resource.name,
          sub: resource.sub
        })

        this.htmlResources[resource.id] = {
          name: resource.name,
          resource: resource.resource
        }
      }

      this.documentList = documentList
    },

    openEditPage () {
      // 編集ページに遷移
      Router.push({
        name: 'EditorPage',
        params: {
          pageId: this.pageId,
          html: this.html
        }
      })
    },

    editPage () {
      this.editing = true
      this.editedHtml = this.htmlResource.resource
    },

    savePage () {
      this.htmlResource.resource = this.editedHtml
      this.editing = false
    },

    selectItem (item) {
      console.log(item)
      this.htmlResource = this.htmlResources[item.id]
    }
  }
}
</script>

<style scoped>
  html, body{
    height: 100%;
  }

  .contents {
    padding: 20px auto;
    height: calc(100% - 64px);
  }

  .document {
    height: 100%;
    display: flex;
    align-items: center;
  }

  .documentContents {
    width: calc(100% - 250px);
    height: 100%;
  }

  .documentResource {
    width: 100%;
    height: 100%;
    overflow-y: scroll;
    padding: 10px;
  }

  .sideMenu {
    width: 250px;
    height: 100%;
    background-color: #c4ffb5;
    overflow-y: scroll;
    padding: 10px;
  }
</style>

<style>
  #article, .mce-tinymce,.mce-stack-layout, .mce-edit-area{
    display: flex;
    flex-direction: column;
    flex: 1;
  }
   .mce-tinymce iframe{
    flex: 1;
  }
</style>
