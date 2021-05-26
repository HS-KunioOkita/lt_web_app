import os


class Setting:
    def __init__(self):
        env = os.environ.get('ENV')
        if not env:
            env = 'dev'

        self.env = env


setting = Setting()
