export class CommonError {
  static errorCode = 5000
  static errorMessage = 'エラーが発生しました'

  constructor (message = '', apiStatus = null) {
    // 呼び出されたエラークラス名を保持
    this.class = this.constructor
    this.apiStatus = apiStatus
    this.message = message
  }
}

export class ApiServerError extends CommonError {
  static errorCode = 5001
  static apiStatus = 9500
  static errorMessage = '通信エラーが発生しました。'
}

export class InvalidCustomTokenError extends CommonError {
  static errorCode = 5101
  static status = 'auth/invalid-custom-token'
  static errorMessage = '認証に失敗しました。\n再ログインしてください。'
}

export class EmailAlreadyUseError extends CommonError {
  static errorCode = 5201
  static apiStatus = 9201
  static status = 'auth/email-already-in-use'
  static errorMessage = 'このメールアドレスはすでに使用されています。'
}

export class InvalidEmailError extends CommonError {
  static errorCode = 5202
  static status = 'auth/invalid-email'
  static errorMessage = 'このメールアドレスは不正な形式です。'
}

export class UserNotFoundError extends CommonError {
  static errorCode = 5203
  static apiStatus = 9202
  static status = 'auth/user-not-found'
  static errorMessage = 'ユーザーが存在しません。'
}

export class DifferentPaswordError extends CommonError {
  static errorCode = 5204
  static status = 'auth/wrong-password'
  static errorMessage = 'パスワードが違います。'
}

export class TooManyRequestsError extends CommonError {
  static errorCode = 5205
  static status = 'auth/too-many-requests'
  static errorMessage = 'リクエストが上限を超えました。\nしばらく時間を開けてから再度お試しください。'
}

export class WeekPasswordError extends CommonError {
  static errorCode = 5206
  static status = 'auth/weak-password'
  static errorMessage = 'このパスワードは脆弱です。'
}

export class RequiresRecentLoginError extends CommonError {
  static errorCode = 5207
  static status = 'auth/requires-recent-login'
  static errorMessage = '最後のログインから長時間が経過しました。\n再ログインしてください。'
}

export class AccountDisabledError extends CommonError {
  static errorCode = 5208
  static apiStatus = 9203
  static errorMessage = 'このアカウントは無効です。'
}

export class FirestoreAbortedError extends CommonError {
  static errorCode = 5301
  static status = 'aborted'
  static errorMessage = 'エラーにより操作が中止されました。'
}
