var gulp = require('gulp'),
    gutil = require('gulp-util'),
    sass = require('gulp-sass'),
    coffee = require('gulp-coffee'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    watch = require('gulp-watch'),
    nodemon = require('gulp-nodemon');

var sassInput = ['public/stylesheets/scss/style.scss'],
    sassOutput = ['public/stylesheets'],
    coffeeInput = ['public/javascript/coffee'],
    javascriptInput = ['public/javascript/*.js'],
    javascriptOutput = ['public/javascript'];

// Task Logging
gulp.task('log', function() {
  gutil.log('== My Log Task ==')
});
// SASS Compiling
gulp.task('sass', function() {
  gulp.src(sassInput)
  .pipe(sass({style: 'expanded'}))
    .on('error', gutil.log)
  .pipe(gulp.dest(sassOutput))
});
// Coffee Compiling
gulp.task('coffee', function() {
  gulp.src(coffeeInput)
  .pipe(coffee({bare: true})
    .on('error', gutil.log))
  .pipe(gulp.dest('javascript'))
});
// JS
gulp.task('js', function() {
  gulp.src(javascriptInput)
  .pipe(uglify())
  .pipe(concat('script.js'))
  .pipe(gulp.dest(javascriptOutput))
});
// Watch
gulp.task('watch', function() {
  gulp.watch(coffeeInput, ['coffee']);
  gulp.watch(javascriptInput, ['js']);
  gulp.watch(sassInput, ['sass']);
});

gulp.task('demon', function () {
  nodemon({
    script: 'app.js',
    ext: 'js',
    env: {
      'NODE_ENV': 'development'
    }
  })
    .on('start', ['watch'])
    .on('change', ['watch'])
    .on('restart', function () {
      console.log('restarted!');
    });
});

// Default Task
gulp.task('default', ['demon']);
