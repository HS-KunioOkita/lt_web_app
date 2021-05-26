from cerberus import Validator as cv

from libs.error import APIValidationError
from libs.utils import convert_hex_to_dec


class Validator:
    def __init__(self, data):
        # 全フィールドを取得
        self.fields = {
            key: value for key, value in self.__class__.__dict__.items()
            if type(value) is Field
        }

        # 全体のスキーマ作成
        schema = {}
        for key, value in self.fields.items():
            schema[key] = value.allow_unknown

        # バリデータ生成
        self.validator = Field(schema)

        # 元のリクエストデータを保持しておく
        self.data = data

    def validate(self, is_accept_empty_data=True, raise_error=True):
        """検証する"""

        success = self.validator.validate(self.data)
        if not success:
            if raise_error:
                raise APIValidationError(payload=self.validator.errors)
            return None

        if not is_accept_empty_data:
            # 必須要素名を取得
            required_key_list = [key for key, value in self.fields.items()
                                 if value.allow_unknown['required']]

            # データをコピーし必須要素を削除する
            data = self.data.copy()
            for key in required_key_list:
                del data[key]

            if not data:
                # データが空の場合
                if raise_error:
                    raise APIValidationError(payload={
                        'message': 'This API required request params.'
                    })
                return None

        return self.validator.document


class Field(cv):
    SMALLINT_MAX = 0x7fff
    SMALLINT_MIN = convert_hex_to_dec('0x8000', 16)
    INTEGER_MAX = 0x7fffffff
    INTEGER_MIN = convert_hex_to_dec('0x80000000', 32)
    BIGINT_MAX = 0x7fffffffffffffff
    BIGINT_MIN = convert_hex_to_dec('0x8000000000000000', 64)

    # 9999-12-31 23:59:59 (UTC)
    TIMESTAMP_MAX = 253402300799

    def validate_value(self, value):
        """検証する"""
        return self.validate({'value': value})

    @classmethod
    def id_field(cls, required=True, coerce=None):
        return cls.integer_field(required=required, coerce=coerce)

    @classmethod
    def timestamp_field(cls, required=True, nullable=False):
        return cls.big_int_field(min_value=0,
                                 max_value=cls.TIMESTAMP_MAX,
                                 required=required,
                                 nullable=nullable)

    @classmethod
    def email_field(cls, required=True):

        regex = r"^[a-zA-Z0-9\.!#$%&'*+\\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$"
        return cls.char_field(min_length=1,
                              max_length=254,
                              required=required,
                              regex=regex)

    @classmethod
    def password_field(cls, required=True):

        regex = r"[a-zA-Z0-9!-/:-@\\[-`{-~]+$"
        return cls.char_field(min_length=8,
                              max_length=100,
                              required=required,
                              regex=regex)

    @classmethod
    def user_name_field(cls, required=True):
        return cls.char_field(min_length=1,
                              max_length=10,
                              required=required)

    @classmethod
    def custom_enum_field(cls, enum_class, required=True, nullable=False):

        # カスタムEnumのField
        enum_value_list = [e.value for e in enum_class]
        return cls.integer_field(required=required,
                                 nullable=nullable,
                                 allowed=enum_value_list)

    @classmethod
    def integer_field(cls,
                      min_value=INTEGER_MIN,
                      max_value=INTEGER_MAX,
                      required=True,
                      nullable=False,
                      allowed=None,
                      coerce=None):

        validations = {
            'type': 'integer',
            'accept_bool': False,
            'required': required,
            'min': min_value,
            'max': max_value,
            'nullable': nullable,
            'allowed': allowed,
            'coerce': coerce,
        }
        return cls.__create_field(**validations)

    @classmethod
    def big_int_field(cls,
                      min_value=BIGINT_MIN,
                      max_value=BIGINT_MAX,
                      required=True,
                      nullable=False,
                      allowed=None,
                      coerce=None):

        validations = {
            'type': 'integer',
            'accept_bool': False,
            'required': required,
            'min': min_value,
            'max': max_value,
            'nullable': nullable,
            'allowed': allowed,
            'coerce': coerce,
        }
        return cls.__create_field(**validations)

    @classmethod
    def float_field(cls,
                    min_value=BIGINT_MIN,
                    max_value=BIGINT_MAX,
                    required=True,
                    nullable=False,
                    allowed=None,
                    coerce=None):

        validations = {
            'type': 'float',
            'required': required,
            'min': min_value,
            'max': max_value,
            'nullable': nullable,
            'allowed': allowed,
            'coerce': coerce,
        }
        return cls.__create_field(**validations)

    @classmethod
    def char_field(cls,
                   min_length=0,
                   max_length=None,
                   required=True,
                   nullable=False,
                   empty=False,
                   allowed=None,
                   regex=None,
                   coerce=None):

        validations = {
            'type': 'string',
            'required': required,
            'minlength': min_length,
            'maxlength': max_length,
            'nullable': nullable,
            'empty': empty,
            'allowed': allowed,
            'regex': regex,
            'coerce': coerce,
        }
        return cls.__create_field(**validations)

    @classmethod
    def boolean_field(cls,
                      required=True,
                      nullable=False,
                      allowed=None,
                      coerce=None):

        validations = {
            'type': 'boolean',
            'required': required,
            'nullable': nullable,
            'allowed': allowed,
            'coerce': coerce,
        }
        return cls.__create_field(**validations)

    @classmethod
    def list_field(cls,
                   items=None,
                   required=True,
                   nullable=False,
                   empty=False,
                   allowed=None,
                   coerce=None):

        validations = {
            'type': 'list',
            'items': items,
            'required': required,
            'nullable': nullable,
            'empty': empty,
            'allowed': allowed,
            'coerce': coerce,
        }
        return cls.__create_field(**validations)

    @classmethod
    def dict_field(cls,
                   schema=None,
                   required=True,
                   nullable=False,
                   empty=False,
                   allowed=None,
                   coerce=None):

        validations = {
            'type': 'dict',
            'schema': schema,
            'required': required,
            'nullable': nullable,
            'empty': empty,
            'allowed': allowed,
            'coerce': coerce,
        }
        return cls.__create_field(**validations)

    @classmethod
    def __create_field(cls, **kwargs):
        """フィールドを生成する"""

        validations = {}
        for key, value in kwargs.items():
            if value is not None:
                validations[key] = value

        field = cls({})
        field.allow_unknown = validations
        return field

    def _validate_accept_bool(self, accept_bool, field, value):
        """boolを受け付けるかどうかチェックする"""

        if accept_bool:
            return
        if type(value) is bool:
            self._error(field, "{} is bool.".format(value))
