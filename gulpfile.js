var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var proxy = require('http-proxy-middleware');

gulp.task('prod', function () {
  browserSync.init({
    server: {
      baseDir: ['./dist'],
      middleware: proxy('/api', {
        target: '//match.aimer.ai',
        changeOrigin: true,
      })
    },
  });
});
