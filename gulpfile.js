var gulp        = require('gulp'),
  sass          = require('gulp-sass'),
  browserSync   = require('browser-sync'),
  concat        = require('gulp-concat'),
  uglify        = require('gulp-uglifyjs'),
  cssnano       = require('gulp-cssnano'),
  rename        = require('gulp-rename'),
  del           = require('del'),
  imagemin      = require('gulp-imagemin'),
  cache         = require('gulp-cache'),
  autoprefixer  = require('gulp-autoprefixer');


// Таск для Sass
gulp.task('sass', function() {
  return gulp.src('app/scss/**/*.scss')
    .pipe(sass())
    .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
    .pipe(gulp.dest('app/css'))
    .pipe(browserSync.reload({stream: true}))
});

//таск для синхонизации с браузером
gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: 'app'
    },
    notify: false
  });
});

//Таск для всех сприптов
gulp.task('scripts', function() {
  return gulp.src([
    'app/libs/jquery/dist/jquery.min.js',
    'app/libs/magnific-popup/dist/jquery.magnific-popup.min.js'
    ])
    .pipe(concat('libs.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('app/js'));
});

gulp.task('code', function() {
  return gulp.src('app/*.html')
  .pipe(browserSync.reload({ stream: true }))
});

gulp.task('css-libs', function() {
  return gulp.src('app/css/libs.css')
    .pipe(cssnano())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('app/css'));
});

gulp.task('clean', async function() {
  return del.sync('dist');
});

gulp.task('img', function() {
  return gulp.src('app/img/**/*')
    .pipe(cache(imagemin({
      interlaced: true,
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
    })))
    .pipe(gulp.dest('dist/img'));
});

gulp.task('prebuild', async function() {

  var buildCss = gulp.src([
    'app/css/main.css',
    'app/css/libs.min.css'
    ])
  .pipe(gulp.dest('dist/css'))

  var buildFonts = gulp.src('app/fonts/**/*')
  .pipe(gulp.dest('dist/fonts'))

  var buildJs = gulp.src('app/js/**/*')
  .pipe(gulp.dest('dist/js'))

  var buildHtml = gulp.src('app/*.html')
  .pipe(gulp.dest('dist'));

});

gulp.task('clear', function (callback) {
  return cache.clearAll();
})

gulp.task('watch', function() {
  gulp.watch('app/scss/**/*.scss', gulp.parallel('sass'));
  gulp.watch('app/*.html', gulp.parallel('code'));
  gulp.watch(['app/js/common.js', 'app/libs/**/*.js'], gulp.parallel('scripts'));
});

gulp.task('default', gulp.parallel('css-libs', 'sass', 'scripts', 'browser-sync', 'watch'));
gulp.task('build', gulp.parallel('prebuild', 'clean', 'img', 'sass', 'scripts'));