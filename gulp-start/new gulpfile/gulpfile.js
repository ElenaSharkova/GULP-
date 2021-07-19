// Все комманды из npm - менеджер пакетов
// 1. Препроцессоры делают конверт автоматически в css. Настрйока gulp-scss 
const {src, dest, watch, parallel, series } = require('gulp');

const scss         = require('gulp-sass')(require('sass')); // Плагин препроцессора
const concat       = require('gulp-concat'); // Поключили плагин для переименовки файлов css в min css, если бы файлов было несколько на переименование, он бы сразу переименовывал все. Все файлы в один, объединяет как css так и js.
const browserSync  = require('browser-sync').create(); // Подключение плагина для автоматического обнавления страницы в браузере после изменения какого-либо файла проекта
const uglify       = require('gulp-uglify-es').default; // Подключаем плагин для сжатия js делалаи через jquery.
const autoprefixer = require('gulp-autoprefixer'); // Совместимость со всеми браузерами на 10 версий назад в том числе адекват в гридах
const imagemin     = require('gulp-imagemin'); // сжатие и перенос картинок
const del          = require('del'); // чистит dist автоматически, чтобы не было лишних файлов

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









exports.styles = styles; 
exports.watching = watching;
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.images = images;
exports.cleanDist = cleanDist;

exports.build = series(cleanDist, images, build);
exports.default = parallel(styles, scripts, browsersync, watching); // Одновременно будут работать все эти плагины, достаточно набрать в консоле gulp
