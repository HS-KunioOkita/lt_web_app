import firebase_admin
from firebase_admin import firestore
from firebase_admin import auth
from settings.setting import setting

from libs.error import InvalidTokenError, UserAlreadyExistsError, InternalServerError, UserNotFoundError
from libs.utils import convert_keys_to_camel_case, get_now
import os


# 秘密鍵のファイルパスが正しいか確認
credential_path = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')
if not os.path.isfile(credential_path):
    raise InternalServerError(payload={
        'message': 'Firebase credential json file path is invalid.',
        'path': credential_path,
    })

firebase_admin.initialize_app(options={
    'projectId': os.environ.get('GCLOUD_PROJECT'),
})


class FirebaseAdmin:
    """Firebase管理クラス"""

    def __init__(self):
        self.db_client = firestore.client()
        if setting.env == 'dev' or setting.env == 'test':
            # 開発環境、テストはFirestoreエミュレーターに接続するため設定する
            import grpc
            from google.cloud.firestore_v1.services.firestore.transports.grpc import FirestoreGrpcTransport
            from google.cloud.firestore_v1.services.firestore.client import FirestoreClient
            channel = grpc.insecure_channel(os.environ.get('FIRESTORE_EMULATOR_HOST'), options=(('grpc.enable_http_proxy', 0),))
            transport = FirestoreGrpcTransport(channel=channel)
            self.db_client._firestore_api_internal = FirestoreClient(transport=transport)

        self.user_db = self.db_client.collection(u'user')


    @staticmethod
    def create_token(uid, payload={}):
        """アクセストークンを発行する"""

        try:
            return auth.create_custom_token(uid, payload)
        except Exception as e:
            payload = {
                'firebaseError': e.__class__.__name__,
                'message': 'Failed create access token.',
                'uid': uid
            }
            if hasattr(e, 'code'):
                payload['code'] = e.code
            raise InvalidTokenError(payload=payload)


    @staticmethod
    def verify_token(token):
        """アクセストークンを検証する"""

        try:
            return auth.verify_id_token(token)
        except Exception as e:
            payload = {
                'firebaseError': e.__class__.__name__,
                'message': 'Failed verify access token.',
                'token': token,
            }
            if hasattr(e, 'code'):
                payload['code'] = e.code
            raise InvalidTokenError(payload=payload)


    def get_doc_list(self, collection, where_list=[]):
        """Firestoreのドキュメントで、where_listに指定された条件に合うデータを取得する"""

        for where in where_list:
            collection = collection.where(*where)
        return collection.stream()


    def get_documents(self, collection, where_list=[]):
        """取得したFirestoreのドキュメントを、idをkeyにして辞書型に整形する"""

        try:
            doc_list = self.get_doc_list(collection, where_list=where_list)

            documents = {}
            for doc in doc_list:
                doc_ = doc.to_dict().copy()
                documents[doc.id] = doc_

            return documents

        except Exception as e:
            payload = {
                'firebaseError': e.__class__.__name__,
            }
            if hasattr(e, 'code'):
                payload['code'] = e.code
            raise InternalServerError(payload=payload)


    def get_all_users(self):
        """全ユーザーを取得する"""

        result = auth.list_users()
        documents = self.get_documents(self.user_db)
        user_list = []
        for user in result.users:
            user_list.append({
                'user': user,
                'profile': documents[user.uid]
            })

        return user_list

    def get_user(self, uid):
        """指定されたuidのユーザーを取得する"""

        try:
            user = auth.get_user(uid)
            profile = self.user_db.document(uid).get()

            return {
                'user': user,
                'profile': profile.to_dict(),
            }
        except Exception as e:
            payload = {
                'firebaseError': e.__class__.__name__,
            }
            if hasattr(e, 'code'):
                payload['code'] = e.code
                if e.code == UserNotFoundError.status:
                    raise UserNotFoundError(payload=payload)
            raise InternalServerError(payload=payload)


    def create_user(self,
                    email,
                    password,
                    name,
                    admin_flg=False):
        """新規ユーザーを作成する"""

        try:
            user = auth.create_user(email=email,
                                    password=password)
            created_at = get_now()
            updated_at = get_now()
            self.user_db.document(user.uid).set({
                'name': name,
                'adminFlg': admin_flg,
                'disableFlg': False,
                'imageUrl': '',
                'createdAt': created_at,
                'updatedAt': updated_at,
            })
            return user.uid, created_at, updated_at
        except Exception as e:
            payload = {
                'firebaseError': e.__class__.__name__,
            }
            if hasattr(e, 'code'):
                payload['code'] = e.code
                if e.code == UserAlreadyExistsError.status:
                    raise UserAlreadyExistsError(payload=payload)
            raise InternalServerError(payload=payload)

    def update_document(self, collection, id, document, merge=True):
        """
        Firestoreのドキュメントを更新する
        - merge: Trueにすると、documentで指定されたパラメータのみ更新される
        """

        try:
            update_profile = convert_keys_to_camel_case(document.copy())
            update_profile['updatedAt'] = get_now()

            collection.document(id).set(update_profile, merge=merge)
        except Exception as e:
            payload = {
                'firebaseError': e.__class__.__name__,
            }
            if hasattr(e, 'code'):
                payload['code'] = e.code
                if e.code == UserNotFoundError.status:
                    raise UserNotFoundError(payload=payload)
            raise InternalServerError(payload=payload)

    def update_user_profile(self, uid, profile):
        """ユーザーのプロフィールを更新する"""

        self.update_document(self.user_db, uid, profile)

    def delete_document(self, collection, id):
        """Firestoreのドキュメントを削除する"""

        try:
            collection.document(id).delete()
        except Exception as e:
            payload = {
                'firebaseError': e.__class__.__name__,
            }
            if hasattr(e, 'code'):
                payload['code'] = e.code
                if e.code == UserNotFoundError.status:
                    raise UserNotFoundError(payload=payload)
            raise InternalServerError(payload=payload)

    def delete_user(self, uid):
        """ユーザーを削除する"""

        auth.delete_user(uid)
        self.delete_document(self.user_db, uid)
