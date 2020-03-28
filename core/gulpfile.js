var gulp            = require('gulp'),
    sass            = require('gulp-sass'),
    smartgrid       = require('smart-grid'),
    htmlhint        = require("gulp-htmlhint"),
    htmlhintConfig  = require('htmlhint-htmlacademy'),
    browserSync     = require('browser-sync'),
    addsrc          = require('gulp-add-src'),
    gcmq            = require('gulp-group-css-media-queries'),
    concat          = require('gulp-concat'),
    minJs          = require('gulp-terser'),
    cssnano         = require('gulp-cssnano'),
    rename          = require('gulp-rename'),
    del             = require('del'),
    cache           = require('gulp-cache'),
    autoprefixer    = require('gulp-autoprefixer'),
    babel           = require('gulp-babel'),
    sourcemaps      = require('gulp-sourcemaps'),
    prettier        = require('gulp-prettier'),
    htmlValidator   = require('gulp-w3c-html-validator'),
    eslint          = require('gulp-eslint'),
    plumber         = require('gulp-plumber');

//таск для синхонизации с браузером
gulp.task('browser-sync', async function(cb) {
  browserSync({
    server: {
      baseDir: 'app'
    },
    notify: false
  }, cb);
});

// настройки сетки smart-grid
gulp.task('smart-grid', (cb) => {
  smartgrid('app/scss/stylesheets/', {
    outputStyle: 'scss',
    filename: '_smart-grid',
    columns: 12, // number of grid columns
    offset: '1.875rem', // gutter width - 30px
    mobileFirst: true,
    mixinNames: {
        container: 'container'
    },
    container: {
      maxWidth: '1170px',
      fields: '0.9375rem' // side fields - 15px
    },
    breakPoints: {
      xs: {
          width: '20rem' // 320px
      },
      sm: {
          width: '36rem' // 576px
      },
      md: {
          width: '48rem' // 768px
      },
      lg: {
          width: '62rem' // 992px
      },
      xl: {
          width: '75rem' // 1200px
      }
    }
  });
  cb();
});

// таск html разметки

gulp.task('html', function() {
  return gulp.src('./app/**/*.html')
  .pipe(htmlhint(htmlhintConfig))
  .pipe(htmlhint.reporter())
  .pipe(plumber())
  .pipe(htmlValidator())
  .pipe(browserSync.reload({ stream: true }))
});

// Таск для стилей
gulp.task('styles', async function() {
  return gulp.src('./app/scss/**/*.scss')
    .pipe(plumber())
    .pipe(sass({
        outputStyle: 'expanded',
        errorLogToConsole: true
      })).on('error', sass.logError)
    .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
    .pipe(gcmq()) //группировка медиазапросов
    .pipe(gulp.dest('app/css'))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('stylesMin', async function() {
  return gulp.src('./app/css/main.css')
    .pipe(cssnano())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('./app/css'))
    .pipe(browserSync.reload({stream: true}));
});

// таск работы со скриптами
// собираем плагины и библиотеки
gulp.task('scriptLib', function() {
  return gulp
        .src('./app/js/libs/*.js')
        .pipe(plumber())
        .pipe(concat('libs.js'))
        .pipe(gulp.dest('./app/js'))
        .pipe(browserSync.reload({ stream: true }))
});
// собираем рукописный код
gulp.task('scriptMain', function() {
  return gulp
        .src([
          './app/js/main/test.js',
          './app/js/main/test2.js'
        ])
        .pipe(plumber())
        .pipe(concat('main.js'))
        .pipe(gulp.dest('./app/js'))
        .pipe(browserSync.reload({ stream: true }))
});
// собираем все скрипты
gulp.task('scriptAll', function() {
  return gulp
        .src([
        './app/js/libs.js',
        './app/js/main.js'
        ])
        .pipe(plumber())
        .pipe(concat('index.js'))
        .pipe(babel())
        .pipe(gulp.dest('./app/js/'))
        .pipe(browserSync.reload({ stream: true }))
});
// минифицируем скрипт
gulp.task('scriptMin', function() {
  return gulp
        .src('./app/js/index.js')
        .pipe(minJs())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./app/js/'))
});
// делаем разметку красивой
gulp.task('prettier', function() {
  return gulp
        .src([
          './app/**/*.html',
          './app/scss/**/*.scss',
          './app/css/**/*.css',
          './app/js/main/*.js',
          './app/js/libs/*.js'
        ])
        .pipe(plumber())
        .pipe(prettier({editorconfig: true}))
        .pipe(gulp.dest(function(file){
            return file.base;
        }));
});

gulp.task('clean', async function() {
    return del.sync([
        './../css',
        './../fonts',
        './../js',
        './../*.html'],
        {force: true})
});

gulp.task('clear-cache', function (callback) {
  return cache.clearAll();
});

gulp.task('prebuild', async function(){
  var buildCSS = gulp.src(['app/css/**/*.css'])
      .pipe(cssnano()) // минификация
      .pipe(rename({suffix: '.min'}))
      .pipe(gulp.dest('./../css'));

  var buildFonts = gulp.src('app/fonts/**/*')
      .pipe(gulp.dest('./../fonts'));

  var buildIMG = gulp.src('app/img/**/*')
      .pipe(gulp.dest('./../img'));

  var buildJSLibs = gulp.src('app/js/libs.js')
      .pipe(uglify())
      .pipe(rename({suffix: '.min'}))
      .pipe(gulp.dest('./../js'));

  var buildJSCommon = gulp.src('app/js/common.js')
      .pipe(uglify())
      .pipe(rename({suffix: '.min'}))
      .pipe(gulp.dest('./../js'));

  var buildHTML = gulp.src('app/**/*.html')
      .pipe(gulp.dest('./../'))
});

// Следим за файлами
gulp.task('watch', function() {
    gulp.watch('app/**/*.html', gulp.parallel('html'));
  gulp.watch('app/scss/**/*.scss', gulp.series('styles', 'stylesMin'));
  gulp.watch('app/js/main/*.js', gulp.series('scriptLib', 'scriptMain', 'scriptAll', 'scriptMin'));
});

gulp.task('default',
  gulp.series(
        gulp.parallel('clear-cache', 'smart-grid'),
        gulp.series('html', 'styles', 'stylesMin'),
        gulp.series('scriptLib', 'scriptMain', 'scriptAll'),
        gulp.parallel('prettier', 'browser-sync', 'watch')
  )
);

gulp.task('build',
     gulp.series('clean', 'clear-cache', 'prebuild'));
