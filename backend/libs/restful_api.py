from flask_restful import Api, Resource
import pathlib
from flask import jsonify
from settings.setting import setting
from importlib import import_module

from libs.error import CommonError, InternalServerError


class RestfulApi(Api):
    def init(self):

        path = 'api/urls'
        if setting.env == 'prod':
            path = 'backend/{}'.format(path)

        for p in pathlib.Path(path).glob('v*.py'):
            # APIのバージョンをファイル名から抽出
            api_ver = p.name.replace('.py', '')

            urls = import_module('api.urls.{}'.format(api_ver))
            url_patterns = urls.url_patterns

            for url_pattern in url_patterns:
                a = url_pattern.values(api_ver)
                # リソースを登録
                self.add_resource(*a)

    def handle_error(self, e):
        if isinstance(e, CommonError):
            print(e.to_dict())
            return jsonify(e.to_dict())
        else:
            # CommonErrorでcatchできないエラーを補足する
            payload = {
                'type': e.__class_.__name__,
                'message': str(e),
            }
            error_info = InternalServerError(payload=payload).to_dict()
            print(error_info)
            return jsonify(error_info)


class UrlPattern:
    __urls = {}

    def __init__(self, url, resource, name):
        self.url = url
        self.resource = resource
        self.name = name

    def values(self, api_ver):
        # <ver>/<url>の形式に整形する
        request_url = '/{}{}'.format(api_ver, self.url)

        name = '{}:{}'.format(api_ver, self.name)

        # nameとurlを紐づけて保管する
        assert name not in UrlPattern.__urls.keys()
        UrlPattern.__urls[name] = request_url

        return self.resource, request_url

    @classmethod
    def url(cls, name, **pass_params):
        assert name in UrlPattern.__urls.keys()
        url = UrlPattern.__urls[name]

        for key, pass_param in pass_params.items():
            type_ = pass_param.get('type')
            value = pass_param['value']
            # URLにパスパラメータがある場合は渡す値で置換する
            if type_ is None:
                url = url.replace('<{}>'.format(key), str(value))
            else:
                url = url.replace('<{}:{}>'.format(type_.__name__, key),
                                  str(value))

        return url
