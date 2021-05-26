<template>
  <v-app>
    <!-- ナビゲーションバー -->
    <v-navigation-drawer app v-model="drawer" clipped >
      <v-container>
        <v-list-item>
          メニュー
        </v-list-item>

        <v-divider />

        <v-list dense nav>
          <v-list-item v-for="navigation in navigations" :key="navigation.name" :to="navigation.link">
            <v-list-item-icon>
              <v-icon>{{ navigation.icon }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{ navigation.name }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-container>
    </v-navigation-drawer>

    <!-- メニューバー -->
    <v-app-bar color="primary" dark app clipped-left>
      <v-app-bar-nav-icon @click="drawer=!drawer" />
      <v-toolbar-title>LT アプリ</v-toolbar-title>
      <v-spacer />
      <v-toolbar-items>
        <v-menu offset-y>
        <template v-slot:activator="{on}">
        <v-btn v-on="on" text>
          <v-avatar size="34">
            <img v-bind:src="$store.state.user.imageSrc"/>
          </v-avatar>
          <div class="profileImage">
            {{ $store.state.user.name }}
          </div>
          <v-icon>mdi-menu-down</v-icon>
        </v-btn>
        </template>
        <v-list>
          <v-subheader>設定関連</v-subheader>
          <v-list-item
            v-for="userSetting in userSettings"
            :key="userSetting.name"
            :to="userSetting.link"
            @click="action(userSetting)"
          >
            <v-list-item-icon>
              <v-icon :color="userSetting.color">{{ userSetting.icon }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{ userSetting.name }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        </v-menu>
      </v-toolbar-items>
    </v-app-bar>

    <!-- コンテンツ -->
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import { reload } from '@/libs/utils'
const ADMIN_MENU = {
  name: '管理者ページ',
  icon: 'mdi-check-decagram',
  link: '/admin/'
}

export default {
  data () {
    return {
      drawer: false,
      navigations: [
        {
          name: 'くじ引き',
          icon: 'mdi-slot-machine',
          link: '/lottery/'
        }
      ],
      userSettings: [
        {
          name: 'ユーザー設定',
          icon: 'mdi-account-edit',
          link: '/profile/'
        },
        {
          name: 'アプリ設定',
          icon: 'mdi-cog',
          link: '/setting/'
        },
        {
          name: 'ログアウト',
          icon: 'mdi-logout',
          action: async () => {
            this.loadingDialog.open()

            const user = this.$store.state.user
            await user.signOut()

            this.loadingDialog.close()
          }
        }
      ]
    }
  },
  created () {
    if (this.$store.state.user.adminFlg) {
      this.userSettings.push(ADMIN_MENU)
    }
  },
  methods: {
    action (userSetting) {
      return userSetting.action !== undefined ? userSetting.action() : this.empty()
    },
    empty () {}
  },
  computed: {
    adminFlg () {
      return this.$store.state.user.adminFlg
    }
  },
  watch: {
    adminFlg (val, old) {
      var action = () => {}
      if (val) {
        this.userSettings.push(ADMIN_MENU)
      } else {
        const index = this.userSettings.indexOf(ADMIN_MENU)
        this.userSettings.splice(index, 1)

        if (this.$route.path === '/admin/') {
          // 管理者ページの場合は強制リロードさせる
          action = () => {
            reload()
          }
        }
      }

      const role = val ? '管理者' : '一般'
      this.$infoDialog({
        title: '情報',
        message: `管理者権限が変更されました。\n権限: ${role}`,
        close: action
      })
    }
  }
}
</script>

<style scoped>
  .profileImage{
    padding-left: 5px;
    text-transform: none;
  }
</style>
