<template>
  <div>
    <div
      v-for="v in item"
      :key="v[keyName]"
    >
      <template v-if="v.sub === undefined">
        <div class="icon">
          <v-icon
            size="20"
          >
            mdi-circle-small
          </v-icon>
          <div @click="onClick(v)">{{ v.name }}</div>
        </div>
      </template>
      <template v-else>
        <AccordionMenu
          :title="v.name"
          :onClick="onClick.bind(this, v)"
        >
          <AccordionList
            :item="v.sub"
            keyName="name"
            :onClick="onClick"
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
    onClick: {
      type: Function
    }
  },

  data () {
    return {
      active: false,
      icon: 'mdi-chevron-right'
    }
  },

  created () {
    this.initialize()
  },

  methods: {
    initialize () {
    }
  }
}
</script>

<style scoped>
  .icon {
    display: flex;
    align-items: center;
  }
</style>
