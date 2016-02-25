/**
 * Custom Application SDK for Mazda Connect Infotainment System
 * 
 * A micro framework that allows to write custom applications for the Mazda Connect Infotainment System
 * that includes an easy to use abstraction layer to the JCI system.
 *
 * Written by Andreas Schwarz (http://github.com/flyandi/mazda-custom-applications-sdk)
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
 * This is the build file for the micro framework
 */

var
    gulp = require('gulp'),
    less = require('gulp-less'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    concatutil = require('gulp-concat-util'),
    runSequence = require('run-sequence'),
    del = require('del'),
    fs = require('fs'),
    glob = require('glob'),
    exec = require('child_process').exec;

/**
 * ::package
 */

var package = require('./package.json');

/**
 * ::configuration
 */

var output = "./build/",
    input = "./src/";


/**
 * (build) local apps
 *
 * These tasks handle the copy and build of the local apps
 */

var appsPathInput = "./apps/",
    appsPathOutput = output + 'apps/system/casdk/apps/';


// (cleanup)
gulp.task('apps-cleanup', function () {  
    return del(
        [appsPathOutput + '**/*']
    );
});

// (copy)
gulp.task('apps-copy', function () {  

    return gulp.src(appsPathInput + "**/*", {base: appsPathInput})
        .pipe(gulp.dest(appsPathOutput));
});

// (register)
gulp.task('apps-register', function() {
    return;
});

// (build)
gulp.task('build-apps', function(callback) {
    runSequence(    
        'apps-cleanup',
        'apps-copy',
        'apps-register',
        callback
    );
}); 


/**
 * (build) runtime system
 *
 * These task builds the run time system for the micro framework
 */

var runtimePathInput =  input + "runtime/",
    runtimePathOutput = output + "runtime/";

// (cleanup)
gulp.task('runtime-cleanup', function () {  
    return del(
        [runtimePathOutput + '**/*']
    );
});

// (skeleton)
gulp.task('runtime-skeleton', function() {

    return gulp.src(runtimePathInput + "skeleton/**/*", {base: runtimePathInput + "skeleton"})
        .pipe(gulp.dest(runtimePathOutput));
});


// (less)
gulp.task('runtime-less', function () {

    return gulp.src(runtimePathInput + "less/*", {base: runtimePathInput + "less"})
        .pipe(concat('runtime.css'))
        .pipe(less())
        .pipe(gulp.dest(runtimePathOutput));
});


// (Concatenate & Minify)
gulp.task('runtime-js', function () {

    return gulp.src(runtimePathInput + "js/*", {base: runtimePathInput + "js"})
        .pipe(concat('runtime.js'))
        //.pipe(uglify())
        .pipe(concatutil.header(fs.readFileSync(runtimePathInput + "resources/header.txt", "utf8"), { pkg : package} ))
        .pipe(gulp.dest(runtimePathOutput));
});

// (build)
gulp.task('build-runtime', function(callback) {
    runSequence(    
        'runtime-cleanup',
        'runtime-skeleton',
        'runtime-less',
        'runtime-js',
        callback
    );
}); 


/**
 * (build) install deploy image
 *
 * These task builds the install image
 */


var installDeployPathInput =  input + 'deploy/install/',
    installDeployPathOutput = output + 'deploy/install/',
    installDeployDataPathOutput = installDeployPathOutput + 'casdk/';

// (cleanup)
gulp.task('install-cleanup', function () {  
    return del(
        [installDeployPathOutput + '**/*']
    );
});

// (copy)
gulp.task('install-copy', function() {

    return gulp.src(installDeployPathInput + "**/*", {base: installDeployPathInput})
        .pipe(gulp.dest(installDeployPathOutput));
});

// (custom)
gulp.task('install-custom', function() {

    return gulp.src(input + "custom/**/*", {base: input + "custom"})
        .pipe(gulp.dest(installDeployDataPathOutput + "custom/"));
});


// (proxy)
gulp.task('install-proxy', function() {

    return gulp.src(input + "proxy/**/*", {base: input + "proxy"})
        .pipe(gulp.dest(installDeployDataPathOutput + "proxy/"));
});



// (build)
gulp.task('build-install', function(callback) {
    runSequence(    
        'install-cleanup',
        'install-copy',
        'install-custom',
        'install-proxy',
        callback
    );
}); 


/**
 * (build) builds the actual sd card content
 *
 */

var SDCardPathOutput = output + 'sdcard/applications/';

// (cleanup)
gulp.task('sdcard-cleanup', function () {  
    return del(
        [SDCardPathOutput + '**/*']
    );
});

// (copy)
gulp.task('sdcard-copy', function() {
    gulp.src(runtimePathOutput + "**/*", {base: runtimePathOutput})
        .pipe(gulp.dest(SDCardPathOutput + 'runtime'));

    return gulp.src("apps/**/*", {base: "apps/"})
        .pipe(gulp.dest(SDCardPathOutput + 'apps'));
});

// (build)
gulp.task('build-sdcard', function(callback) {
    runSequence(    
        'sdcard-cleanup',
        'sdcard-copy',
        callback
    );
}); 

/** 
 * Common Commands
 */

// clean
gulp.task('clean', function () {  
    return del(
        [output + '**/*']
    );
});

// Default Task
gulp.task('default', function (callback) {
    runSequence(    
        'clean',
        'build-runtime',
        'build-install',
        'build-sdcard',
        callback
    );
    

});