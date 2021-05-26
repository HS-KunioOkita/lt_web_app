import re
from datetime import timezone, timedelta, datetime


JST = timezone(timedelta(hours=+9), 'JST')


def get_now(timezone_=None):
    if not timezone_:
        timezone_ = JST
    return datetime.now(timezone_)


def to_snake_case(txt, upper=False):
    if not isinstance(txt, str):
        raise Exception('Arg type is not str.')

    result = re.sub('(.[A-Z])',
                    lambda x: x.group(1)[0] + '_' + x.group(1)[1],
                    txt).lower()
    if upper:
        result = result.upper()
    return result


def to_camel_case(txt, head_upper=False):
    if not isinstance(txt, str):
        raise Exception('Arg type is not str.')

    txt_ = re.sub('_([a-zA-Z])', lambda x: x.group(1)[0].upper(), txt)
    if head_upper:
        txt_ = txt_[0].upper() + txt_[1:]
    else:
        txt_ = txt_[0].lower() + txt_[1:]

    return txt_


def convert_keys_to_snake_case(dict_):
    if not isinstance(dict_, dict):
        raise Exception('Arg type is not dict.')

    result = {}
    for key, value in dict_.items():
        if type(value) is dict:
            value = convert_keys_to_snake_case(value)
        if type(value) is list:
            value_list = []
            for v in value:
                if type(v) is dict:
                    v = convert_keys_to_snake_case(v)
                value_list.append(v)
            result[to_snake_case(key)] = value_list
            continue

        result[to_snake_case(key)] = value
    return result


def convert_keys_to_camel_case(dict_):
    if not isinstance(dict_, dict):
        raise Exception('Arg type is not dict.')

    result = {}
    for key, value in dict_.items():
        if type(value) is dict:
            value = convert_keys_to_camel_case(value)
        if type(value) is list:
            value_list = []
            for v in value:
                if type(v) is dict:
                    v = convert_keys_to_camel_case(v)
                value_list.append(v)
            result[to_camel_case(key)] = value_list
            continue

        result[to_camel_case(key)] = value
    return result


def convert_hex_to_dec(x, bit):
    """16進数文字列xをビット数bit内の符号付10進数に変換する"""

    dec = int(str(x), 16)
    if dec >> bit:
        raise ValueError
    return int(dec - (dec >> (bit - 1) << bit))
