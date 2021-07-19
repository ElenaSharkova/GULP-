// 1. Препроцессоры делают конверт автоматически в css. Настрйока gulp-scss 
const {src, dest, watch, parallel, series } = require('gulp');

const scss         = require('gulp-sass')(require('sass'));
const concat       = require('gulp-concat'); // Поключили плагин для переименовки файлов css в min css, если бы файлов было несколько на переименование, он бы сразу переименовывал все
const browserSync  = require('browser-sync').create(); // Подключение плагина для автоматического обнавления страницы в браузере после изменения какого-либо файла проекта
const uglify       = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const imagemin     = require('gulp-imagemin');
const del         = require('del');

function browsersync(){
     browserSync.init({
         server : {
             baseDir: 'app/'
         }
     })
}

function cleanDist() {
    return del('dist')
}

function images() {
    return src('app/images/**/*')
    .pipe(imagemin(
        [
    imagemin.gifsicle({interlaced: true}),
    imagemin.mozjpeg({quality: 75, progressive: true}),
    imagemin.optipng({optimizationLevel: 5}),
    imagemin.svgo({
        plugins: [
            {removeViewBox: true},
            {cleanupIDs: false}
        ]
    })
]
    ))
    .pipe(dest('dist/images'))
}


function scripts() {
    return src([
        'node_modules/jquery/dist/jquery.js',
        'app/js/main.js'
    ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream())
}

function styles() {
    return src('app/scss/style.scss')
    
//Переносится в css красиво
  //.pipe(scss({outputStyle: 'expanded'}))
  //.pipe(dest('app/css')) 
    
    
    
//Переносится в css с максимальным сжатием и переименованием
  .pipe(scss({outputStyle: 'compressed'}))
  .pipe(concat('style.min.css'))
  .pipe(autoprefixer({
        overrideBrowserslist: ['last 10 version'], //Отслеживание на 10 последних версий браузера
        grid: true
    }))
  .pipe(dest('app/css')) 
  .pipe(browserSync.stream())
}

function build() {
    return src([
        'app/css/style.min.css',
        'app/fonts/**/*',
        'app/js/main.min.js',
        'app/*.html'
    ], {base: 'app'})
     .pipe(dest('dist'))
}


// 2. Автоматическое слежение за проектом
// Прописали дополнительно в самую верхнюю строку watch: const {..., ..., watch } = require('gulp');
// Для выхода из этого процесса после его запуска в терминале нажать ctrl + C
function watching(){
    watch(['app/scss/**/*.scss'], styles);
    watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
    watch(['app/*.html']).on('change', browserSync.reload)
}









exports.styles = styles; //Вот эта строка всегда самая последняя: она запускает всю сборку gulp
exports.watching = watching;
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.images = images;
exports.cleanDist = cleanDist;

exports.build = series(cleanDist, images, build);
exports.default = parallel(styles, scripts, browsersync, watching); // Одновременно будут работать два плагина
