fetch(
  "https://raw.githubusercontent.com/hchiam/basic-page-editor-bookmarklet/main/basic-page-editor.js"
).then((response) =>
  response.text().then((code) => {
    $("head").append(`<script>${code}</script>`);
  })
);
