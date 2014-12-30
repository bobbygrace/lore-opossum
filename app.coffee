express = require 'express'
st = require 'st'

app = express()
http = require('http').Server(app)

mount = st
  path: __dirname + '/public'
  url: '/'
  index: "index.html"

app.use(mount)

http.listen(8080)
