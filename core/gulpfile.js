// основные модули
var gulp            = require('gulp'),
    babel           = require('gulp-babel'),
    browserSync     = require('browser-sync');
// модули разметки

// модули стилей
var sass            = require('gulp-sass'),
    smartgrid       = require('smart-grid'),
    gcmq            = require('gulp-group-css-media-queries'),
    cleanCSS        = require('gulp-clean-css'),
    autoprefixer    = require('gulp-autoprefixer');
// модули скриптов
var minJs           = require('gulp-terser');
// модули изображений
var imageResize     = require('gulp-image-resize'),
    imagemin        = require('gulp-imagemin'),
    imageminGiflossy= require('imagemin-giflossy'),
    imageminPngquant= require('imagemin-pngquant'),
    imageminZopfli  = require('imagemin-zopfli'),
    imageminMozjpeg = require('imagemin-mozjpeg')
    favicons        = require('gulp-favicons');
// модули валидации, проверок и исправлений
var htmlhint        = require("gulp-htmlhint"),
    htmlhintConfig  = require('htmlhint-htmlacademy'),
    htmlValidator   = require('gulp-w3c-html-validator'),
    prettier        = require('gulp-prettier'),
    eslint          = require('gulp-eslint');
// остальные модули
var addsrc          = require('gulp-add-src'),
    concat          = require('gulp-concat'),
    rename          = require('gulp-rename'),
    del             = require('del'),
    cache           = require('gulp-cache'),
    sourcemaps      = require('gulp-sourcemaps'),
    plumber         = require('gulp-plumber'),
    newer           = require('gulp-newer');

// настройки сетки smart-grid
gulp.task('smart-grid', (cb) => {
  smartgrid('app/scss/libs', {
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
  return gulp.src('app/**/*.html')
  .pipe(htmlhint(htmlhintConfig))
  .pipe(htmlhint.reporter())
  .pipe(plumber())
  .pipe(htmlValidator())
  .pipe(browserSync.reload({ stream: true }))
});


// таск для стилей
gulp.task('styles', async function() {
  return gulp.src('app/scss/main.scss')
    .pipe(sourcemaps.init())
    .pipe(plumber())
    .pipe(sass({
        outputStyle: 'expanded',
        errorLogToConsole: true
      }))
    .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
    .pipe(cleanCSS())
    .pipe(rename({suffix: '.min'}))
    .pipe(sourcemaps.write('./maps/'))
    .pipe(gulp.dest('app/css'))
    .pipe(browserSync.reload({stream: true}));
});

// таск для скриптов
gulp.task('scripts', function() {
  return gulp
        .src([
        'app/js/libs/**/*.js',
        'app/js/main/**/*.js'
        ])
        .pipe(sourcemaps.init())
        .pipe(plumber())
        .pipe(concat('index.js'))
        .pipe(babel())
        .pipe(minJs())
        .pipe(rename({suffix: '.min'}))
        .pipe(sourcemaps.write('./maps/'))
        .pipe(gulp.dest('app/js/'))
        .pipe(browserSync.reload({ stream: true }))
});

// делаем разметку красивой
gulp.task('prettier', function() {
  return gulp
        .src([
          'app/**/*.html',
          'app/scss/**/*.scss',
          'app/css/**/*.css',
          'app/js/main/**/*.js',
          'app/js/libs/**/*.js'
        ])
        .pipe(plumber())
        .pipe(prettier({editorconfig: true}))
        .pipe(gulp.dest(function(file){
            return file.base;
        }));
});

// таск изображений

gulp.task('images', function() {
  return gulp.src([
          "app/imgStock/**/*.{jpg,jpeg,png,gif,svg}",
  				"!app/imgStock/svg/*.svg",
  				"!app/imgStock/favicons/**/*.{jpg,jpeg,png,gif}"
        ])
        .pipe(imageResize({
           imageMagick: true,
           width: 1024,
           height: 768
        }))
        .pipe(imagemin(
          {verbose: true},
          [
      		imageminPngquant({
            speed: 1,
            floyd: 1,
            quality: [0.5]
      		}),
      		imageminZopfli({
      			more: true
      		}),
      		imageminMozjpeg({
      			progressive: true,
            quality: 45,
      		}),
      		imagemin.svgo({
      			plugins: [
      				{ removeViewBox: false },
      				{ removeUnusedNS: false },
      				{ removeUselessStrokeAndFill: false },
      				{ cleanupIDs: false },
      				{ removeComments: true },
      				{ removeEmptyAttrs: true },
      				{ removeEmptyText: true },
      				{ collapseGroups: true }
      			]
      		})
      	]))
        .pipe(gulp.dest('app/img/'))
        .pipe(browserSync.reload({ stream: true }))
});

// gulp.task('webp', function() {
//   return gulp
//         .src('./app/imgStock/**/*_webp.{jpg,jpeg,png}')
//         .pipe(plumber())
//         .pipe(webp.imageminWebp({
//       		lossless: true,
//       		quality: 90,
//       		alphaQuality: 90
//       	}))
//         .pipe(gulp.dest('./app/img/'))
//         .pipe(browserSync.reload({ stream: true }))
// });

// таск для генерации фавуионок сайта
gulp.task('favicons', function() {
  return gulp
        .src('app/imgStock/favicons/favicon.{jpg,jpeg,png,gif}')
        .pipe(plumber())
        .pipe(favicons({
          icons: {
            appleIcon: true,
            favicons: true,
            online: false,
            appleStartup: false,
            android: false,
            firefox: false,
            yandex: false,
            windows: false,
            coast: false
          }
        }))
        .pipe(gulp.dest('app/img/favicons/'))
        .pipe(browserSync.reload({ stream: true }))
});

// таск очистки папки продакшн
gulp.task('clean', async function() {
    return del.sync([
        './../css',
        './../fonts',
        './../img',
        './../js',
        './../*.html'],
        {force: true})
});

// таск чистки кэша
gulp.task('clear-cache', function (callback) {
  return cache.clearAll();
});

// таск для сборки готовых файлов в папку продакшн
gulp.task('prebuild', async function(){
  var buildCSS = gulp.src([
    'app/css/**/*',
    '!app/css/main.css'
  ])
    .pipe(gulp.dest('./../css'));

  var buildFonts = gulp.src('app/img/**/*')
      .pipe(gulp.dest('./../img'));

  var buildFonts = gulp.src('app/fonts/**/*')
      .pipe(gulp.dest('./../fonts'));

  var buildJSIndex = gulp.src([
    'app/js/index.min.js',
  ])
      .pipe(gulp.dest('./../js'));

  var buildJSMap = gulp.src([
    'app/js/maps/**/*.map',
  ])
      .pipe(gulp.dest('./../js/maps'));

  var buildHTML = gulp.src('app/**/*.html')
      .pipe(gulp.dest('./../'))
});

//таск для синхонизации с браузером
var devip = require('dev-ip');
devip();

gulp.task('browser-sync', async function(cb) {
  browserSync.init({
      server: {
      baseDir: 'app'
    },
    host: "192.168.0.103",
    notify: false
  }, cb);
  gulp.watch('app/**/*.html', gulp.parallel('html'));
  gulp.watch('app/scss/**/*.scss', gulp.series('styles'));
  gulp.watch('app/js/main/*.js', gulp.series('scripts'));
  gulp.watch([
          "app/imgStock/**/*.{jpg,jpeg,png,gif,svg}",
  				"!app/imgStock/svg/*.svg",
  				"!app/imgStock/favicons/**/*.{jpg,jpeg,png,gif}"
        ], gulp.series('clear-cache', 'images'));
  gulp.watch('app/imgStock/favicons/favicon.{jpg,jpeg,png,gif}', gulp.series('favicons'));
});


gulp.task('default',
  gulp.series(
        gulp.parallel('clear-cache', 'smart-grid', 'prettier'),
        gulp.series('html', 'styles', 'scripts'),
        gulp.parallel('browser-sync')
  )
);

gulp.task('build',
     gulp.series('clean', 'clear-cache', 'prebuild'));
