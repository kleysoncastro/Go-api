const {Router} = require('express')

const routes = new Router();

routes.get('/', (req, res) => {
  res.json({msg: 'Hello word'})
})

module.exports = routes;