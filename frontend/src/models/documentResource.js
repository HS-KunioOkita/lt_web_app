import firebase from '../libs/firebase'
import ModelBase from '@/models/base'
import Store from '@/store/index.js'

const documentResourceCollection = 'documentResource'
/**
 * ドキュメントページのリソースモデル
 */
export class DocumentResource extends ModelBase {
  constructor (params) {
    super()

    this.id = null
    this.name = null
    this.resource = null
    this.createUser = null
    this.updateUser = null
    this.editing = null

    this.updateParams(params)
  }

  /**
   * リソースを全て取得する
   * @returns DocumentResourceモデルのリスト
   */
  static async getAllResource () {
    const documentResourceList_ = await firebase.db.getAllDocDataList(documentResourceCollection)
    var documentResourceList = []
    for (var data of documentResourceList_) {
      documentResourceList.push(new DocumentResource(data))
    }

    return documentResourceList
  }

  /**
   * リソースを新規作成する
   * @param {String} name ページ名
   * @param {String} resource ページのHTMLリソース
   * @param {Boolean} editing ページが編集中かどうか
   * @returns DocumentResourceモデル
   */
  static async create (name, resource, editing = false) {
    const data = {
      name: name,
      resource: resource,
      createUser: Store.state.user.id,
      editing: editing
    }
    const documentResourceData = await firebase.db.setDoc(documentResourceCollection, data)

    return new DocumentResource(documentResourceData)
  }

  /**
   * リソースを更新する
   * @param {object} data 更新するデータ
   */
  async update (data) {
    data.updateUser = Store.state.user.id
    await firebase.db.setDoc(documentResourceCollection, data, this.id)

    this.updateParams(data)
  }

  /**
   * リソースを削除する
   */
  async delete () {
    await firebase.db.deleteDoc(documentResourceCollection, this.id)
  }

  /**
   * リソースの変更を監視する
   * @param {Function} callbackFunc 監視対象に変更があった時に実施する処理
   */
  static async onSnapshots (callbackFunc) {
    const docList = await firebase.db.getDocList(documentResourceCollection)
    return firebase.db.onSnapshot(docList, callbackFunc)
  }
}
