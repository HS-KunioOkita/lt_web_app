import { dateFormat } from './utils'

export const date = (value) => {
  const check = value === '' || dateFormat.test(value)
  return check || '{_field_}はYYYY/MM/DD形式で入力してください'
}

export const userName = (value) => {
  return value.length <= 10 || '{_field_}は10字以内で入力してください'
}

export const contents = (value) => {
  return value.length <= 30 || '{_field_}は30字以内で入力してください'
}

export const passwordLength = (value) => {
  const lengthCheck = value.length >= 8 && value.length <= 30
  return lengthCheck || '{_field_}は8字以上30字以内で入力してください'
}

export const password = (value) => {
  const passwordFormat = /[a-zA-Z0-9!-/:-@\\[-`{-~]+$/
  return passwordFormat.test(value) || '{_field_}は英数字と記号で入力してください'
}

export const documentTitle = (value) => {
  return value.length <= 30 || '{_field_}は30字以内で入力してください'
}
