const gulp		     = require('gulp');
const fs           = require('fs');
const browserSync  = require('browser-sync');
const pug		 			 = require('gulp-pug');
const cleanCss		 = require('clean-css');
const sass		 		 = require('gulp-sass');
const groupMedia	 = require('gulp-group-css-media-queries');
const autoprefixer = require('gulp-autoprefixer');
const concat 			 = require('gulp-concat');
const uglifyjs 		 = require('gulp-uglifyjs');
const rename			 = require('gulp-rename');
const imagemin		 = require('gulp-imagemin');
const pngquant		 = require('imagemin-pngquant');
const del		 			 = require('del');
const plumber 		 = require('gulp-plumber');


var paths = {
  dirs: {
    build: './build'
  },
  html: {
    blocks: './src/blocks/',
    src: './src/pages/*.pug',
    dest: './build',
    watch: ['./src/pages/*.pug', './src/templates/*.pug', './src/blocks/**/*.pug']
  },
  css: {
    src: ['./src/styles/style.sass' ],
    dest: './build/css',
    watch: ['./src/blocks/**/*.sass', './src/styles/**/*.sass', './src/styles/*.sass']
  },
  js: {
    src: ['./node_modules/jquery/dist/jquery.min.js', './src/libs/*.js', './src/blocks/**/*.js'],
    dest: './build/js',
    watch: './src/blocks/**/*.js',
    watchPlugins: './src/scripts/libs/*.js'
  },
  images: {
    src: './src/blocks/**/img/*',
    dest: './build/img',
    watch: ['./src/blocks/**/img/*']
  },
  fonts: {
    src: './src/fonts/**/*',
    dest: './build/fonts',
    watch: './src/fonts/**/*'
  }
};

gulp.task('clean', function () {
  return del(paths.dirs.build);
});

gulp.task('templates', function () {
  return gulp.src(paths.html.src)
    .pipe(plumber())
    .pipe(pug({
      pretty: true
    }))
    .pipe(gulp.dest(paths.html.dest))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('styles', function () {
  return gulp.src(paths.css.src)
    .pipe(plumber())
    .pipe(sass())
    .pipe(groupMedia())
    .pipe(autoprefixer({
      browsers: ['last 20 versions']
    }))
    .pipe(gulp.dest(paths.css.dest))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('scripts', function () {
  return gulp.src(paths.js.src)
    .pipe(plumber())
    .pipe(concat('scripts.js'))
    .pipe(gulp.dest(paths.js.dest));
});

gulp.task('images', function () {
  return gulp.src(paths.images.src)
    .pipe(plumber())
    .pipe(imagemin())
    .pipe(rename({
      dirname: ''
    }))
    .pipe(gulp.dest(paths.images.dest));
});

gulp.task('fonts', function () {
  return gulp.src(paths.fonts.src)
    .pipe(plumber())
    .pipe(gulp.dest(paths.fonts.dest))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('server', function () {
  browserSync.init({
    server: {
      baseDir: paths.dirs.build
    },
    reloadOnRestart: true,
    // tunnel: 'my-project-name'
  });

  const allBlocks = paths.html.blocks;
  gulp.watch(allBlocks).on('addDir', function() {
    let dirs = fs.readdirSync(allBlocks);
    for(i = 0; i < dirs.length;i++){
      if(fs.existsSync(allBlocks+'/'+dirs[i]+'/'+dirs[i]+'.pug') === false && fs.existsSync(allBlocks+'/'+dirs[i]+'/'+dirs[i]+'.sass') === false && fs.existsSync(allBlocks+'/'+dirs[i]+'/'+dirs[i]+'.js') === false){
        fs.appendFileSync(allBlocks+'/'+dirs[i]+'/'+dirs[i]+'.pug', '//'+dirs[i]);
        fs.appendFileSync(allBlocks+'/'+dirs[i]+'/'+dirs[i]+'.js', '//'+dirs[i]);
        fs.appendFileSync(allBlocks+'/'+dirs[i]+'/'+dirs[i]+'.sass', '//'+dirs[i]);
      }
      try {
        fs.statSync(allBlocks+'/'+dirs[i]+'/img');
      }
      catch (err) {
        if (err.code === 'ENOENT') {
          fs.mkdirSync(allBlocks+'/'+dirs[i]+'/img');
          console.log('Папка img добавлена в директорию' + ' — ' + dirs[i]);
        }
      }
    }
  });

  gulp.watch(paths.html.watch, gulp.parallel('templates'));
  gulp.watch(paths.css.watch, gulp.parallel('styles'));
  gulp.watch(paths.js.watch, gulp.parallel('scripts'));
  gulp.watch(paths.js.watchPlugins, gulp.parallel('scripts'));
  gulp.watch(paths.images.watch, gulp.parallel('images'));
  gulp.watch(paths.fonts.watch, gulp.parallel('fonts'));
});


gulp.task('build', gulp.series(
  'clean',
  'templates',
  'styles',
  'scripts',
  'images',
  'fonts'
));

gulp.task('dev', gulp.series(
  'build', 'server'
));