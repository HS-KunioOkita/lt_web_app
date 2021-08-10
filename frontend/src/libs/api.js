import axios from 'axios'
import { setting, ENV } from '@/libs/setting'
import firebase from '@/libs/firebase'
import { ApiServerError, CommonError } from './errors'
import { printJson, logger } from './utils'

var BASE_URL = location.origin

const BASE_HEADER = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Bearer': ''
}

/**
 * リクエストのHeaderを作成する
 * @param {string} token トークン
 * @returns Header
 */
const createHeader = (token) => {
  // BASE_HEADERのコピーを作成する
  var header = JSON.parse(JSON.stringify(BASE_HEADER))
  header['Bearer'] = token

  return header
}

/**
 * APIのフルパスを作成する
 * @param {string} url APIのURL
 * @returns フルパス
 */
const getPath = (url) => {
  var path = `${BASE_URL}${url}`
  switch (setting.env) {
    case ENV.dev:
      // 開発環境はconfig/index.jsのproxyTableで設定しているため、URLをそのまま渡す
      path = url
  }

  return path
}

/**
 * GETリクエストを送信
 * @param {string} url APIのURL
 * @param {string} token トークン
 * @param {object} params クエリパラメータ
 * @returns レスポンス
 */
export const getRequest = async (url, token, params = {}) => {
  var result = null
  try {
    const path = getPath(url)
    logger.debug(`Path: ${path}`)
    logger.debug(`Request: ${printJson(params)}`)

    const responce = await axios.get(path, {
      headers: createHeader(token),
      params: params
    })
    result = responce.data
    logger.debug(`Response: ${printJson(result)}`)
  } catch (error) {
    logger.warn(error)
    throw new ApiServerError(error.message)
  }

  if (result === null || result.result === undefined) {
    throw new ApiServerError(result.message, result.status)
  }
  return result
}

/**
 * POSTリクエストを送信
 * @param {string} url APIのURL
 * @param {string} token トークン
 * @param {object} data リクエストデータ
 * @returns レスポンス
 */
export const postRequest = async (url, token, data) => {
  var result = null
  try {
    const path = getPath(url)
    logger.debug(`Path: ${path}`)
    logger.debug(`Request: ${printJson(data)}`)

    const responce = await axios.post(path, data, {
      headers: createHeader(token)
    })
    result = responce.data
    logger.debug(`Response: ${printJson(result)}`)
  } catch (error) {
    logger.warn(error)
    throw new ApiServerError(error.message)
  }

  if (result === null || result.result === undefined) {
    throw new ApiServerError(result.message, result.status)
  }
  return result
}

/**
 * PUTリクエストを送信
 * @param {string} url APIのURL
 * @param {string} token トークン
 * @param {object} data リクエストデータ
 * @returns レスポンス
 */
export const putRequest = async (url, token, data) => {
  var result = null
  try {
    const path = getPath(url)
    logger.debug(`Path: ${path}`)
    logger.debug(`Request: ${printJson(data)}`)

    const responce = await axios.put(path, data, {
      headers: createHeader(token)
    })
    result = responce.data
    logger.debug(`Response: ${printJson(result)}`)
  } catch (error) {
    logger.warn(error)
    throw new ApiServerError(error.message)
  }

  if (result === null || result.result === undefined) {
    throw new ApiServerError(result.message, result.status)
  }
  return result
}

/**
 * DELETEリクエストを送信
 * @param {string} url APIのURL
 * @param {string} token トークン
 * @param {object} data リクエストデータ
 * @returns レスポンス
 */
export const deleteRequest = async (url, token, data) => {
  var result = null
  try {
    const path = getPath(url)
    logger.debug(`Path: ${path}`)
    logger.debug(`Request: ${printJson(data)}`)

    const responce = await axios.delete(path, {
      headers: createHeader(token),
      data: data
    })
    result = responce.data
    logger.debug(`Response: ${printJson(result)}`)
  } catch (error) {
    logger.warn(error)
    throw new ApiServerError(error.message)
  }

  if (result === null || result.result === undefined) {
    throw new ApiServerError(result.message, result.status)
  }
  return result
}

/**
 * ログイン中のユーザーのIDトークンを取得する
 * @returns IDトークン
 */
const getToken = async () => {
  try {
    const user = firebase.currentUser()
    return await user.getIdToken(true)
  } catch (error) {
    logger.warn(error)
    throw CommonError(error.message)
  }
}

/**
 * UserデータをGETする
 * @param {string} url APIのURL
 * @param {object} params クエリパラメータ
 * @returns レスポンス
 */
export const getUserRequest = async (url, params = {}) => {
  try {
    const token = await getToken()
    return await getRequest(url, token, params)
  } catch (error) {
    logger.warn(error)
    throw error
  }
}

/**
 * UserデータをPOSTする
 * @param {string} url APIのURL
 * @param {object} data リクエストデータ
 * @returns レスポンス
 */
export const postUserRequest = async (url, data) => {
  try {
    const token = await getToken()
    return await postRequest(url, token, data)
  } catch (error) {
    logger.warn(error)
    throw error
  }
}

/**
 * UserデータをPUTする
 * @param {string} url APIのURL
 * @param {object} data リクエストデータ
 * @returns レスポンス
 */
export const putUserRequest = async (url, data) => {
  try {
    const token = await getToken()
    return await putRequest(url, token, data)
  } catch (error) {
    logger.warn(error)
    throw error
  }
}

/**
 * UserデータをDELETEする
 * @param {string} url APIのURL
 * @param {object} data リクエストデータ
 * @returns レスポンス
 */
export const deleteUserRequest = async (url, data = {}) => {
  try {
    const token = await getToken()
    return await deleteRequest(url, token, data)
  } catch (error) {
    logger.warn(error)
    throw error
  }
}

/**
 * デバッグ用POST API
 * @param {string} url APIのURL
 * @param {object} data リクエストデータ
 * @returns レスポンス
 */
export const debugPostRequest = async (url, data) => {
  if (setting.env === ENV.prod) {
    throw new Error()
  }

  try {
    return await postRequest(url, null, data)
  } catch (error) {
    logger.warn(error)
    throw error
  }
}
