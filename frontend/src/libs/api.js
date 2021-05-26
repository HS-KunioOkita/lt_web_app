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

const createHeader = (token) => {
  var header = JSON.parse(JSON.stringify(BASE_HEADER))
  header['Bearer'] = token

  return header
}

const getPath = (url) => {
  var path = `${BASE_URL}${url}`
  switch (setting.env) {
    case ENV.dev:
      path = url
  }

  return path
}

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

const getToken = async () => {
  try {
    const user = firebase.currentUser()
    return await user.getIdToken(true)
  } catch (error) {
    logger.warn(error)
    throw CommonError(error.message)
  }
}

export const getUserRequest = async (url, params = {}) => {
  try {
    const token = await getToken()
    return await getRequest(url, token, params)
  } catch (error) {
    logger.warn(error)
    throw error
  }
}

export const postUserRequest = async (url, data) => {
  try {
    const token = await getToken()
    return await postRequest(url, token, data)
  } catch (error) {
    logger.warn(error)
    throw error
  }
}

export const putUserRequest = async (url, data) => {
  try {
    const token = await getToken()
    return await putRequest(url, token, data)
  } catch (error) {
    logger.warn(error)
    throw error
  }
}

export const deleteUserRequest = async (url, data = {}) => {
  try {
    const token = await getToken()
    return await deleteRequest(url, token, data)
  } catch (error) {
    logger.warn(error)
    throw error
  }
}

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
