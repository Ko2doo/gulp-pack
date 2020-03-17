/*
var gulp            = require('gulp'),
    sass            = require('gulp-sass'),
    smartgrid       = require('smart-grid'),
    htmlhint        = require("gulp-htmlhint"),
    htmlhintConfig  = require('htmlhint-htmlacademy'),
    browserSync     = require('browser-sync'),
    addsrc          = require('gulp-add-src'),
    gcmq            = require('gulp-group-css-media-queries'),
    concat          = require('gulp-concat'),
    uglify          = require('gulp-uglifyjs'),
    cssnano         = require('gulp-cssnano'),
    rename          = require('gulp-rename'),
    del             = require('del'),
    cache           = require('gulp-cache'),
    autoprefixer    = require('gulp-autoprefixer');
*/





"use strict";

import webpack from "webpack";
import webpackStream from "webpack-stream";
import gulp from "gulp";
import gulpif from "gulp-if";
import browsersync from "browser-sync";
import autoprefixer from "gulp-autoprefixer";
import sass from "gulp-sass";
import gcmq from "gulp-group-css-media-queries";
import sortCSSmq from "sort-css-media-queries";
import mincss from "gulp-clean-css";
import postcss from "gulp-postcss";
import sourcemaps from "gulp-sourcemaps";
import rename from "gulp-rename";
import imagemin from "gulp-imagemin";
import imageminPngquant from "imagemin-pngquant";
import imageminZopfli from "imagemin-zopfli";
import imageminMozjpeg from "imagemin-mozjpeg";
import imageminGiflossy from "imagemin-giflossy";
import imageminWebp from "imagemin-webp";
import webp from "gulp-webp";
// import favicons from "gulp-favicons";
//import replace from "gulp-replace";
//import rigger from "gulp-rigger";
import plumber from "gulp-plumber";
import debug from "gulp-debug";
import del from "del";
import yargs from "yargs";
import htmlhint from "gulp-htmlhint";
import htmlhintConfig from "htmlhint-htmlacademy";

const webpackConfig = require("./webpack.config.js"),
	argv = yargs.argv,
	production = !!argv.production,
	smartgrid = require("smart-grid"),

	paths = {
		markup: {
			src: [
				"./app/index.html"
			],
			dist: "./dist/",
			watch: "./app/**/*.html"
		},
		style: {
			src: "./app/scss/main.scss",
			dist: "./dist/css/",
			watch: [
				"./app/scss/**/*.scss",
			]
		},
		script: {
			src: "./app/js/index.js",
			dist: "./dist/js/",
			watch: [
				"./app/js/**/*.js"
			]
		},
		image: {
			src: [
				"./app/img/**/*.{jpg,jpeg,png,gif,svg}",
				"!./app/img/svg/*.svg",
				"!./app/img/favicon.{jpg,jpeg,png,gif}"
			],
			dist: "./dist/img/",
			watch: "./app/img/**/*.{jpg,jpeg,png,gif,svg}"
		},
		webp: {
			src: "./app/img/**/*_webp.{jpg,jpeg,png}",
			dist: "./dist/img/",
			watch: "./app/img/**/*_webp.{jpg,jpeg,png}"
		},
		font: {
			src: "./app/fonts/**/*.{ttf,otf,woff,woff2}",
			dist: "./dist/fonts/",
			watch: "./app/fonts/**/*.{ttf,otf,woff,woff2}"
		},
	};

webpackConfig.mode = production ? "production" : "development";
webpackConfig.devtool = production ? false : "cheap-eval-source-map";

export const server = () => {
	browsersync.init({
		server: "./dist/",
		tunnel: false,
		notify: true
	});

	gulp.watch(paths.markup.watch, markups);
	gulp.watch(paths.style.watch, styles);
	gulp.watch(paths.script.watch, scripts);
	gulp.watch(paths.image.watch, images);
	gulp.watch(paths.webp.watch, webpimages);
};

// export const cleanFiles = () => gulp.src("./dist/*", {read: false})
// 	.pipe(clean())
// 	.pipe(debug({
// 		"title": "Cleaning old files..."
// 	}));

export const serverConfig = () => gulp.src(paths.server_config.src)
	.pipe(gulp.dest(paths.server_config.dist))
	.pipe(debug({
		"title": "Config server..."
	}));

// подключение smart-grid сетки

export const smartGrid = cb => {
	smartgrid("./src/styles/vendor", {
		outputStyle: "scss",
		filename: "_smart-grid",
		columns: 12, // number of grid columns
		offset: "30px", // gutter width
		mobileFirst: true,
		mixinNames: {
			container: "container"
		},
		container: {
			fields: "15px" // side fields
		},
		breakPoints: {
			xs: {
				width: "320px"
			},
			sm: {
				width: "576px"
			},
			md: {
				width: "768px"
			},
			lg: {
				width: "992px"
			},
			xl: {
				width: "1200px"
			}
		}
	});
	cb();
};

// работа с разметкой

export const markups = () => gulp.src(paths.markup.src)
  .pipe(htmlhint(htmlhintConfig))
  .pipe(htmlhint.reporter())
	.pipe(gulp.dest(paths.markup.dist))
	.pipe(debug({
		"title": "HTML files"
	}))
	.on("end", browsersync.reload);

// работа со стилями

export const styles = () => gulp.src(paths.style.src)
	.pipe(gulpif(!production, sourcemaps.init()))
	.pipe(plumber())
	.pipe(sass())
	.pipe(postcss())
  .pipe(gcmq())
	.pipe(gulpif(production, autoprefixer({
		browsers: ["last 15 versions", "> 1%", "ie 8", "ie 7", { cascade: true }]
	})))
	.pipe(gulpif(production, mincss({
		compatibility: "ie8", level: {
			1: {
				specialComments: 0,
				removeEmpty: true,
				removeWhitespace: true
			},
			2: {
				mergeMedia: true,
				removeEmpty: true,
				removeDuplicateFontRules: true,
				removeDuplicateMediaBlocks: true,
				removeDuplicateRules: true,
				removeUnusedAtRules: false
			}
		}
	})))
	.pipe(gulpif(production, rename({
		suffix: ".min"
	})))
	.pipe(plumber.stop())
	.pipe(gulpif(!production, sourcemaps.write("./maps/")))
	.pipe(gulp.dest(paths.style.dist))
	.pipe(debug({
		"title": "CSS files"
	}))
	.pipe(browsersync.stream());

// работа со скриптами

export const scripts = () => gulp.src(paths.script.src)
.pipe(webpackStream(webpackConfig), webpack)
.pipe(gulpif(production, rename({
	suffix: ".min"
})))
.pipe(gulp.dest(paths.script.dist))
.pipe(debug({
	"title": "Working with JS files"
}))
.on("end", browsersync.reload);

// работа с изображениями

export const images = () => gulp.src(paths.image.src)
.pipe(gulpif(production, imagemin([
	imageminGiflossy({
		optimizationLevel: 3,
		optimize: 3,
		lossy: 2
	}),
	imageminPngquant({
		speed: 5,
		quality: [0.6, 0.8]
	}),
	imageminZopfli({
		more: true
	}),
	imageminMozjpeg({
		progressive: true,
		quality: 70
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
])))
.pipe(gulp.dest(paths.image.dist))
.pipe(debug({
	"title": "Images"
}))
.on("end", browsersync.reload);

// работа с webp

export const webpimages = () => gulp.src(paths.webp.src)
.pipe(webp(gulpif(production, imageminWebp({
	lossless: true,
	quality: 90,
	alphaQuality: 90
}))))
.pipe(gulp.dest(paths.webp.dist))
.pipe(debug({
	"title": "WebP images"
}));

// hf,jnf cj ihbanfvb

export const fonts = () => gulp.src(paths.font.src)
.pipe(gulp.dest(paths.font.dist))
.pipe(debug({
	"title": "Fonts"
}));

export const dev = gulp.series(smartGrid,
	gulp.parallel(markups, styles, scripts, images, webpimages, fonts),
	gulp.parallel(server));

export const build = gulp.series(smartGrid, serverConfig, markups, styles, scripts, images, webpimages, fonts);

export default dev;

// // Таск для Sass
// gulp.task('sass', async function() {
//   return gulp.src('app/scss/**/*.scss')
//     .pipe(sass({
//         outputStyle: 'expanded',
//         errorLogToConsole: true
//       })).on('error', sass.logError)
//     .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
//     .pipe(gcmq()) //группировка медиазапросов
//     .pipe(gulp.dest('app/css'))
//     .pipe(browserSync.reload({stream: true}));
// });
//
// //таск для синхонизации с браузером
// gulp.task('browser-sync', async function(cb) {
//   browserSync({
//     server: {
//       baseDir: 'app'
//     },
//     notify: false
//   }, cb);
// });
//
// // настройки сетки smart-grid
// gulp.task('smart-grid', (cb) => {
//   smartgrid('app/scss/stylesheets/', {
//     outputStyle: 'scss',
//     filename: '_smart-grid',
//     columns: 12, // number of grid columns
//     offset: '1.875rem', // gutter width - 30px
//     mobileFirst: true,
//     mixinNames: {
//         container: 'container'
//     },
//     container: {
//       maxWidth: '1170px',
//       fields: '0.9375rem' // side fields - 15px
//     },
//     breakPoints: {
//       xs: {
//           width: '20rem' // 320px
//       },
//       sm: {
//           width: '36rem' // 576px
//       },
//       md: {
//           width: '48rem' // 768px
//       },
//       lg: {
//           width: '62rem' // 992px
//       },
//       xl: {
//           width: '75rem' // 1200px
//       }
//     }
//   });
//   cb();
// });
//
// gulp.task('code', function() {
//   return gulp.src('app/**/*.html')
//   .pipe(htmlhint(htmlhintConfig))
//   .pipe(htmlhint.reporter())
//   .pipe(browserSync.reload({ stream: true }))
// });
//
// // Объединяем все js либы в один файл
// gulp.task('scripts', async function() {
//   return gulp.src(['node_modules/jquery/dist/jquery.js'])
//     .pipe(addsrc.append('node_modules/jquery-circle-progress/dist/circle-progress.js'))
//     .pipe(concat('libs.js'))
//     .pipe(gulp.dest('app/js'))
//     .pipe(browserSync.reload({stream: true}));
// });
//
// // объединям все css библиотеки в одну
// gulp.task('css-lib', function() {
//   return gulp.src([
//       'node_modules/normalize.css/normalize.css',
//     ])
//     .pipe(concat('_lib.scss'))
//     .pipe(gulp.dest('app/scss'))
//     .pipe(browserSync.reload({stream: true}));
// });
//
//
// gulp.task('clean', async function() {
//     return del.sync([
//         './../css',
//         './../fonts',
//         './../js',
//         './../*.html'],
//         {force: true})
// });
//
// gulp.task('clear-cache', function (callback) {
//   return cache.clearAll();
// });
//
// gulp.task('prebuild', async function(){
//   var buildCSS = gulp.src(['app/css/**/*.css'])
//       .pipe(cssnano()) // минификация
//       .pipe(rename({suffix: '.min'}))
//       .pipe(gulp.dest('./../css'));
//
//   var buildFonts = gulp.src('app/fonts/**/*')
//       .pipe(gulp.dest('./../fonts'));
//
//   var buildIMG = gulp.src('app/img/**/*')
//       .pipe(gulp.dest('./../img'));
//
//   var buildJSLibs = gulp.src('app/js/libs.js')
//       .pipe(uglify())
//       .pipe(rename({suffix: '.min'}))
//       .pipe(gulp.dest('./../js'));
//
//   var buildJSCommon = gulp.src('app/js/common.js')
//       .pipe(uglify())
//       .pipe(rename({suffix: '.min'}))
//       .pipe(gulp.dest('./../js'));
//
//   var buildHTML = gulp.src('app/**/*.html')
//       .pipe(gulp.dest('./../'))
// });
//
// // Следим за файлами
// gulp.task('watch', function() {
//   gulp.watch('app/scss/**/*.scss', gulp.parallel('sass'));
//   gulp.watch('app/**/*.html', gulp.parallel('code'));
//   gulp.watch(['app/js/common.js'], gulp.parallel('scripts'));
// });
//
// gulp.task('default',
//      gulp.parallel('clear-cache', 'smart-grid', 'sass', 'css-lib', 'scripts', 'browser-sync', 'watch'));
//
// gulp.task('build',
//      gulp.series('clean', 'clear-cache', 'prebuild'));
