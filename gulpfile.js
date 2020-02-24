var gulp          = require('gulp'),
    sass          = require('gulp-sass'),
    smartgrid     = require('smart-grid'),
    browserSync   = require('browser-sync'),
    addsrc        = require('gulp-add-src'),
    gcmq          = require('gulp-group-css-media-queries'),
    concat        = require('gulp-concat'),
    uglify        = require('gulp-uglifyjs'),
    cssnano       = require('gulp-cssnano'),
    rename        = require('gulp-rename'),
    del           = require('del'),
    cache         = require('gulp-cache'),
    autoprefixer  = require('gulp-autoprefixer');


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
    mobileFirst: false,
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
  .pipe(browserSync.reload({ stream: true }))
});

// Объединяем все js либы в один файл
gulp.task('scripts', async function() {
  return gulp.src(['node_modules/jquery/dist/jquery.js'])
    .pipe(addsrc.append('node_modules/magnific-popup/dist/jquery.magnific-popup.js'))
    .pipe(concat('libs.js'))
    .pipe(gulp.dest('app/js'))
    .pipe(browserSync.reload({stream: true}));
});

// объединям все css библиотеки в одну
gulp.task('css-lib', function() {
  return gulp.src([
      'node_modules/normalize.css/normalize.css',
      'node_modules/magnific-popup/dist/magnific-popup.css'
    ])
    .pipe(concat('libs.css'))
    .pipe(gulp.dest('app/css'))
    .pipe(browserSync.reload({stream: true}));
});


gulp.task('clean', async function() {
  return del.sync('dist');
});

gulp.task('clear-cache', function (callback) {
  return cache.clearAll();
});

gulp.task('prebuild', async function(){
  var buildCSS = gulp.src(['app/css/**/*.css'])
      .pipe(cssnano()) // минификация
      .pipe(rename({suffix: '.min'}))
      .pipe(gulp.dest('dist/css'))

  var buildFonts = gulp.src('app/fonts/**/*')
      .pipe(gulp.dest('dist/fonts'))

  var buildIMG = gulp.src('app/img/**/*')
      .pipe(gulp.dest('dist/img'))

  var buildJSLibs = gulp.src('app/js/libs.js')
      .pipe(uglify())
      .pipe(rename({suffix: '.min'}))
      .pipe(gulp.dest('dist/js'))

  var buildJSCommon = gulp.src('app/js/common.js')
      .pipe(uglify())
      .pipe(rename({suffix: '.min'}))
      .pipe(gulp.dest('dist/js'))

  var buildHTML = gulp.src('app/**/*.html')
      .pipe(gulp.dest('dist'))
});

// Следим за файлами
gulp.task('watch', function() {
  gulp.watch('app/scss/**/*.scss', gulp.parallel('sass'));
  gulp.watch('app/**/*.html', gulp.parallel('code'));
  gulp.watch(['app/js/common.js'], gulp.parallel('scripts'));
});

gulp.task('default',
     gulp.parallel('clear-cache', 'smart-grid', 'sass', 'css-lib', 'scripts', 'browser-sync', 'watch'));

gulp.task('build',
     gulp.series('clean', 'clear-cache', 'prebuild'));