export const ENV = {
  dev: 'dev',
  prod: 'prod',
  test: 'test'
}
const NODE_ENV = {
  development: ENV.dev,
  production: ENV.prod,
  testing: ENV.test
}

class Setting {
  constructor () {
    this.env = NODE_ENV[process.env.NODE_ENV]
  }
}

export const setting = new Setting()
