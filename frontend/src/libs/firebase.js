import firebase from 'firebase'
import {
  DifferentPaswordError,
  CommonError,
  TooManyRequestsError,
  InvalidCustomTokenError,
  UserNotFoundError,
  WeekPasswordError,
  InvalidEmailError,
  RequiresRecentLoginError,
  FirestoreAbortedError
} from './errors'
import { ENV, setting } from './setting'
import { logger } from './utils'

const firebaseConfig = {
  apiKey: 'AIzaSyDNmFXcMkImuCtpwigyF8HAu64_-04k4Jg',
  authDomain: 'h-develop2.firebaseapp.com',
  projectId: 'h-develop2',
  storageBucket: 'h-develop2.appspot.com',
  messagingSenderId: '477369053538',
  appId: '1:477369053538:web:46f912cf18106c5fb7fc3b',
  measurementId: 'G-S8D5S0GCJ2'
}
class Firebase {
  constructor () {
    firebase.initializeApp(firebaseConfig)
    this.auth = firebase.auth()
    // 開発環境、テストの場合はエミュレーターを使用する
    switch (setting.env) {
      case ENV.dev:
      case ENV.test:
        this.auth.useEmulator('http://localhost:9099')
    }

    this.db = new Firestore()
    this.storage = new Storage()
  }

  async signInWithEmailAndPassword (email, password) {
    try {
      return await this.auth.signInWithEmailAndPassword(email, password)
    } catch (error) {
      logger.warn(error)
      switch (error.code) {
        case UserNotFoundError.status:
          throw new UserNotFoundError(error.message)
        case InvalidEmailError.status:
          throw new InvalidEmailError(error.message)
        case DifferentPaswordError.status:
          throw new DifferentPaswordError(error.message)
        default:
          throw new CommonError(error.message)
      }
    }
  }

  async signInWithCustomToken (token) {
    try {
      return await this.auth.signInWithCustomToken(token)
    } catch (error) {
      logger.warn(error)
      switch (error.code) {
        case InvalidCustomTokenError.status:
          throw new InvalidCustomTokenError(error.message)
        default:
          throw new CommonError(error.message)
      }
    }
  }

  async createUserWithEmailAndPassword (email, password) {
    try {
      return await this.auth.createUserWithEmailAndPassword(email, password)
    } catch (error) {
      logger.warn(error)
      switch (error.code) {
        case WeekPasswordError.status:
          throw new WeekPasswordError(error.message)
        default:
          throw new CommonError(error.message)
      }
    }
  }

  currentUser () {
    try {
      return this.auth.currentUser
    } catch (error) {
      throw new CommonError(error.message)
    }
  }

  async updatePassword (email, nowPassword, newPassword) {
    try {
      const user = this.currentUser()
      // 入力された現在のパスワードを検証する
      const credential = firebase.auth.EmailAuthProvider.credential(email, nowPassword)
      await user.reauthenticateWithCredential(credential)

      // 更新
      await user.updatePassword(newPassword)
    } catch (error) {
      logger.warn(error)
      switch (error.code) {
        case DifferentPaswordError.status:
          throw new DifferentPaswordError(error.message)
        case RequiresRecentLoginError.status:
          throw new RequiresRecentLoginError(error.message)
        case TooManyRequestsError.status:
          throw new TooManyRequestsError(error.message)
        default:
          throw new CommonError(error.message)
      }
    }
  }

  async signOut () {
    try {
      await this.auth.signOut()
    } catch (error) {
      logger.warn(error)
      throw new CommonError(error.message)
    }
  }
}

class Firestore {
  constructor () {
    this.db = firebase.firestore()
    // 開発環境、テストの場合はエミュレーターを使用する
    switch (setting.env) {
      case ENV.dev:
      case ENV.test:
        this.db.useEmulator('localhost', 8080)
    }
  }

  getDoc (collection, id) {
    return this.db.collection(collection).doc(id)
  }

  async getDocData (collection, id) {
    try {
      const docData = await this.getDoc(collection, id).get()
      // 日時をDateに変換
      const data = this.convertDate(docData.data())
      // 日時をDateに変換
      return {
        id: docData.id,
        ...data
      }
    } catch (error) {
      logger.warn(error)
      switch (error.code) {
        case FirestoreAbortedError.status:
          throw new FirestoreAbortedError(error.message)
        default:
          throw new CommonError(error.message)
      }
    }
  }

  getDocList (collection, whereList = []) {
    var col = this.db.collection(collection)
    for (var where of whereList) {
      col = col.where(...where)
    }
    return col
  }

  async getAllDocDataList (collection) {
    const docDataList = await this.getDocDataList(collection)
    return docDataList
  }

  async getDocDataList (collection, whereList = []) {
    try {
      var col = this.getDocList(collection, whereList)

      const query = await col.get()
      var docList = []
      query.forEach((docData) => {
        // 日時をDateに変換
        const data = this.convertDate(docData.data())
        docList.push({
          id: docData.id,
          ...data
        })
      })
      return docList
    } catch (error) {
      logger.warn(error)
      switch (error.code) {
        case FirestoreAbortedError.status:
          throw new FirestoreAbortedError(error.message)
        default:
          throw new CommonError(error.message)
      }
    }
  }

  /**
   * ドキュメントを新規作成、更新する
   * @param {string} collection コレクション
   * @param {object} document ドキュメントデータ
   * @param {number} id ID
   * @param {boolean} merge 既存データを更新するとき指定したデータのみ更新するかどうか。
   * falseにするとdocumentのオブジェクトで上書きするため注意。
   * @returns docデータ
   */
  async setDoc (collection, document, id = null, merge = true) {
    try {
      var data = null
      // idが未指定の時は自動採番で新規登録する
      if (id === null) {
        data = await this.createSetData(collection, id, document)
        const response = await this.db.collection(collection).add(data)
        const doc = await this.getDocData(collection, response.id)
        return doc
      }

      // ID指定された時はcreateかupdateかで作成するデータ内容を変える
      if (this.getDoc(collection, id)) {
        data = await this.createUpdateData(collection, id, document)
      } else {
        data = await this.createSetData(collection, id, document)
      }

      await this.db.collection(collection).doc(id).set(data, {
        merge: merge
      })

      const doc = this.getDocData(collection, id)
      return doc
    } catch (error) {
      logger.warn(error)
      switch (error.code) {
        case FirestoreAbortedError.status:
          throw new FirestoreAbortedError(error.message)
        default:
          throw new CommonError(error.message)
      }
    }
  }

  /**
   * ドキュメントを削除する
   * @param {string} collection コレクション名
   * @param {*} id ID
   */
  async deleteDoc (collection, id) {
    try {
      await this.db.collection(collection).doc(id).delete()
    } catch (error) {
      switch (error.code) {
        case FirestoreAbortedError.status:
          throw new FirestoreAbortedError(error.message)
        default:
          throw new CommonError(error.message)
      }
    }
  }

  async getDocDataListOrderBy (collection, field, isDesc = false, limit = 1) {
    const col = this.db.collection(collection)
    var query = null
    if (isDesc) {
      query = col.orderBy(field, 'desc')
    } else {
      query = col.orderBy(field)
    }

    const response = await query.limit(limit).get()
    const docs = response.docs

    var docList = []
    for (var i = 0; i < docs.length; i++) {
      const doc = await this.getDocData(collection, docs[i].id)
      docList.push(doc)
    }
    return docList
  }

  /**
   * Firestoreの日時データをDate型に変換する
   * @param {object} data Firestoreデータ
   * @returns 変換後のデータ
   */
  convertDate (data) {
    var data_ = JSON.parse(JSON.stringify(data))
    for (const key in data_) {
      if (data[key] instanceof firebase.firestore.Timestamp) {
        data_[key] = data[key].toDate()
      }
    }
    return data_
  }

  onSnapshot (monitoringTarget, callbackFunc) {
    return monitoringTarget.onSnapshot((snapShot) => callbackFunc(snapShot))
  }

  /**
   * 新規作成データにデフォルトパラメータを付与する
   * @param {object} data 更新するデータ
   * @returns データ
   */
  async createSetData (collection, id, data) {
    // 作成日時を付与
    const createdAt = new Date()
    // 更新日時を付与
    const updatedAt = new Date()

    return {
      createdAt: createdAt,
      updatedAt: updatedAt,
      ...data
    }
  }

  /**
   * 更新データにデフォルトパラメータを付与する
   * @param {object} data 更新するデータ
   * @returns データ
   */
  async createUpdateData (collection, id, data) {
    // 更新日時を付与
    const updatedAt = new Date()

    return {
      updatedAt: updatedAt,
      ...data
    }
  }
}

class Storage {
  constructor () {
    this.storage = firebase.storage()

    // 開発環境、テストの場合はエミュレーターを使用する
    switch (setting.env) {
      case ENV.dev:
      case ENV.test:
        this.storage.useEmulator('localhost', 9199)
    }
  }

  async getImageSrc (imageUrl) {
    try {
      const ref = this.storage.ref().child(imageUrl)
      return await ref.getDownloadURL()
    } catch (error) {
      logger.warn(error)
      return ''
    }
  }
}

export default new Firebase()
