const express = require('express')
const routes = require('./routes')

class App {

  constructor() {
    this.server = express()
    this.routes()
    this.middlewares()
  }

  middlewares() {
    this.server.use(express.json())
  }

  routes() {
    this.server.use(routes)
  }
}
// esta exportando uma instacia
module.exports = new App.server;