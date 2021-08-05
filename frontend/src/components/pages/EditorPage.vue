<template>
  <div>
    <div>編集ページ</div>
    <Editor
      ref="editor"
      :api-key="tinyMCE.apikey"
      :initialValue="editedHtml"
      :init="init"
    />
  </div>
</template>

<script>
export default {
  props: {
    pageId: {
      type: String,
      default: ''
    },
    html: {
      type: String,
      default: ''
    }
  },

  data () {
    return {
      init: {
        height: 500,
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
    initialize () {
      console.log('pageId: ' + this.pageId)
      console.log('html: ' + this.html)

      this.editedHtml = this.html
    }
  }
}
</script>
