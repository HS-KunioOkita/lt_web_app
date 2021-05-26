import firebase from '@/libs/firebase'
import Store from '@/store/index.js'
import Router from '@/router/index.js'
import ModelBase from '@/models/base'
import {
  getUserRequest,
  postUserRequest,
  putUserRequest,
  deleteUserRequest
} from '@/libs/api'
import {
  AccountDisabledError,
  ApiServerError,
  CommonError,
  EmailAlreadyUseError,
  InvalidCustomTokenError,
  UserNotFoundError
} from '../libs/errors'
import vue from '../main'
import { logger } from '../libs/utils'

const userCollection = 'user'
const defaultUserIconPath = '/static/img/user/default_icon.png'
export class User extends ModelBase {
  constructor (params) {
    super()

    this.uid = null
    this.email = null
    this.name = null
    this.imageUrl = null
    this.imageSrc = null
    this.adminFlg = null
    this.disableFlg = null
    this.admin = null
    this.listeners = []

    this.updateParams(params)
  }

  async getAccessToken () {
    // ToDo
    if (!this.uid) {
      throw new CommonError()
    }

    try {
      const responce = await getUserRequest('/v1/User/GetAccessToken/')
      return responce.result.accessToken
    } catch (error) {
      switch (error.apiStatus) {
        case UserNotFoundError.apiStatus:
          throw new UserNotFoundError(error.message)
        case AccountDisabledError.apiStatus:
          throw new AccountDisabledError(error.message)
        case InvalidCustomTokenError.apiStatus:
          throw new InvalidCustomTokenError(error.message)
        default:
          throw new CommonError(error.message)
      }
    }
  }

  /**
   * 全ユーザーのプロフィールを取得する
   * @returns Userモデルのリスト
   */
  static async getAllUsers () {
    var userDataList = await firebase.db.getAllDocDataList(userCollection)
    userDataList.sort((x, y) => x.createdAt > y.createdAt ? 1 : -1)

    var userList = []
    for (var data of userDataList) {
      var user = new User({
        uid: data.id,
        email: null,
        ...data
      })
      userList.push(user)
    }

    return userList
  }

  /**
   * ログイン
   * @param {string} email メールアドレス
   * @param {string} password パスワード
   * @returns Userモデル、アクセストークン
   */
  static async signIn (email, password) {
    // Firebaseからユーザーデータを取得
    const userData = await firebase.signInWithEmailAndPassword(email, password)

    const user = await User._signIn(userData)
    const token = await user.getAccessToken()
    await user.initOnSnapShot()
    return [user, token]
  }

  /**
   * アクセストークンで再ログイン
   * @param {string} token アクセストークン
   * @returns Userモデル、アクセストークン
   */
  static async reSignIn (token) {
    // Firebaseからユーザーデータを取得
    const userData = await firebase.signInWithCustomToken(token)

    const user = await User._signIn(userData)
    const token_ = await user.getAccessToken()
    await user.initOnSnapShot()
    return [user, token_]
  }

  /**
   * Firestoreからデータを取得してインスタンスを生成するprivateメソッド
   * @param {object} userData Firebaseから取得したユーザーデータ
   * @returns Userモデル
   */
  static async _signIn (userData) {
    // uidでユーザーデータを取得する
    const uid = userData.user.uid
    const data = await firebase.db.getDocData(userCollection, uid)

    const user = new User({
      uid: uid,
      email: userData.user.email,
      ...data
    })
    // プロフィール画像を設定
    await user.getImageSrc()
    // 管理者の場合はAdminクラスを生成
    if (data.adminFlg) {
      user.admin = new Admin(uid)
    }

    return user
  }

  async getImageSrc () {
    if (this.imageUrl) {
      this.imageSrc = await firebase.storage.getImageSrc(this.imageUrl)
    } else {
      this.imageSrc = defaultUserIconPath
    }
  }

  /**
   * プロフィールを更新する
   * @param {object} profile 更新するプロフィール
   */
  async updateProfile (profile) {
    await firebase.db.setDoc(userCollection, profile, this.uid)

    this.updateParams(profile)

    // Admin権限が変更された場合は対応する
    if (profile.adminFlg !== undefined) {
      if (!this.adminFlg) {
        this.admin = null
      } else {
        this.admin = new Admin(this.uid)
      }
    }
  }

  async updatePassword (nowPassword, newPassword) {
    await firebase.updatePassword(this.email, nowPassword, newPassword)
  }

  /**
   * プロフィールの変更を監視する
   * @param {Function} callbackFunc 監視対象に変更があった時に実施する処理
   */
  static async onSnapshots (callbackFunc) {
    const docList = await firebase.db.getDocList(userCollection)
    return firebase.db.onSnapshot(docList, callbackFunc)
  }

  /**
   * プロフィールの変更を監視する
   * @param {Function} callbackFunc 監視対象に変更があった時に実施する処理
   */
  async onSnapshot (callbackFunc) {
    const doc = await firebase.db.getDoc(userCollection, this.uid)
    var listener = firebase.db.onSnapshot(doc, callbackFunc)
    this.listeners.push(listener)
  }

  /**
   * プロフィール変更時のトークンリフレッシュ処理を設定する
   */
  async initOnSnapShot () {
    await this.onSnapshot(async (snapshot) => {
      try {
        const data = snapshot.data()
        if (data === undefined) {
          // データがない場合はアカウント削除済みとみなす
          throw new UserNotFoundError()
        }

        this.updateParams(data)
        // プロフィールに変更があったらアクセストークンを取得し直す
        const token = await this.getAccessToken()

        Store.dispatch('auth', {
          user: this,
          accessToken: token
        })
      } catch (error) {
        // アクセストークン取得に失敗したらログアウトさせる
        var message = null
        switch (error.class.errorCode) {
          case UserNotFoundError.errorCode:
            message = 'このアカウントは削除されました。\nログアウトします。'
            break
          case AccountDisabledError.errorCode:
            message = 'このアカウントは無効になりました。\nログアウトします。'
            break
        }
        vue.$errorDialog({
          error: error.class,
          message: message,
          close: async () => {
            // ダイアログを閉じたらログアウト
            await this.signOut()
          }
        })
      }
    })
  }

  /**
   * ログアウト
   */
  async signOut () {
    // 登録されているリスナーを全て監視解除する
    for (var listener of this.listeners) {
      listener()
    }

    await firebase.signOut()

    // ログイン中の情報を破棄
    Store.dispatch('logout')
    // Loginページに遷移
    Router.push('/login')

    logger.debug('Success logout.')
  }
}

class Admin {
  constructor (uid) {
    this.uid = uid
  }

  /**
   * 全ユーザーの全情報を取得する
   * @returns Userモデルのリスト
   */
  async getAllUsers () {
    const responce = await getUserRequest('/v1/Admin/User/List/')

    const userList = responce.result.userList
    var result = []
    for (var user of userList) {
      result.push(new User(user))
    }
    return result
  }

  /**
   * 新規ユーザーを作成
   * @param {string} email メールアドレス
   * @param {string} password パスワード
   * @param {string} name ユーザー名
   * @param {boolean} adminFlg 管理者権限
   * @returns Userモデル
   */
  async createUser (email, password, name, adminFlg = false) {
    try {
      const data = {
        email: email,
        password: password,
        name: name,
        adminFlg: adminFlg
      }
      const responce = await postUserRequest('/v1/Admin/User/Create/', data)

      const user = responce.result.user
      return new User(user)
    } catch (error) {
      switch (error.apiStatus) {
        case EmailAlreadyUseError.apiStatus:
          throw new EmailAlreadyUseError(error.message)
        default:
          throw new ApiServerError(error.message)
      }
    }
  }

  async updateUser (uid, data) {
    try {
      const updateData = {
        name: data.name,
        adminFlg: data.adminFlg,
        disableFlg: data.disableFlg
      }
      const responce = await putUserRequest(`/v1/Admin/User/Update/${uid}`, updateData)

      const user = responce.result.user
      return new User(user)
    } catch (error) {
      switch (error.apiStatus) {
        case UserNotFoundError.apiStatus:
          throw new UserNotFoundError(error.message)
        default:
          throw new ApiServerError(error.message)
      }
    }
  }

  async deleteUser (uid) {
    try {
      await deleteUserRequest(`/v1/Admin/User/Delete/${uid}`)
    } catch (error) {
      switch (error.apiStatus) {
        case UserNotFoundError.apiStatus:
          throw new UserNotFoundError(error.message)
        default:
          throw new ApiServerError(error.message)
      }
    }
  }
}
