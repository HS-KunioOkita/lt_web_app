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
            :class="className"
            @click="onClickFunction(v)"
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
        >
          <AccordionList
            :item="v.sub"
            :keyName="keyName"
            :onClick="onClick"
            :sortKey="sortKey"
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

      const sortKey = this.sortKey
      if (sortKey !== undefined) {
        this.source.sort((a, b) => {
          return a[sortKey] > b[sortKey] ? 1 : -1
        })
      }
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
</style>
