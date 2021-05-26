import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    user: null,
    accessToken: '',
    ltSettings: {
      numOfPresenters: 2 // ToDo
    }
  },
  mutations: {
    updateUser (state, user) {
      state.user = user.user
      state.accessToken = user.accessToken
    }
  },
  actions: {
    auth (context, user) {
      context.commit('updateUser', user)
    },
    logout (context) {
      // 全て初期化
      context.commit('updateUser', {
        user: null,
        accessToken: ''
      })
    }
  },
  modules: {},
  plugins: [createPersistedState(
    {
      key: 'ltWebApp',
      storage: window.sessionStorage
    }
  )]
})

export default store
