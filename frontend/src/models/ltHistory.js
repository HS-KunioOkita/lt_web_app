import firebase from '../libs/firebase'
import ModelBase from '@/models/base'

const ltHistoryCollection = 'LTHistory'
/**
 * LTの実施履歴モデル
 */
export class LTHistory extends ModelBase {
  constructor (params) {
    super()

    this.id = null
    this.index = null
    this.date = null
    this.details = null
    this.editing = null

    this.updateParams(params)
  }

  /**
   * LTの実施履歴を全て取得する
   * @returns LTHistoryモデルのリスト
   */
  static async getAllHistory () {
    const ltHistoryList_ = await firebase.db.getAllDocDataList(ltHistoryCollection)
    var ltHistoryList = []
    for (var data of ltHistoryList_) {
      ltHistoryList.push(new LTHistory(data))
    }

    return ltHistoryList
  }

  /**
   * LTの実施履歴を新規作成する
   * @param {int} index 表示する順番
   * @param {Date} date 日付
   * @param {Array} details 詳細
   * @param {Object} editing コンテンツの編集中情報
   * @returns LTHistoryモデル
   */
  static async create (index = null, date = null, details = [], editing = {}) {
    if (index === null) {
      // index未指定の場合は最後尾にcreateする
      const maxIndex = await LTHistory.getMaxIndex()
      if (maxIndex === null) {
        // データがない場合は0から採番する
        index = 0
      } else {
        index = maxIndex + 1
      }
    } else {
      // indexが指定された場合は挿入する
      var ltHistoryWithIndex = await LTHistory.getLTHistoryWithIndex(index, '>=')
      for (var ltHistory of ltHistoryWithIndex) {
        // 指定index以上の履歴は全て+1する
        ltHistory.update({
          index: ltHistory.index + 1
        })
      }
    }

    const data = {
      date: date,
      index: index,
      details: details,
      editing: editing
    }
    const ltHistoryData = await firebase.db.setDoc(ltHistoryCollection, data)

    return new LTHistory(ltHistoryData)
  }

  /**
   * 履歴を更新する
   * @param {object} data 更新するデータ
   */
  async update (data) {
    await firebase.db.setDoc(ltHistoryCollection, data, this.id)

    this.updateParams(data)
  }

  /**
   * 履歴を削除する
   */
  async delete () {
    await firebase.db.deleteDoc(ltHistoryCollection, this.id)

    // deleteされた分前に詰める
    var ltHistoryWithIndex = await LTHistory.getLTHistoryWithIndex(this.index, '>')
    for (var ltHistory of ltHistoryWithIndex) {
      // 指定index以上の履歴は全て-1する
      ltHistory.update({
        index: ltHistory.index - 1
      })
    }
  }

  static async getMaxIndex () {
    const ltHistoryDataList = await firebase.db.getDocDataListOrderBy(ltHistoryCollection, 'index', true)
    if (ltHistoryDataList.length === 0) {
      return null
    }
    return ltHistoryDataList[0].index
  }

  static async getLTHistoryWithIndex (index, operator) {
    const whereList = [['index', operator, index]]
    const ltHistoryDataList = await firebase.db.getDocDataList(ltHistoryCollection, whereList)

    var ltHistory = []
    for (var ltHistoryData of ltHistoryDataList) {
      ltHistory.push(new LTHistory(ltHistoryData))
    }
    return ltHistory
  }

  /**
   * LT実施履歴の変更を監視する
   * @param {Function} callbackFunc 監視対象に変更があった時に実施する処理
   */
  static async onSnapshots (callbackFunc) {
    const docList = await firebase.db.getDocList(ltHistoryCollection)
    return firebase.db.onSnapshot(docList, callbackFunc)
  }
}
