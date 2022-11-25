export function turnIntoBookmarklet(code) {
  code = detectOneLineComments(code);
  code = encodePercent(code);
  code = encodeSlash(code);
  code = encodeDoubleQuote(code);
  code = wrapInJavascriptIIFE(code);
  return code;
}

function wrapInJavascriptIIFE(code) {
  return `javascript:(function(){\n${code}\n})();`;
}
function encodePercent(code) {
  return code.replaceAll("%", "%25");
}
function encodeDoubleQuote(code) {
  return code.replaceAll('"', "%22");
}
function encodeSlash(code) {
  return code.replaceAll("/", "%2F");
}
function detectOneLineComments(code) {
  if (/(\/\/|\/\*).*?(\n|$)/g.exec(code)) {
    alert(
      "There might be a comment in the code. Remove comments before pasting."
    );
  }
  return code;
}
