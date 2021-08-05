<template>
  <v-list
    v-bind:dense="dense"
    v-bind:nav="nav"
  >
    <v-list-item
      v-for="v in item"
      :key="v[keyName]"
      :to="v[to]"
    >
      <template v-if="v.subs === undefined">
        <v-list-item-icon>
          <v-icon>{{ v.icon === undefined ? 'mdi-circle-small' : v.icon }}</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>
            {{ v.name }}
          </v-list-item-title>
        </v-list-item-content>
      </template>
      <ListGroup
        v-else
        :icon="v.icon"
        :title="v.name"
      >
        <List
          :item="v.subs"
          :dense="dense"
          :nav="nav"
          :keyName="keyName"
          :to="to"
        />
      </ListGroup>
    </v-list-item>
  </v-list>
</template>

<script>
export default {
  props: {
    item: {
      type: Array
    },
    dense: {
      type: String
    },
    nav: {
      type: String
    },
    keyName: {
      type: String
    },
    to: {
      type: String,
      default: null
    }
  },

  methods: {
  }
}
</script>
