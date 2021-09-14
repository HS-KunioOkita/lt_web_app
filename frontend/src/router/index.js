import Vue from 'vue'
import Router from 'vue-router'
import multiguard from 'vue-router-multiguard'
import LoginPage from '@/components/pages/LoginPage'
import TopPage from '@/components/pages/TopPage'
import LotteryPage from '@/components/pages/LotteryPage'
import DocumentPage from '@/components/pages/DocumentPage'
import ProfilePage from '@/components/pages/ProfilePage'
import SettingPage from '@/components/pages/SettingPage'
import AdminPage from '@/components/pages/AdminPage'
import Store from '@/store/index.js'
import { User } from '../models/user'
import { logger } from '../libs/utils'

Vue.use(Router)

const logout = async () => {
  const user = Store.state.user
  if (user && user instanceof User) {
    await user.signOut()
  }

  Store.dispatch('logout')
}

const redirectLoginPage = async (to, next) => {
  // 再ログインに失敗したらログアウトさせる
  await logout()
  // ログイン画面にリダイレクトさせる
  next({ path: '/login', query: { redirect: to.fullPath } })
}

const adminPageGuard = (to, from, next) => {
  if (Store.state.user.adminFlg) {
    next()
  } else {
    next({ path: '/lottery', query: { redirect: to.fullPath } })
  }
}

const routes = [
  {
    path: '/login',
    component: LoginPage
  },
  {
    path: '/',
    name: 'TopPage',
    component: TopPage,
    meta: { requiresAuth: true },
    children: [
      {
        path: '/lottery',
        component: LotteryPage
      },
      {
        path: '/document',
        component: DocumentPage
      },
      {
        path: '/profile',
        component: ProfilePage
      },
      {
        path: '/setting',
        component: SettingPage
      },
      {
        path: '/admin',
        beforeEnter: multiguard([adminPageGuard]),
        component: AdminPage
      }
    ]
  }
]

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// 画面遷移時の処理を定義する
router.beforeEach(async (to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    const token = Store.state.accessToken
    if (!token) {
      // アクセストークンが空の場合はログアウトさせる
      await redirectLoginPage(to, next)
      return
    }

    // StoreのユーザーデータがUserモデルでない時は再ログインする
    if (!(Store.state.user instanceof User)) {
      try {
        const [user, newToken] = await User.reSignIn(token)
        if (!user) {
          // 再ログインに失敗したらログアウトさせる
          await redirectLoginPage(to, next)
          return
        }

        // 再ログイン情報を保持する
        Store.dispatch('auth', {
          user: user,
          accessToken: newToken
        })
      } catch (error) {
        logger.warn(error)
        // 再ログインに失敗したらログアウトさせる
        await redirectLoginPage(to, next)
        return
      }
    }

    const path = from.query.redirect
    if (path) {
      next()
      // リダイレクト用パスがある場合はリダイレクトさせる
      next({ path: path })
    } else {
      next()
    }
    return
  }

  next()
})

export default router
