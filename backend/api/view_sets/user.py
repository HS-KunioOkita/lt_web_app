from api.models.user import User
from api.view_sets.base import AdminViewSetBase, UserViewSetBase, DebugViewSetBase
from api.view_sets.base import create_payload
from libs.validator import Validator, Field


class UserViewSet(UserViewSetBase):
    def get_access_token(self):
        """アクセストークンを発行する"""

        return create_payload({
            'access_token': self.user.get_access_token()
        })


class AdminUserViewSet(AdminViewSetBase):
    def get_all_users(self):
        """全ユーザーの情報を取得する"""

        user_list = []
        for user in User.get_all_users():
            user_list.append(user.to_dict(convert_datetime=True))

        return create_payload({
            'user_list': user_list
        })

    def create(self):
        """新規ユーザーを作成する"""

        # バリデーション
        data = CreateValidator(self.params).validate()

        user = User.create(**data)

        return create_payload({
            'user': user.to_dict(convert_datetime=True)
        })

    def update(self, uid):
        """ユーザー情報を更新する"""

        # バリデーション（空データは拒否）
        data = UpdateValidator(self.params).validate(is_accept_empty_data=False)

        user = User.get(uid)
        user.update(**data)

        return create_payload({
            'user': user.to_dict(convert_datetime=True)
        })

    def delete(self, uid):
        """ユーザーを削除する"""

        user = User.get(uid)
        user.delete()

        return create_payload()


class DebugUserViewSet(DebugViewSetBase):
    def create(self):
        """新規ユーザーを作成する"""

        # バリデーション
        data = CreateValidator(self.params).validate()

        user = User.create(**data)

        return create_payload({
            'user': user.to_dict(convert_datetime=True)
        })


class CreateValidator(Validator):
    email = Field.email_field()
    password = Field.password_field()
    name = Field.user_name_field()
    admin_flg = Field.boolean_field()


class UpdateValidator(Validator):
    name = Field.user_name_field(required=False)
    admin_flg = Field.boolean_field(required=False)
    disable_flg = Field.boolean_field(required=False)

