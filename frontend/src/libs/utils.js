import router from '../router'
import * as Errors from './errors'
import { ENV, setting } from './setting'

export const DAY = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 7
}
export const dateFormat = /^[0-9]{4}\/(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])$/

export const logger = {
  debug: (data) => {
    switch (setting.env) {
      case ENV.dev:
      case ENV.test:
        // 開発環境のみ出力する
        console.log(data)
    }
  },
  info: data => console.info(data),
  warn: data => console.warn(data)
}

export const convertJson = (data, replacer = null, space = null) => {
  return JSON.stringify(data, replacer, space)
}

export const printJson = (data) => {
  return convertJson(data, null, '  ')
}

/**
 * DateTimeを文字列に変換する
 */
export const convertStringFromDatetime = (datetime, formatStr = 'YYYY/MM/DD hh:mm:ss') => {
  if (datetime === null) {
    return ''
  }
  var yearStr = datetime.getFullYear()
  // 月だけ+1すること
  var monthStr = 1 + datetime.getMonth()
  var dayStr = datetime.getDate()
  var hourStr = datetime.getHours()
  var minuteStr = datetime.getMinutes()
  var secondStr = datetime.getSeconds()

  // 0埋めする
  monthStr = ('0' + monthStr).slice(-2)
  dayStr = ('0' + dayStr).slice(-2)
  hourStr = ('0' + hourStr).slice(-2)
  minuteStr = ('0' + minuteStr).slice(-2)
  secondStr = ('0' + secondStr).slice(-2)

  formatStr = formatStr.replace(/YYYY/g, yearStr)
  formatStr = formatStr.replace(/MM/g, monthStr)
  formatStr = formatStr.replace(/DD/g, dayStr)
  formatStr = formatStr.replace(/hh/g, hourStr)
  formatStr = formatStr.replace(/mm/g, minuteStr)
  formatStr = formatStr.replace(/ss/g, secondStr)

  return formatStr
}

/**
 * Dateを文字列に変換する
 */
export const convertStringFromDate = (date, formatStr = 'YYYY/MM/DD') => {
  if (date === null) {
    return ''
  }
  var yearStr = date.getFullYear()
  // 月だけ+1すること
  var monthStr = 1 + date.getMonth()
  var dayStr = date.getDate()

  // 0埋めする
  monthStr = ('0' + monthStr).slice(-2)
  dayStr = ('0' + dayStr).slice(-2)

  formatStr = formatStr.replace(/YYYY/g, yearStr)
  formatStr = formatStr.replace(/MM/g, monthStr)
  formatStr = formatStr.replace(/DD/g, dayStr)

  return formatStr
}

/**
 * 文字列をDateに変換する
 */
export const convertDateFromString = (dateTxt) => {
  if (!dateTxt) {
    return null
  }

  const timestamp = Date.parse(dateTxt)
  var date = new Date(timestamp)
  // 時間はデフォルトで9が設定されるため、0にしておく
  date.setHours(0)
  return date
}

/**
 * 配列から1番新しい日時を取得する
 * @param {Array} dateList 日時配列
 * @returns 1番新しい日時
 */
export const getLastDate = (dateList) => {
  if (dateList.length === 1) {
    return dateList[0]
  }

  var lastDate = null
  for (var i = 0; i < dateList.length - 1; i++) {
    if (dateList[i] < dateList[i + 1]) {
      lastDate = dateList[i + 1]
    } else {
      lastDate = dateList[i]
    }
  }

  return lastDate
}

/**
 * Date型かどうか判定する
 */
export const isDate = (date) => {
  return date instanceof Date
}

/**
 * 二つの日付の日数差分を求める
 */
export const calculateDay = (date1, date2) => {
  if (isDate(date1) && isDate(date2)) {
    return Math.floor((date1 - date2) / 86400000)
  }
  return null
}

/**
 * 配列を指定のKey順でソートする
 * @param {Array} arr 配列
 * @param {string} key キー
 * @param {string} orderby 昇順、降順オプション
 * @returns ソートした配列
 */
const sortByKey = (arr, key, orderby = 'DESC') => {
  return [...arr].sort((a, b) => {
    if (orderby === 'ASC') {
      [a, b] = [b, a]
    }

    return (a[key] > b[key] || a[key] === b[key]) ? -1 : 1
  })
}

/**
 * 同じ順位の要素が複数あるかどうか判定する
 * @param {Array} arr 配列
 * @param {*} id 唯一性のあるパラメーター
 * @returns 同じ順位の要素が複数あるかどうか
 */
const getIndexFromRankArray = (arr, id) => {
  return arr.findIndex((keys) => {
    if (!Array.isArray(keys) || !keys.length) {
      return false
    }

    return keys.some((_id) => {
      return _id === id
    })
  })
}

/**
 * 指定したkeyの値で順位付けする
 * @param {Array} arr 配列
 * @param {*} id 唯一性のあるパラメーター
 * @param {string} key 順位づけするパラメーター
 * @param {string} orderby 昇順、降順オプション
 * @returns 順位付けされた配列
 */
const mapDataToRankingArrayWithSkip = (arr, id, key, orderby = 'DESC') => {
  return arr.reduce((accumulator, item, index, _list) => {
    if (index > 0) {
      const prevValue = getValueOnlyOneKey(_list[index - 1], key)

      if (prevValue === item[key]) {
        const prevID = getValueOnlyOneKey(_list[index - 1], id)
        const sameRankIndex = getIndexFromRankArray(accumulator, prevID)
        accumulator[sameRankIndex].push(getValueOnlyOneKey(item, id))
        accumulator.push([])

        return accumulator
      }
    }
    accumulator[accumulator.length] = [getValueOnlyOneKey(item, id)]
    return accumulator
  }, [])
}

/**
 * 指定したkeyの値で順位づけし、ソートした配列を返す関数
 * @param {Array} arr ソートする配列
 * @param {*} id 唯一性のあるパラメーター
 * @param {string} key 順位づけするパラメーター
 * @returns ソートし、順位を付与した配列
 */
export const addRankingAllowSameRank = (arr, id, key) => {
  const sorted = sortByKey(arr, key)
  const rankingList = mapDataToRankingArrayWithSkip(sorted, id, key)

  return arr.map((item) => {
    const ranking = getIndexFromRankArray(rankingList, getValueOnlyOneKey(item, id)) + 1

    return {...item, ranking: ranking || null}
  })
}

/**
 * 指定ミリ秒間待機する
 * @param {*} ms ミリ秒
 */
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 入れ子状態のobjectからキー一つで値を取得する関数
 * ex.)
 *   const pbj = {
 *     key1: {
 *       key2: 1
 *     }
 *   }
 *   const i = resolve(obj, 'key1.key2')
 *   // i = 1
 */
export const getValueOnlyOneKey = (obj, path, separator = '.') => {
  var properties = Array.isArray(path) ? path : path.split(separator)
  return properties.reduce((prev, curr) => prev && prev[curr], obj)
}

/**
 * 指定した週の曜日の日付を取得する
 * @param {DAY} day 曜日
 * @param {int} weeks 今週から何週間前、後の日付を取得するか指定できる
 * @returns Date
 */
export const getDay = (day, weeks = 0) => {
  const today = new Date()

  const thisYear = today.getFullYear()
  const thisMonth = today.getMonth()
  const date = today.getDate()
  const dayNum = today.getDay()

  const sunday = date - dayNum + weeks * 7

  return new Date(thisYear, thisMonth, sunday + day)
}

/**
 * 日付が等しいかどうか判定する
 * @param {Date} date1 日付1
 * @param {Date} date2 日付2
 * @returns 等しいかどうか
 */
export const compareDate = (date1, date2) => {
  if (date1.getFullYear() !== date2.getFullYear()) {
    return false
  }
  if (date1.getMonth() !== date2.getMonth()) {
    return false
  }
  if (date1.getDate() !== date2.getDate()) {
    return false
  }

  return true
}

/**
 * クラス名の文字列からエラークラスを取得する
 * @param {string} classname クラス名
 * @returns エラークラス
 */
export const getErrorClass = (classname) => {
  return Errors[classname]
}

/**
 * 画面をリロードする
 * @param {boolean} force 強制遷移させるかどうか
 */
export const reload = (force = true) => {
  router.go({path: router.currentRoute.path, force: force})
}
