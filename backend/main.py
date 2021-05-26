from flask import Flask, render_template
from libs.restful_api import RestfulApi
from settings.setting import setting
from werkzeug.routing import BaseConverter


class RegexConverter(BaseConverter):
  def __init__(self, url_map, *items):
    super(RegexConverter, self).__init__(url_map)
    self.regex = items[0]


debug = setting.env == 'dev'

template_folder_path = '../frontend/dist'

app = Flask(__name__, static_folder='{}/static'.format(template_folder_path), template_folder=template_folder_path)
app.config['JSON_AS_ASCII'] = False
app.config["JSON_SORT_KEYS"] = False

app.url_map.converters['regex'] = RegexConverter

api = RestfulApi(app)
api.init()


# APIのURL以外はレンダリングする
@app.route('/<regex("(?!v[\d]+).*$"):path>')
def index(path):
    return render_template('index.html')


@app.after_request
def after_request(response):
    if debug:
        response.headers.add('Access-Control-Allow-Origin', '*')

    response.headers.add('Access-Control-Allow-Headers',
                         'Content-Type,Origin,Authorization,X-Requested-With,Accept')
    response.headers.add('Access-Control-Allow-Methods',
                         'GET,PUT,POST,DELETE,OPTIONS')
    return response


if __name__ == '__main__':
    host = '0.0.0.0'
    app.run(host=host, port=5000, debug=debug)
