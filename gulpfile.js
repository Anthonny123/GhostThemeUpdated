const {series, watch, src, dest, parallel} = require('gulp');
//const sass = require('gulp-sass');
const concat = require('gulp-concat');
const pump = require('pump');

// gulp plugins and utils
var livereload = require('gulp-livereload');
var postcss = require('gulp-postcss');
var zip = require('gulp-zip');
var uglify = require('gulp-uglify');
var beeper = require('beeper');

// postcss plugins
var autoprefixer = require('autoprefixer');
var colorFunction = require('postcss-color-mod-function');
var cssnano = require('cssnano');
var easyimport = require('postcss-easy-import');


const sass = require('gulp-sass')(require('sass'));


const tailwind = require('tailwindcss')

function serve(done) {
    livereload.listen();
    done();
}

const handleError = (done) => {
    return function (err) {
        if (err) {
            beeper();
        }
        return done(err);
    };
};

function hbs(done) {
    pump([
        src(['*.hbs', '**/**/*.hbs', '!node_modules/**/*.hbs']),
        livereload()
    ], handleError(done));
}

function css(done) {
    var processors = [
        easyimport,
        colorFunction(),
        tailwind(),
        autoprefixer(),
        cssnano()
    ];


    pump([
        src('assets/scss/screen.scss', {sourcemaps: true}),
        sass({
            includePaths: ['./node_modules'],
         }).on('error', sass.logError),
        concat('app.min.css'),
        postcss(processors),
        dest('assets/built/', {sourcemaps: '.'}),
        livereload()
    ], handleError(done));
}

function js(done) {
    pump([
        src('assets/js/**/*.js', {sourcemaps: true}),
        concat('app.min.js'),
        uglify(),
        dest('assets/built/', {sourcemaps: '.'}),
        livereload()
    ], handleError(done));
}

function zipper(done) {
    var targetDir = 'dist/';
    var themeName = require('./package.json').name;
    var filename = themeName + '.zip';

    pump([
        src([
            '**',
            '!node_modules', '!node_modules/**',
            '!dist', '!dist/**',
            '!yarn-error.log',
            '!assets/scss/**',
            '!assets/css/**',
            '!assets/js/**',
            '!routes.yaml',
            '!tailwind.config.js'
        ]),
        zip(filename),
        dest(targetDir)
    ], handleError(done));
}

const cssWatcher = () => watch('assets/scss/**', css);
const jsWatcher = () => watch('assets/js/**', js);
const hbsWatcher = () => watch(['*.hbs', '**/**/*.hbs', '!node_modules/**/*.hbs'], hbs);
const watcher = parallel(cssWatcher, hbsWatcher, jsWatcher);
const build = series(css, js);
const dev = series(build, serve, watcher);

exports.build = build;
exports.zip = series(build, zipper);
exports.default = dev;
