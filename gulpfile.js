const gulp          = require('gulp');
const sass          = require('gulp-sass');
const autoprefixer  = require('gulp-autoprefixer');
const rename        = require('gulp-rename');
const replace       = require('gulp-replace');
const postcss       = require('gulp-postcss');
const cssnano       = require('gulp-cssnano');

const concat = require('gulp-concat-util');
const criticalCss = require('gulp-penthouse');

// Critical
gulp.task('critical-css', function () {
    return gulp.src('./assets/tailwind.min.css')
    .pipe(criticalCss({
        out: 'critical.css', // output file name
        url: 'http://127.0.0.1:9292', // url from where we want penthouse to extract critical styles
        width: 1400,
        height: 900,
        // userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' // pretend to be googlebot when grabbing critical page styles.
    }))
    .pipe(cssnano())
    // .pipe(gulp.dest("./assets/"))
    .pipe(rename("critical.min.css"))
    .pipe(gulp.dest("./assets"))
});

gulp.task('inline-critical', function () {
    return gulp.src('./assets/critical.min.css')
    .pipe(concat.header('<style>'))
    .pipe(concat.footer('</style>'))
    // convert it to an include file
    .pipe(
        rename({
            basename: 'critical',
            extname: '.liquid'
        })
    )
    // insert file in the includes folder
    .pipe(gulp.dest('./snippets'))
});

gulp.task('tailwind', function () {
    const tailwindcss   = require('tailwindcss');

    return gulp.src('./styles/tailwind.scss')
        .pipe(
            sass().on('error', sass.logError)
        )
        .pipe(postcss([
            tailwindcss('./tailwind.config.js'),
            require('autoprefixer')
        ]))
        .pipe(cssnano())
        .pipe(
            rename(function(path) {
                path.extname = '.min.css';
            })
        )
        .pipe(gulp.dest('./assets'));
});

gulp.task('sass-compile', function() {
    return gulp
    .src(['./styles/*.scss', '!./styles/tailwind.scss'])
    .pipe(
        sass({
        // Values: nested, expanded, compact, compressed
        outputStyle: 'compressed'
        }).on('error', sass.logError)
    )
    .pipe(
        autoprefixer({
            cascade: false
        })
    )
    .pipe(
        rename(function(path) {
            path.basename = path.basename.replace(/\.scss/gi, '');
            path.extname = '.min.css';
        })
    )
    .pipe(gulp.dest('./assets'));
});

//watch command for `js` and `style`
gulp.task('styles', function() {
    gulp.watch(['./styles/*.scss', '!./styles/tailwind.scss'], gulp.series('sass-compile'));
    gulp.watch(['./styles/tailwind.scss'], gulp.series('tailwind', 'critical-css', 'inline-critical'));
});

gulp.task('default', gulp.parallel('styles'));