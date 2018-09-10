//npm init
//npm install -g gulp
//npm install --save-dev gulp
//npm install --save-dev browser-sync -> browser live reload
//npm install --save-dev gulp-sass -> css preprocessors
//npm install --save-dev gulp-autoprefixer -> browser compatibility
//npm install --save-dev gulp-clean-css -> minify css
//npm install --save-dev gulp-uglify -> minify js
//npm install --save-dev gulp-concat -> concat before minify
//npm install --save-dev gulp-imagemin -> minify images
//npm install --save-dev gulp-changed -> operations only on new files
//npm install --save-dev gulp-html-replace -> easy path change
//npm install --save-dev gulp-htmlmin -> minify html
//npm install --save-dev del -> file delete
//npm install --save-dev run-sequence -> asynchronical functions
//npm install --save-dev gulp-connect-php -> php server

//------------------------
//npm install -> to install all packages
//gulp -> start your code
//gulp build -> create final version

//variables declaration
var gulp = require('gulp');
var browserSync = require('browser-sync');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var cleanCSS = require('gulp-clean-css');
var cleanJS = require('gulp-uglify');
var concat = require('gulp-concat');
var imgmin = require('gulp-imagemin');
var changed = require('gulp-changed');
var htmlReplace = require('gulp-html-replace');
var cleanHTML = require('gulp-htmlmin');
var del = require('del');
var sequence = require('run-sequence');
var connectPHP = require('gulp-connect-php');
//changable variables
var config = {
	dist: 'dist/',
	src: 'src/',
	cssin: 'src/css/**/*.css',
	jsin: 'src/js/**/*.js',
	htmlin: 'src/*.html',
	phpin: 'src/*php',
	imgin: 'src/img/**/*.{jpg,jpeg,png,gif}',
	scssin: 'src/scss/**/*.scss',
	cssout: 'dist/css',
	jsout: 'dist/js/',
	htmlout: 'dist/',
	phpout: 'dist/',
	imgout: 'dist/img/',
	scssout: 'src/css/',
	cssoutname: 'style.css',
	jsoutname: 'bundle.js',
	cssreplaceout: 'css/style.css',
	jsreplaceout: 'js/bundle.js'
}

//browser reload
gulp.task('reload', function(){
	browserSync.reload();
});

gulp.task('browserSync', function() {
    browserSync({
    	//if php server, change proxy to path to your src folder included in localhost & comment server
    	//proxy:'127.0.0.1',
     	//port:8080
        server: config.src
    });
});

gulp.task('phpserv', function(){
    connectPHP.server({ base: config.src, keepalive:true, hostname: 'localhost', port:8080, open: false});
});

gulp.task('watchmen', function(){
	//control changes in files
	gulp.watch(config.htmlin, ['reload']);
	gulp.watch(config.jsin, ['reload']);
	gulp.watch(config.phpin, ['reload']);
	gulp.watch(config.scssin, ['sass']);
})

//sass configuration
gulp.task('sass', function(){
	//get all files from folder
	return gulp.src(config.scssin)
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer({
			//browser compatibility
			browsers: ['last 3 versions']
		}))
		//file output
		.pipe(gulp.dest(config.scssout))
		.pipe(browserSync.stream())
});

gulp.task('css', function(){
	return gulp.src(config.cssin)
		//concat files
		.pipe(concat(config.cssoutname))
		//minify
		.pipe(cleanCSS())
		//save
		.pipe(gulp.dest(config.cssout))
});

gulp.task('js', function(){
	return gulp.src(config.jsin)
		//concat files
		.pipe(concat(config.jsoutname))
		//minify
		.pipe(cleanJS())
		//save
		.pipe(gulp.dest(config.jsout))
});

gulp.task('img', function(){
	//minify specific files
	return gulp.src(config.imgin)
		//change only new files
		.pipe(changed(config.imgout))
		//minify
		.pipe(imgmin())
		//save
		.pipe(gulp.dest(config.imgout))
});

gulp.task('html', function(){
	return gulp.src(config.htmlin)
		//change file path in source html
		//important! Set a proper key in .html: <!-- build:key --> your stuff here <!-- endbuild -->
		.pipe(htmlReplace({
			'css': config.cssreplaceout,
			'js': config.jsreplaceout
		}))
		.pipe(cleanHTML({
			//sort alphabetical, better optimization
			sortAttributes: true,
			sortClassName: true,
			//delete whitespace
			collapseWhitespace: true
		}))
		//save
		.pipe(gulp.dest(config.dist))
});

gulp.task('php', function(){
	return gulp.src(config.phpin)
		//change file path in source php
		//important! Set a proper key in .php: <!-- build:key --> your stuff here <!-- endbuild -->
		.pipe(htmlReplace({
			'css': config.cssreplaceout,
			'js': config.jsreplaceout
		}))
		.pipe(cleanHTML({
			//sort alphabetical, better optimization
			sortAttributes: true,
			sortClassName: true,
			//delete whitespace
			collapseWhitespace: true
		}))
		//save
		.pipe(gulp.dest(config.dist))
});

gulp.task('clean', function(){
	//delete previous build
	return del([config.dist]);
});


gulp.task('build', function(){
	//build in order
	sequence('clean', ['html', 'php', 'js', 'css', 'img']);
});

//default function
//if using PHP add 'phpserv'
gulp.task('default', ['browserSync', 'watchmen']);