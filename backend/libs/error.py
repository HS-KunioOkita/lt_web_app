class CommonError(Exception):
    error_code = 0
    message = None

    def __init__(self, payload={}):
        self.payload = payload

    def to_dict(self):
        return {
            'message': self.__class__.message,
            'errorType': type(self).__name__,
            'payload': dict(self.payload),
            'status': self.__class__.error_code,
        }


class InternalServerError(CommonError):
    error_code = 9500
    message = 'Server internal error.'


class AccessDeniedError(CommonError):
    error_code = 9501
    message = 'Denied access API.'


class APIValidationError(CommonError):
    error_code = 9502
    message = "ValidationAPI request's raise error."


class InvalidTokenError(CommonError):
    error_code = 9101
    message = 'Token is invalid.'


class UserAlreadyExistsError(CommonError):
    error_code = 9201
    status = 'ALREADY_EXISTS'
    message = 'User already exists.'


class UserNotFoundError(CommonError):
    error_code = 9202
    status = 'NOT_FOUND'
    message = 'User not found.'


class AccountDisabledError(CommonError):
    error_code = 9203
    message = 'This account is disabled.'
