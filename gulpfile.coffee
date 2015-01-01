gulp = require "gulp"
concat = require "gulp-concat"
minifyCSS = require "gulp-minify-css"
rename = require "gulp-rename"

gulpSrc = [
  "src/css/normalize.css"
  "src/css/main.css"
]

gulp.task "css", ->
  gulp
    .src gulpSrc
    .pipe gulp.dest("./public/css")
    .pipe concat("all.css")
    .pipe gulp.dest("./public/css")
    .pipe minifyCSS()
    .pipe rename("all.min.css")
    .pipe gulp.dest("./public/css")

gulp.task 'default', ['css']
