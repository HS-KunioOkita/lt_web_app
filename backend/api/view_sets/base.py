from libs.utils import convert_keys_to_camel_case, convert_keys_to_snake_case
from flask import jsonify, request
from flask_restful import Resource

from libs.firebase import FirebaseAdmin

from libs.error import InvalidTokenError, UserNotFoundError, AccountDisabledError

from api.models.user import User

from libs.error import AccessDeniedError


def create_payload(payload={}, status=0):
    payload_ = convert_keys_to_camel_case(payload.copy())
    return {
        'result': payload_,
        'status': status,
    }


class ViewSetBase:
    def __init__(self, request):
        self.request = request
        if request.method == 'GET':
            self.params = self.__get_args_data()
        else:
            self.params = self.__get_json_data()

    @classmethod
    def resource(cls, method_type_name, method_name):
        # get、post、put、deleteのいずれかのメソッドの処理を定義する
        def func_(self, **kwargs):
            # ViewSetを生成
            view_set = cls(request)
            # 使用するAPIメソッドを取得
            method = getattr(view_set, method_name)

            return jsonify(method(**kwargs))

        method_ = {
            method_type_name: func_
        }
        # Resourceを継承し、<ViewSet名>_<メソッドタイプ>_<メソッド名>でクラスを作成する
        resource_class = type('{}_{}_{}'.format(cls.__name__,
                                                method_type_name,
                                                method_name),
                              (Resource,),
                              method_)
        return resource_class

    def __get_args_data(self):
        request_data = self.request.args
        if request_data is None:
            return {}

        return convert_keys_to_snake_case(request_data)

    def __get_json_data(self):
        request_data = self.request.json
        if request_data is None:
            return {}

        return convert_keys_to_snake_case(request_data)


class UserViewSetBase(ViewSetBase):
    """ユーザー用ViewSetBase"""

    def __init__(self, request):
        super().__init__(request)

        token = request.headers.get('Bearer')
        if not token:
            # ToDo
            raise InvalidTokenError()

        # Token検証
        decoded_token = FirebaseAdmin.verify_token(token)
        uid = decoded_token['uid']

        self.user = User.get(uid)
        # アカウントがない場合は拒否する
        if not self.user:
            raise UserNotFoundError(payload={
                'uid': uid
            })
        # アカウントが無効の場合は拒否する
        if self.user.disable_flg:
            raise AccountDisabledError(payload={
                'uid': uid
            })


class AdminViewSetBase(UserViewSetBase):
    """管理者用APIのViewSetBase"""

    def __init__(self, request):
        super().__init__(request)

        # API実行者が管理者権限を持たない場合は拒否する
        if not self.user.admin_flg:
            raise AccessDeniedError(payload={
                'info': "This account doesn't has admin authority."
            })


class DebugViewSetBase(ViewSetBase):
    """デバッグ用APIのViewSetBase"""
    pass
