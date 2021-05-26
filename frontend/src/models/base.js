class ModelBase {
  constructor () {
    this.createdAt = null
    this.updatedAt = null
  }

  /**
   * インスタンス変数を更新する
   * @param {object} params 更新するデータ
   */
  updateParams (params) {
    for (const key in params) {
      if (this[key] === undefined) {
        // クラスに定義がないパラメータの場合は無視する
        continue
      }
      this[key] = params[key]
    }
  }
}

export default ModelBase
