import re
import functools
from datetime import datetime

private_pattern = re.compile('^(_)')


def require_client(f):
    @functools.wraps(f)
    def _wrap(*args, **kwargs):
        self = args[0]
        if self._client is None:
            # ToDo
            raise Exception()
        return f(*args, **kwargs)
    return _wrap


class ModelBase:
    def __init__(self, client, created_at=None, updated_at=None):
        self._client = None
        if client:
            self._client = client

        self.created_at = created_at
        self.updated_at = updated_at

    @require_client
    def update(self, id, document):
        params = self.to_dict().copy()
        params.update(document)
        self._client.update_document(id, params)
        self.set_params(**document)

    @require_client
    def delete(self, id):
        self._client.delete_document(id)

    def set_params(self, **params):
        for key, value in params.items():
            if key in self.to_dict():
                setattr(self, key, value)

    def to_dict(self, convert_datetime=False):
        params = {
            key: value for key, value in self.__dict__.items()
            if not re.match(private_pattern, key)
        }

        if convert_datetime:
            # datetimeはタイムスタンプに変換
            for key, value in params.items():
                if isinstance(value, datetime):
                    params[key] = int(value.timestamp())
        return params
