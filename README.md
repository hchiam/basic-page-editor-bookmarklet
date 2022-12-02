# basic-page-editor-bookmarklet

Notes on what a bookmarklet is, and examples, can be found at: https://github.com/hchiam/learning-js/tree/main/bookmarklets#bookmarklets

```sh
yarn; yarn dev
# http://localhost:3000/
```

## JS

```js
fetch(
  "https://raw.githubusercontent.com/hchiam/basic-page-editor-bookmarklet/main/basic-page-editor.js"
).then((response) =>
  response.text().then((code) => {
    $("head").append(`<script>${code}</script>`);
  })
);
```

## Bookmarklet

```js
javascript:(function(){
fetch(
  %22https:%2F%2Fraw.githubusercontent.com%2Fhchiam%2Fbasic-page-editor-bookmarklet%2Fmain%2Fbasic-page-editor.js%22
).then((response) =>
  response.text().then((code) => {
    $(%22head%22).append(`<script>${code}<%2Fscript>`);
  })
);

})();
```
