from libs.restful_api import UrlPattern

from api.view_sets.user import AdminUserViewSet, UserViewSet, DebugUserViewSet
from settings.setting import setting

url_patterns = [
    # ユーザーAPI
    UrlPattern('/User/GetAccessToken/', UserViewSet.resource('get', 'get_access_token'), 'user_get_access_token'),
    # 管理者用ユーザーAPI
    UrlPattern('/Admin/User/List/', AdminUserViewSet.resource('get', 'get_all_users'), 'admin_user_list'),
    UrlPattern('/Admin/User/Create/', AdminUserViewSet.resource('post', 'create'), 'admin_user_create'),
    UrlPattern('/Admin/User/Update/<uid>', AdminUserViewSet.resource('put', 'update'), 'admin_user_update'),
    UrlPattern('/Admin/User/Delete/<uid>', AdminUserViewSet.resource('delete', 'delete'), 'admin_user_delete'),
]

if setting.env == 'dev' or setting.env == 'test':
    url_patterns += [
        # デバッグ用API
        UrlPattern('/Debug/User/Create/', DebugUserViewSet.resource('post', 'create'), 'debug_user_create'),
    ]
