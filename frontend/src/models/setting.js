import firebase from '../libs/firebase'
import ModelBase from '@/models/base'

const settingCollection = 'setting'
/**
 * LTアプリの設定モデル
 */
export class Setting extends ModelBase {
  constructor (params) {
    super()

    this.id = null
    this.settings = null

    this.updateParams(params)
  }

  /**
   * 設定を取得する
   * @param {string} id ID
   * @returns Settingモデル
   */
  static async get (id) {
    const data = await firebase.db.getDocData(settingCollection, id)

    return new Setting(data)
  }

  /**
   * 設定を更新する
   * @param {object} data 更新するデータ
   */
  async update (data) {
    await firebase.db.setDoc(settingCollection, data, this.id)

    this.updateParams(data)
  }
}
