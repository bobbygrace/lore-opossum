gulp = require "gulp"
concat = require "gulp-concat"
minifyCSS = require "gulp-minify-css"
rename = require "gulp-rename"
minifyHTML = require "gulp-minify-html"


gulp.task "css", ->

  gulpCSSSrc = [
    "src/css/normalize.css"
    "src/css/main.css"
  ]

  gulp
    .src gulpCSSSrc
    .pipe concat("all.css")
    .pipe gulp.dest("./public/css")
    .pipe minifyCSS()
    .pipe rename("all.min.css")
    .pipe gulp.dest("./public/css")


gulp.task "html", ->
  options = {empty: true}

  gulp
    .src "./src/html/index.html"
    .pipe minifyHTML(options)
    .pipe gulp.dest("./public")


gulp.task 'default', ['css', 'html']
