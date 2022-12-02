const scope = $("#app");

const editorClass = "basic-page-editor-bookmarklet";
const flagClass = "basic-page-editor-bookmarklet-flag";
const buttonClass = "basic-page-editor-bookmarklet-button";
const noteClass = "basic-page-editor-bookmarklet-note";
const saveClass = "basic-page-editor-bookmarklet-save";

const tempElOutlineValue = "1px solid maroon";
const tempElOutline = `outline:${tempElOutlineValue};`;

let hitSave = false;

removeTempElements();
initializeTempElements();
addSaveHtmlFileButton();
setTimeout(() => {
  remindUser();
}, 3 * 60_000);
let resizeTimer = null;
$(window).on("resize", function () {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    flagIds();
  }, 200);
});

function removeTempElements() {
  scope.find(`.${editorClass}`).remove();
  scope.find("[contenteditable]").removeAttr("contenteditable");
  scope.find(".row").removeAttr("style");
}

function initializeTempElements() {
  makeTextNodesTextEditable();
  flagIds();
  addRowsControls();
}

function makeTextNodesTextEditable() {
  const textNodes = scope
    .find(`:visible:not(iframe):not(script):not(.${editorClass})`)
    .contents()
    .filter(function () {
      return this.nodeValue?.trim();
    });
  const textNodeElements = textNodes.parent();
  textNodeElements.each(function () {
    const el = $(this);
    el.attr("contenteditable", "true");

    let originalText = el.html();
    const originalStyle = el.attr("style");
    el.off("blur.editor keyup.editor").on("blur.editor keyup.editor", () => {
      const changed = originalText !== el.html();
      el.css("background", changed ? "pink" : "");
      el.css("color", changed ? "maroon" : "");
      if (!changed) {
        if (originalStyle) {
          el.attr("style", originalStyle);
        } else {
          el.removeAttr("style");
        }
      }
    });
  });
  $("body").append(
    $(`<style class="${editorClass}">
        [contenteditable] {
          cursor: text;
          transition: background 0.2s, color 0.2s;
        }
        [contenteditable]:hover {
          background: red;
          color: white;
          outline: solid red;
        }
      </style>`)
  );
}

function flagIds() {
  $(`.${flagClass}`).remove();
  setTimeout(actuallyAddFlagIds, 1000);
  function actuallyAddFlagIds() {
    scope.find("[id]").each(function () {
      const el = $(this);
      const { top, left } = el.offset();
      const isHidden = !el.is(":visible") || el.closest(".hidden").length > 0;
      const id = el.attr("id");
      const flag = isHidden
        ? $(
            `<small class="${editorClass} ${flagClass}">
              ${id} (hidden)
            </small>`
          )
        : $(
            `<div class="${editorClass} ${flagClass}">
              ${id}
            </div>`
          );
      flag.css({
        position: "absolute",
        top: `calc(${Math.round(top)}px - 0.5rem)`,
        left: `calc(${Math.round(left)}px - 0.5rem)`,
        background: isHidden ? "#d3d3d38c" : "pink",
        color: isHidden ? "black" : "maroon",
        padding: isHidden ? "0.25rem" : "0.5rem",
        outline: tempElOutlineValue,
      });
      el.off("mouseover.flag")
        .on("mouseover.flag", () => {
          flag.hide();
        })
        .off("mouseleave.flag")
        .on("mouseleave.flag", () => {
          flag.show();
        });
      $("body").append(flag);
      flag
        .off("mouseover.flag")
        .on("mouseover.flag", () => {
          flag.hide();
          console.log("should hide");
        })
        .off("mouseleave.flag")
        .on("mouseleave.flag", () => {
          setTimeout(() => {
            flag.show();
          }, 3000);
        });
      if (isHidden) {
        console.log("HIDDEN ID:", id);
      }
    });
  }
}

function addRowsControls() {
  const rows = scope.find("> .row");
  rows.append(
    `<div class="${editorClass}" style="position:absolute;width:90%;top:100%;right:0;z-index:1;background:pink;padding:5px 30px 10px 20px;">
        <button class="${editorClass} ${buttonClass}" onclick="editorMoveUp(this)" aria-label="earlier" style="pointer-events:auto;cursor:pointer;float:left;margin:5px;padding:10px;${tempElOutline}">
          ⬆️ earlier
        </button>
        <button class="${editorClass} ${buttonClass}" onclick="editorMoveDown(this)" aria-label="later" style="pointer-events:auto;cursor:pointer;float:left;margin:5px;padding:10px;${tempElOutline}">
          ⬇️ later
        </button>
        <br/>
        <textarea class="${editorClass} ${noteClass}" style="min-width:300px;min-height:100px;pointer-events:auto;resize:none;overflow:auto;margin:5px;${tempElOutline}" placeholder="Notes"></textarea>
      <div>`
  );
  rows.find(`.${noteClass}, .${buttonClass}`).hide();
  rows
    .off("mouseover.note")
    .on("mouseover.note", function () {
      const note = $(this);
      note
        .find(`.${noteClass}, .${buttonClass}`)
        .slideDown(100)
        .prop("disabled", false);
      note.closest(".row").css({ outline: "solid blue", position: "relative" });
    })
    .off("mouseleave.note")
    .on("mouseleave.note", function () {
      const note = $(this);
      note.find(`.${noteClass}, .${buttonClass}`).prop("disabled", true);
      setTimeout(() => {
        note.find(`.${noteClass}, .${buttonClass}`).slideUp(100);
        note.closest(".row").css("outline", "").removeAttr("style");
      }, 500);
    });
  const notes = rows.find(`.${noteClass}`);
  notes.off("keyup.note").on("keyup.note", function () {
    const note = $(this);
    const noteText = note.val();
    const comment = note
      .parent()
      .contents()
      .filter(function () {
        return this.nodeType == Node.COMMENT_NODE;
      })
      .each((i, e) => {
        e.nodeValue = noteText;
      });
    if (!comment.length) {
      note.parent().append($(`<!-- ${noteText} -->`));
    }
  });
}

window.editorMoveUp = (button) => {
  const row = $(button).closest(".row");
  const destination = row
    .prevAll(".row")
    .filter(":visible:not(.hidden)")
    .first();
  console.log(destination);
  if (destination.length) {
    row.insertBefore(destination);

    row
      .add(row.find("*"))
      .add(destination)
      .add(destination.find("*"))
      .filter(":not([contenteditable])")
      .css({ background: "pink", color: "maroon" });

    scope.find(`.${noteClass}`).hide();
  }
  flagIds();
};

window.editorMoveDown = (button) => {
  const row = $(button).closest(".row");
  const destination = row
    .nextAll(".row")
    .filter(":visible:not(.hidden)")
    .first();
  console.log(destination);
  if (destination.length) {
    row.insertAfter(destination);

    row
      .add(row.find("*"))
      .add(destination)
      .add(destination.find("*"))
      .filter(":not([contenteditable])")
      .css({ background: "pink", color: "maroon" });

    scope.find(`.${noteClass}`).hide();
  }
  flagIds();
};

function addSaveHtmlFileButton() {
  scope.after(
    $(
      `<button onclick="saveHtmlFile()"
        class="${editorClass} ${saveClass}"
        style="position:fixed;top:5px;left:5px;cursor:pointer;">
        Save HTML code with notes
          <style>
            .${saveClass} {background:red !important; color:white !important;}
            .${saveClass}:hover {background:lime !important; color:black !important;}
          </style>
      </button>`
    )
  );
}

window.saveHtmlFile = saveHtmlFile;
function saveHtmlFile() {
  removeTempElements();
  const html = scope.html();
  initializeTempElements();
  try {
    const date = new Date();
    const dateString = date.toDateString().replaceAll(" ", "_");
    const timeString = `${date.getHours()}_${date.getMinutes()}_${date.getSeconds()}`;
    const fileName = `page_editor_bookmarklet_${dateString}_${timeString}.html`;
    const tempElem = document.createElement("a");
    tempElem.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(html)
    );
    tempElem.setAttribute("download", fileName);
    if (document.createEvent) {
      const event = document.createEvent("MouseEvents");
      event.initEvent("click", true, true);
      tempElem.dispatchEvent(event);
    } else {
      tempElem.click();
    }
    hitSave = true;
  } catch (err) {
    window.open("data:text/txt;charset=utf-8," + escape(html), "newdoc");
    hitSave = true;
  }
}

function remindUser() {
  if (hitSave) return;
  const yes = confirm(
    "It's been a while. \n\nDo you want to save to HTML code with notes? \n\nIf you refresh this page, you'll lose your changes."
  );
  if (yes) saveHtmlFile();
}
