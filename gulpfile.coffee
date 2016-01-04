gulp = require "gulp"
concat = require "gulp-concat"
minifyCSS = require "gulp-minify-css"
rename = require "gulp-rename"
htmlmin = require "gulp-htmlmin"

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
  options =
    removeComments: true
    collapseWhitespace: true
    removeAttributeQuotes: true
    removeEmptyAttributes: true
    minifyJS: true
    minifyCSS: true

  gulp
    .src gulpHtmlSrc
    .pipe htmlmin(options)
    .pipe gulp.dest("./public")


gulp.task "watch", ->
  gulp.watch gulpCssSrc, ["css"]
  gulp.watch gulpHtmlSrc, ["html"]


gulp.task "dev", ["css", "html"]
gulp.task "default", ["css", "html", "watch"]
