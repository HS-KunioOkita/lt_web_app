<template>
  <div>
    <div
      v-for="v in source"
      :key="v[keyName]"
    >
      <template v-if="v.sub === undefined">
        <div class="icon">
          <v-icon
            size="20"
          >
            mdi-circle-small
          </v-icon>
          <div
            :class="className + getOnClassName(v)"
            @click="onClickFunction(v)"
            :id="v.id"
          >
            {{ v.name }}
          </div>
        </div>
      </template>
      <template v-else>
        <AccordionMenu
          :title="v.name"
          :onClick="onClickFunction.bind(this, v)"
          :class="className"
          :selected="isSelf(v)"
          :on="v.on"
        >
          <AccordionList
            :item="v.sub"
            :keyName="keyName"
            :onClick="onClick"
            :sortKey="sortKey"
            :onId="onId"
          />
        </AccordionMenu>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    item: {
      type: Array
    },
    keyName: {
      type: String
    },
    sortKey: {
      type: String
    },
    onClick: {
      type: Function
    },
    onId: {
      type: [String, Number]
    }
  },

  data () {
    return {
      source: [],
      active: false,
      icon: 'mdi-chevron-right',
      className: '',
      onClickFunction: () => {}
    }
  },

  watch: {
    item: function (newValue, oldValue) {
      this.initItem(newValue)
    }
  },

  created () {
    this.initialize()
  },

  methods: {
    initialize () {
      const hasOnClick = this.onClick !== undefined
      this.className = hasOnClick ? 'name' : ''
      if (hasOnClick) {
        this.onClickFunction = this.onClick
      }

      this.initItem(this.item)
    },
    initItem (value) {
      this.source = value.concat()
      this.setOn(this.source)

      const sortKey = this.sortKey
      if (sortKey !== undefined) {
        this.source.sort((a, b) => {
          return a[sortKey] > b[sortKey] ? 1 : -1
        })
      }
    },
    setOn (items) {
      for (var item of items) {
        if (item.sub !== undefined) {
          // 子ページにon offをセット
          this.setOn(item.sub)
          // 子ページのいずれかがonの場合はonにする
          item.on = item.sub.filter((x) => {
            return x.selected || x.on
          }).length > 0
        }

        item.selected = this.isSelf(item)
      }
    },

    isSelf (v) {
      return this.onId === v.id
    },
    getOnClassName (v) {
      return this.isSelf(v) ? ' on' : ''
    }
  }
}
</script>

<style scoped>
  .icon {
    display: flex;
    align-items: center;
  }

  .name {
    cursor: pointer;
  }

  .on {
    font-weight: bold;
  }
</style>
