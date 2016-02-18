/**
 * Enhanced Applications for Mazda Connect Infotainment
 * 
 * A helper to bring custom applications into the Mazda Connect Infotainment System without
 * writing custom on screen functionality.
 *
 * Written by Andreas Schwarz (http://github.com/flyandi/mazda-enhanced-applications)
 * Copyright (c) 2016. All rights reserved.
 * 
 * WARNING: The installation of this application requires modifications to your Mazda Connect system.
 * If you don't feel comfortable performing these changes, please do not attempt to install this. You might
 * be ending up with an unusuable system that requires reset by your Dealer. You were warned!
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the 
 * GNU General Public License as published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even 
 * the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public
 * License for more details.
 * 
 * You should have received a copy of the GNU General Public License along with this program. 
 * If not, see http://www.gnu.org/licenses/
 *
 */

/**
 * This is the build file for the mini framework
 */

var
    gulp = require('gulp'),
    less = require('gulp-less'),
    concat = require('gulp-concat'),
    runSequence = require('run-sequence');

/**
 * ::configuration
 */

var jsPath = [
    'js/*'
];

var lessPath = [
    'less/*'
];

var output = "../system/runtime/";


/**
 * ::tasks
 */


// (less)
gulp.task('dist-less', function () {

    return gulp.src(lessPath)
        .pipe(concat('bootstrap.css'))
        .pipe(less())
        .pipe(gulp.dest(output));
});


// (Concatenate & Minify)
gulp.task('dist-js', function () {

    return gulp.src(jsPath)
        .pipe(concat('bootstrap.js'))
        .pipe(gulp.dest(output));
});


/** 
 * ::Commands
 */


// Default Task
gulp.task('default', function (callback) {

    runSequence(
        'dist-js',
        'dist-less',
        callback
    );

});