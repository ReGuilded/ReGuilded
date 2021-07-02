const gulp = require('gulp')
const babel = require('gulp-babel')

gulp.task('build', async cb => {
    // Compiles all JS files to JS ES5
    gulp.src(['./**/*.js', '!./node_modules/**/*.js', '!./src/**/*.js', '!./gulpfile.js'])
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(gulp.dest('./src'))
    // Add all JSON and CSS files to the src directory
    gulp.src(['./**/*.json', './**/*.css'])
        .pipe(gulp.dest('./src'))
})