express = require "express"
st = require "st"
config = require "config"
port = config.get("port") ? 8080

app = express()
http = require("http").Server(app)

mountOpts = {
  path: __dirname + "/public"
  url: "/"
  index: "index.html"
}

# don't use cache in dev mode
if !config.get("use-cache")
  mountOpts.cache = false

mount = st mountOpts

app.use(mount)

http.listen(port)
