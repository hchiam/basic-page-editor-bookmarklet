const scope = $("#app");

const editorClass = "basic-page-editor-bookmarklet";
const flagClass = "basic-page-editor-bookmarklet-flag";
const noteClass = "basic-page-editor-bookmarklet-note";
const saveClass = "basic-page-editor-bookmarklet-save";

const tempElOutlineValue = "1px solid maroon";
const tempElOutline = `outline:${tempElOutlineValue};`;

initializeTempElements();
addSaveHtmlFileButton();
$(window).on("resize", function () {
  flagIds();
});

function removeTempElements() {
  scope.find(`.${editorClass}`).remove();
  scope.find("[contenteditable]").removeAttr("contenteditable");
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
        position: "fixed",
        top: top + "px",
        left: left + "px",
        "pointer-events": isHidden ? "" : "none",
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
      scope.append(flag);
      if (isHidden) {
        flag
          .off("mouseover.flag")
          .on("mouseover.flag", () => {
            flag.hide();
          })
          .off("mouseleave.flag")
          .on("mouseleave.flag", () => {
            setTimeout(() => {
              flag.show();
            }, 3000);
          });
      }
    });
  }
}

function addRowsControls() {
  const rows = scope.find("> .row");
  rows.append(
    `<button class="${editorClass}" onclick="editorMoveUp(this)" aria-label="earlier" style="${tempElOutline}">
      ⬆️
     </button>
     <button class="${editorClass}" onclick="editorMoveDown(this)" aria-label="later" style="${tempElOutline}">
      ⬇️
     </button>
     <textarea class="${editorClass} ${noteClass}" style="position:absolute;z-index:1;${tempElOutline}" placeholder="Notes"></textarea>`
  );
  rows.find(`.${noteClass}`).hide();
  rows
    .off("mouseover.note")
    .on("mouseover.note", function () {
      const note = $(this);
      note.find(`.${noteClass}`).slideDown(100);
    })
    .off("mouseleave.note")
    .on("mouseleave.note", function () {
      const note = $(this);
      setTimeout(() => {
        note.find(`.${noteClass}`).slideUp(100);
      }, 1000);
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
    animateMove(row, destination);
    animateMove(destination, row);
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
    animateMove(row, destination);
    animateMove(destination, row);
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

function animateMove(
  originJQueryElement,
  destinationJQueryElement,
  animationTime = 100
) {
  const original = $(originJQueryElement);
  const originalMarginLeft = parseInt(original.css("marginLeft"));
  const originalMarginTop = parseInt(original.css("marginTop"));
  const originPosition = original.position();
  originPosition.left = originPosition.left + originalMarginLeft;
  originPosition.top = originPosition.top + originalMarginTop;
  const originalWidth = original.outerWidth();
  const originalHeight = original.outerHeight();
  const destinationPosition = $(destinationJQueryElement).position();
  const destinationWidth = $(destinationJQueryElement).outerWidth();
  const destinationHeight = $(destinationJQueryElement).outerHeight();
  const temp = original.clone();
  $("body").append(temp);
  temp.addClass("temp");
  temp.addClass("disable-hover").find("*").css({ pointerEvents: "none" });
  temp
    .css({
      position: "fixed",
      zIndex: 1,
      width: originalWidth,
      height: originalHeight,
    })
    .offset(originPosition)
    .animate(
      {
        left: destinationPosition.left,
        top: destinationPosition.top,
        width: destinationWidth,
        height: destinationHeight,
      },
      animationTime
    );
  setTimeout(() => {
    temp.remove();
  }, animationTime * 10);
}

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
  } catch (err) {
    window.open("data:text/txt;charset=utf-8," + escape(html), "newdoc");
  }
}
