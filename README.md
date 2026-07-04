<p align="center">
  <img src="https://img.shields.io/github/stars/SteeaaN/ZnaniumDownloader?label=%D0%97%D0%B2%D0%B5%D0%B7%D0%B4%D1%8B&color=yellow"> <img src="https://img.shields.io/github/last-commit/SteeaaN/ZnaniumDownloader?label=%D0%9E%D0%B1%D0%BD%D0%BE%D0%B2%D0%BB%D0%B5%D0%BD%D0%BE&color=blue"> <img src="https://img.shields.io/github/repo-size/SteeaaN/ZnaniumDownloader?label=%D0%92%D0%B5%D1%81&color=orange"> <img src="https://img.shields.io/github/license/SteeaaN/ZnaniumDownloader?label=%D0%9B%D0%B8%D1%86%D0%B5%D0%BD%D0%B7%D0%B8%D1%8F&color=blue">
  <br><br>
  <a href="https://chromewebstore.google.com/detail/nbeacgfllenjcnlliihklggcmamoenmn"><img src="https://img.shields.io/chrome-web-store/users/nbeacgfllenjcnlliihklggcmamoenmn?label=%D0%A3%D1%81%D1%82%D0%B0%D0%BD%D0%BE%D0%B2%D0%BA%D0%B8&color=success" alt="Установки"></a> <a href="https://chromewebstore.google.com/detail/nbeacgfllenjcnlliihklggcmamoenmn"><img src="https://img.shields.io/chrome-web-store/v/nbeacgfllenjcnlliihklggcmamoenmn?label=%D0%92%D0%B5%D1%80%D1%81%D0%B8%D1%8F" alt="Версия"></a> <a href="https://chromewebstore.google.com/detail/nbeacgfllenjcnlliihklggcmamoenmn"><img src="https://img.shields.io/chrome-web-store/rating/nbeacgfllenjcnlliihklggcmamoenmn?label=%D0%A0%D0%B5%D0%B9%D1%82%D0%B8%D0%BD%D0%B3" alt="Рейтинг"></a>
</p>

> ⚠️ Расширение предназначено исключительно для личного использования и сохранения материалов, на которые у пользователя есть законные права доступа. Автор не несёт ответственности за использование расширения в целях, нарушающих законодательство об авторских правах.


## Установка (только браузеры на Chromium)

👉 **[Установить из Chrome Web Store](https://chromewebstore.google.com/detail/znanium-downloader/nbeacgfllenjcnlliihklggcmamoenmn)**

📱 **Android:** Стандартный Google Chrome не поддерживает расширения. Используйте **Kiwi Browser**, **Lemur Browser** или **Яндекс Браузер**.

🍏 **iOS:** Только Orion Browser, не тестировалось, возможны баги.

> ⭐ **Понравилось расширение?** Буду очень благодарен за оценку и небольшой текстовый отзыв в Chrome Web Store. Это невероятно помогает проекту подниматься в поиске!

<details>
<summary>⚙️ <b>Ручная установка (из исходников)</b></summary>

<br>

<details>
<summary>📱 Для мобильных устройств (Kiwi Browser и др.)</summary>

1. Скачать Source code (zip) из [последнего релиза](https://github.com/SteeaaN/ZnaniumDownloader/releases/latest)
2. Открыть браузер с поддержкой расширений Chrome (например, Kiwi Browser)
3. В меню расширений включить режим разработчика
4. Установить расширение напрямую через скачанный zip

</details>

<details>
<summary>💻 Для компьютеров (Chrome / Edge / Yandex)</summary>

1. Скачать Source code (zip) из [последнего релиза](https://github.com/SteeaaN/ZnaniumDownloader/releases/latest)
2. Разархивировать скачанный архив в удобную папку
3. Открыть браузер и перейти во вкладку **Расширения**
4. Включить режим разработчика
5. Включить опцию **Разрешить расширения из других магазинов**
6. Нажать **Загрузить распакованное** и выбрать папку с распакованным архивом

</details>

</details>



## Использование

1. Перезагрузить страницу после первой установки
2. Открыть расширение, выбрать нужный интервал страниц и формат
3. Нажать кнопку загрузки и ожидать её завершения (окно расширения можно свернуть)

> ⚠️ На мобильных устройствах после начала загрузки нужно вернуться на вкладку Знаниума с книгой и **не сворачивать её** до полного завершения загрузки.

Текстовое скачивание в формате ePub доступно только в тех книгах, где есть кнопка "txt" возле обозначения страниц. Если на главной странице книги есть оглавление, то оно добавится при скачивании. Иногда Знаниум добавляет текст только на часть страниц.

<p align="center">
  <img width="328" alt="white" src="https://github.com/user-attachments/assets/54e9778b-9031-4657-aac3-d57686ccf7b8" />
  <img width="328" alt="black" src="https://github.com/user-attachments/assets/ee4b2797-d598-4bc5-87d8-371aec407183" />
</p>


<details>
<summary>🛠 <b>Для разработчиков (сборка WASM)</b></summary>

Расшифровка SVG написана на C для повышения производительности. Исходный код находится в `/wasm_src`.

**Требования:** [Emscripten SDK](https://emscripten.org/)

**Команда сборки:**
```bash
emcc DecryptSVG.c -o ../decryptSVG.wasm -O3 --no-entry -s EXPORTED_FUNCTIONS="['_decryptSVG', '_freeMemory', '_malloc', '_free']"
