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
    sourcemaps      = require('gulp-sourcemaps');

// Таск для Sass
gulp.task('sass', async function() {
  return gulp.src('app/scss/**/*.scss')
    .pipe(sass({
        outputStyle: 'expanded',
        errorLogToConsole: true
      })).on('error', sass.logError)
    .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
    .pipe(gcmq()) //группировка медиазапросов
    .pipe(gulp.dest('app/css'))
    .pipe(browserSync.reload({stream: true}));
});

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

gulp.task('code', function() {
  return gulp.src('app/**/*.html')
  .pipe(htmlhint(htmlhintConfig))
  .pipe(htmlhint.reporter())
  .pipe(browserSync.reload({ stream: true }))
});

// Объединяем все js в один файл


gulp.task('scriptLib', function() {
  return gulp
        .src('./app/js/libs/*.js')
        .pipe(concat('libs.js'))
        .pipe(gulp.dest('./app/js'))
        .pipe(browserSync.reload({ stream: true }))
});
gulp.task('scriptMain', function() {
  return gulp
        .src([
          './app/js/main/test.js',
          './app/js/main/test2.js'
        ])
        .pipe(concat('main.js'))
        .pipe(gulp.dest('./app/js'))
        .pipe(browserSync.reload({ stream: true }))
});
gulp.task('scriptAll', function() {
  return gulp
        .src([
        './app/js/libs.js',
        './app/js/main.js'
        ])
        .pipe(concat('index.js'))
        .pipe(babel())
        .pipe(gulp.dest('./app/js/'))
        .pipe(browserSync.reload({ stream: true }))
});
gulp.task('scriptMin', function() {
  return gulp
        .src('./app/js/index.js')
        .pipe(minJs())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./app/js/'))
});

  // return gulp.src('app/js')
  //   .pipe(addsrc.prepend('./app/js/libs/**/*.js'))
  //   .pipe(concat('libs.js'))
  //   .pipe(gulp.dest('./app/js'))
  //   .pipe(addsrc.append('./app/js/main/**/*.js'))
  //   .pipe(concat('main.js'))
  //   .pipe(gulp.dest('./app/js'))
  //   .pipe(addsrc.append([
  //     './app/js/libs.js',
  //     './app/js/main.js'
  //   ]))
  //   .pipe(concat('index.js'))
  //   .pipe(babel())
  //   // минификация скриптов
  //   .pipe(addsrc.append('./app/js/index.js'))
  //   .pipe(uglify())
  //   .pipe(rename({suffix: '.min'}))
  //   .pipe(gulp.src('./app/js/index.js'))
    // .pipe(sourcemaps.init({largeFile: true}))
    // .pipe(sourcemaps.write("./maps/"))
    // .pipe(gulp.dest('./app/js'))


// объединям все css библиотеки в одну
// gulp.task('css-lib', function() {
//   return gulp.src([
//       'node_modules/normalize.css/normalize.css',
//     ])
//     .pipe(concat('_lib.scss'))
//     .pipe(gulp.dest('app/scss'))
//     .pipe(browserSync.reload({stream: true}));
// });


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
  gulp.watch('app/scss/**/*.scss', gulp.parallel('sass'));
  gulp.watch('app/**/*.html', gulp.parallel('code'));
  gulp.watch('app/js/main/*.js', gulp.series('scriptLib', 'scriptMain', 'scriptAll', 'scriptMin'));
});

gulp.task('default',
  gulp.series(
        gulp.parallel('clear-cache', 'smart-grid', 'sass'),
        gulp.series('scriptLib', 'scriptMain', 'scriptAll'),
        gulp.parallel( 'browser-sync', 'watch')
  )
  // gulp.parallel('clear-cache', 'smart-grid', 'sass', 'scripts', 'browser-sync', 'watch')
);

gulp.task('build',
     gulp.series('clean', 'clear-cache', 'prebuild'));
