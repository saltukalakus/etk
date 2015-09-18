var gulp = require('gulp');
var jshint = require('gulp-jshint');
var browserify = require('gulp-browserify');
var shell = require('gulp-shell');
var replace = require('gulp-replace');

gulp.task('jshint', function () {
    gulp.src('./*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// Browserify
gulp.task('jsbuild', function() {
    gulp.src('.index.js')
        .pipe(browserify({
            insertGlobals : true,
            debug : !gulp.env.production
        }))
        .pipe(gulp.dest('./public/build'))
});

// Document the API
gulp.task('api_document', shell.task([
    'cp ./confs/jsdoc/jsdoc-conf.json ./node_modules/jsdoc/conf.json',
    './node_modules/jsdoc/jsdoc.js index.js \
     -t ./node_modules/ink-docstrap/template \
     -c ./node_modules/jsdoc/conf.json'
]));

gulp.task('annotate_document', shell.task([
    './node_modules/docco/bin/docco index.js'
]));

// Document api web site patches
gulp.task('patch_api_document', ['api_document'], function(){
    gulp.src(['out/global.html'])
        .pipe(replace("</body>\n</html>",
            "<style> .type-signature { font-size:50px;} .page-title {display: none;}</style>" +
            "<script type='text/javascript' src='scripts/jquery-watch-element.js'></script>" +
            "<script>$( document ).ready(function(){$('.toc-h1').waitUntilExists(" +
                "function(){$('.toc-h1').hide(); " +
                "$('.toc-h2').hide()}, " +
                "false, true);});" +
            "</script>" +
            "</body>\n</html>"))
        .pipe(gulp.dest('out'));
});

gulp.task('patch_files_copy', ['api_document'], shell.task([
    'cp ./confs/jsdoc/jquery-watch-element.js ./out/scripts'
]));

gulp.task('document', ['annotate_document', 'patch_api_document', 'patch_files_copy']);

gulp.task('watch', function () {
    gulp.watch('./*.js', ['jshint']);
    gulp.watch('./*.js', ['jsbuild']);
});