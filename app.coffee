express = require "express"
st = require "st"
config = require "config"
port = config.get("port") ? 8080

app = express()
http = require("http").Server(app)

mount = st
  path: __dirname + "/public"
  url: "/"
  index: "index.html"

app.use(mount)

http.listen(port)
