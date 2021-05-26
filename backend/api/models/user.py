from libs.firebase import FirebaseAdmin
from api.models.base import ModelBase
from api.models.base import require_client


class User(ModelBase):
    """ユーザーモデル"""

    def __init__(self,
                 uid,
                 email,
                 name,
                 admin_flg,
                 disable_flg,
                 created_at,
                 updated_at,
                 client=None):
        super().__init__(client, created_at, updated_at)

        self.uid = uid
        self.email = email
        self.name = name
        self.admin_flg = admin_flg
        self.disable_flg = disable_flg

    def get_access_token(self):
        """アクセストークンを発行する"""

        token = FirebaseAdmin.create_token(self.uid).decode()
        return token

    @classmethod
    def get_all_users(cls):
        """全ユーザー情報を取得する"""

        client = FirebaseAdmin()
        users = client.get_all_users()

        user_list = []
        for user_data in users:
            user = user_data['user']
            profile = user_data['profile']
            if profile:
                user_list.append(cls(
                    user.uid,
                    user.email,
                    profile['name'],
                    profile['adminFlg'],
                    profile['disableFlg'],
                    profile['createdAt'],
                    profile['updatedAt'],
                    client
                ))

        return user_list

    @classmethod
    def get(cls, uid):
        """uidでユーザー情報を取得する"""

        client = FirebaseAdmin()
        user_data = client.get_user(uid)
        user = user_data['user']
        profile = user_data['profile']

        return cls(
            user.uid,
            user.email,
            profile['name'],
            profile['adminFlg'],
            profile['disableFlg'],
            profile['createdAt'],
            profile['updatedAt'],
            client
        )

    @classmethod
    def create(cls,
               email,
               password,
               name,
               admin_flg=False):
        """新規ユーザーを作成する"""

        client = FirebaseAdmin()
        uid, created_at, updated_at = client.create_user(email,
                                                         password,
                                                         name,
                                                         admin_flg)
        return cls(
            uid,
            email,
            name,
            admin_flg,
            False,
            created_at,
            updated_at,
            client
        )

    @require_client
    def update(self, **profile):
        """ユーザー情報を更新する"""

        self._client.update_user_profile(self.uid, profile)
        self.set_params(**profile)

    @require_client
    def delete(self):
        """ユーザーを削除する"""

        self._client.delete_user(self.uid)
