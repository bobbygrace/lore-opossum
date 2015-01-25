gulp = require "gulp"
concat = require "gulp-concat"
minifyCSS = require "gulp-minify-css"
rename = require "gulp-rename"
minifyHTML = require "gulp-minify-html"

gulpCssSrc = [
  "src/css/normalize.css"
  "src/css/base.css"
  "src/css/typography.css"
  "src/css/meta.css"
  "src/css/copy-button.css"
  "src/css/clipboard.css"
  "src/css/statement.css"
  "src/css/util.css"
  "src/css/print.css"
]

gulp.task "css", ->

  gulp
    .src gulpCssSrc
    .pipe concat("all.css")
    .pipe gulp.dest("./public/css")
    .pipe minifyCSS()
    .pipe rename("all.min.css")
    .pipe gulp.dest("./public/css")


gulpHtmlSrc = "./src/html/*.html"

gulp.task "html", ->
  options = {empty: true}

  gulp
    .src gulpHtmlSrc
    .pipe minifyHTML(options)
    .pipe gulp.dest("./public")


gulp.task "watch", ->
  gulp.watch gulpCssSrc, ["css"]
  gulp.watch gulpHtmlSrc, ["html"]


gulp.task "default", ["css", "html", "watch"]
