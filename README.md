# gulp-quick-start

# Особенности:
* используется препроцессор [SCSS](https://sass-lang.com/)
* используется CSS-сетка [smart-grid](https://github.com/dmitry-lavrik/smart-grid) на основе Bootstrap для быстрой адаптивной вёрстки
* используется [normalize.css](https://github.com/necolas/normalize.css/)
* используется [gulp-htmlhint](https://github.com/bezoerb/gulp-htmlhint)
* используются настройки проверки HTML по [актуальному кодгайду](https://github.com/htmlacademy/codeguide/blob/master/.htmlhintrc) от HTML Academy, ссылка на страницу плагина [htmlhint-htmlacademy](https://github.com/efiand/htmlhint-htmlacademy)
* используется валидатор HTML [gulp-w3c-html-validator](https://www.npmjs.com/package/gulp-w3c-html-validator).
* используется [imagemin](https://www.npmjs.com/package/gulp-imagemin) и [image-resize](https://www.npmjs.com/package/gulp-image-resize) для сжатия изображений.

# Установка
* установите [NodeJS](https://nodejs.org/en/)
* установите сборку с помощью: [Git](https://git-scm.com/downloads): ```git clone https://github.com/Ko2doo/gulp-pack.git```
* установите ```gulp``` глобально: ```npm i --global gulp-cli```
* после установке необходимого, перейдите в папку со скачанным проектом
* скачайте необходимые зависимости введя в терминал команду: ```npm i```
* для запуска проекта введите в терминале: ```gulp``` (режим разработки)
* для сборки проекта введите в терминале: ```gulp build``` (режим сборки)

! Если всё этапы пройдены верно, должен открыться браузер с запущенным локальным сервером.

# Файловая структура:
```txt
gulp-pack
|--core
|   |-- app
|   |   |-- css
|   |   |-- fonts
|   |   |-- imgStock
|   |   |-- img
|   |   |-- js
|   |       |-- libs
|   |       |-- main
|   |   |-- scss
|   |       |-- blocks
|   |       |-- stylesheets
|   |       |-- libs
|   |
|   |---  .babelrc
|   |---  .editorconfig
|   |---  .prettierignore
|   |---  .prettierrc
|   |---  gulpfile.js
|   |---  LICENSE
|   |---  package-lock.json
|   |---  package.json
|
|--- .gitignore
|---  readme.md
```
* Папка ```core``` - корневая папка разработки.

* Папка ```app``` - используется во время разработки:
    * шрифты: ```app/fonts```
    * исходные изображения: ```app/imgStock```
    * отредактированные изображения: ```app/img```
    * JS-файлы: ```app/js```
    * JS-библеотеки: ```app/js/libs```
    * JS-пользовательские: ```app/js/main```
    * страница сайта: ```app/index.html```
    * SCSS-файлы: ```app/scss```

# Команды
* ```gulp``` - запуск сервера для разработки проекта(вся работа происходит внутри папки ```app```).
* ```gulp build``` - собрать проект с оптимизацией без запуска сервера(собирает все необходимые файлы за папку ```core``` в кореневую директорию.

# Сторонние библиотеки
* все сторонние библиотеки стилей и скриптов желательно подключать через CDN серверы в теге <link> в главный html файл!
* Также стилевые библеотеки подключаються через папку ```app/scss/libs```, JS-библиотеки через папку ```app/js/libs```.

Либо:

* все сторонние библиотеки устанавливаются в папку ```node_modules```
    * для их загрузки воспользуйтеcь командой ```npm i package_name```
    * установка (пакеты необходимые для разработки) devDependencies ```npm i package_name --save-dev```
    * установка (пакеты от которых зависит проект) dependencies ```npm i package_name --save```
    * для подключения в проект нужно отредактировать gulpfile.js в тех тасках, в которых подключаются необходимые пакеты, например если это файлы стилей то в таске css-lib в массив подключаемых файлов добавить путь до скачанной библиотеки, тоже самое и для js библиотек, но вместо массива там используется подключение файлов с помощью плагина gulp-add-src т.е. выглядит это следующим образом:
		```js
		.pipe(addsrc.append('node_modules/указываем_путь_до_файла))
		```
# Работа с изображениями
Все стоковые изображения хранить в папке ```app/imgStock``` иконки сайта(favicon) в папке ```app/imgStock/favicons```. Эти папки отслеживаються и при запущеном сервере и добавлении новых файлов автоматически запускаеться таск по обработке файлов которые помещаються в папку ```app/img``` для дальнейшего их использования на странице

# Немного о скриптах
В сборке используеться babel, так же все скрипты автоматически минимицируються и склеиваютсься в один файл (index.min.js) для подключения в html файл.

Все "рукписные" скрипты можно записывать в отдельные файлы в папке ```app/js/main```, после создания нового скрипт-файла нужно опрекратить работу сервера, добавить путь к скрипт-файлу в массив ```gulp.src([])```, если важен порядок подключения, в gulpfile.js:
		```js
		gulp.task('scriptMain', function() {
  		return gulp
        	       .src(['app/js/main/**'])
		```
Либо оставить как есть.

Все библеотеки и плагины скриптов можно записывать в отдельные файлы в папке ```app/js/libs```, после добавления нового скрипт-файла нужно опрекратить работу сервера, добавить путь к скрипт-файлу в массив ```gulp.src([])```, если важен порядок подключения, в gulpfile.js:
		```js
		gulp.task('scriptLib', function() {
  		return gulp
 	               .src('app/js/libs/**')
		```
Либо оставить как есть.

# Немного о CSS-сетке smart-grid
В сборщик включена CSS-сетка [smart-grid](https://github.com/dmitry-lavrik/smart-grid) от [Дмитрия Лаврика](https://dmitrylavrik.ru/). Она позволяет избавиться от
лишних классов в разметке за счёт использования примесей в SCSS и ускоряет адаптивную вёрстку. Конфигурация уже настроена в соответствии с сеткой [Bootstrap](https://getbootstrap.com/). За улучшение сетки спасибо [Алексеевичу](https://github.com/andreyalexeich)

P.S. Полезный ресурс [smart-grid](https://grid4web.ru/)
Пример использования:

**SCSS**
```scss
.items{
    @include row-flex();
    @include md(justify-content, center);

    .item{
        @include col();
        @include size(3);
        @include size-md(5);
        @include size-xs(10);
    }
}
```
**Результат**
```css
.items {
    display: flex;
    flex-wrap: wrap;
    margin-left: -15px;
    margin-right: -15px;
}
.items .item {
    box-sizing: border-box;
    margin-left: 15px;
    margin-right: 15px;
    word-wrap: break-word;
    width: calc(100% / 12 * 3 - 30px);
}
@media screen and (max-width: 992px) {
    .items {
        justify-content: center;
    }
    .items .item {
        width: calc(100% / 12 * 5 - 30px);
    }
}
@media screen and (max-width: 576px) {
    .items .item {
        width: calc(100% / 12 * 10 - 30px);
    }
}
```

# Что внутри папки stylesheets?
* Предпологается что все глобальные стили будут храниться в этой папке, изначально она уже не пуста в ней содержится несколько полезных миксинов, сетка смарт-грид, файл reset.scss содержит сбросы некоторых стандартных стилей.
* в файле helpers.scss находятся полезные миксины и функции пример их использования:

* функции ```em($px)```, ```rem($px)``` переводят пиксели в em или rem:
**SCSS**
```scss
.header{
	padding: rem(30) 0 rem(25);
}
```
**Результат**
```css
.header{
	padding: 1.875rem 0 1.5625rem;
}
```
:Внимание!: тоже самое и с функцией em()

* миксин ```font($size, $weight)```
**SCSS**
```scss
.header{

	& > p:first-child{
		@include font(em(14), 600);
		text-align: center;
	}
}
```
**Результат**
```css
.header > p:first-child {
  font-size: 0.875em;
  font-weight: 600;
  text-align: center;
}
```

# Подключение scss файлов для страниц:
* в папке scss находится файл: main.scss
* в папке stylesheets храним глобальные стили и настройки
* в папке libs храним плагины и библиотеки стилей
* в папке blocks храним стили секций сайта, подключаем секции в файле main.scss
