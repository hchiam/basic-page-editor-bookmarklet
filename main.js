import "./style.css";

import { turnIntoBookmarklet } from "./to_bookmarklet";

const jsFileUrl = document.querySelector(
  'script[src*="bookmarklet_before"]'
).src;

fetch(jsFileUrl)
  .then(function (x) {
    return x.text();
  })
  .then(function (code) {
    let bookmarklet_code = turnIntoBookmarklet(code);
    console.log(bookmarklet_code);
    document.querySelector("#bookmarklet_code").innerText = bookmarklet_code;
  });
