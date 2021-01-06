function importLibraries() {
  // Bootstrap
  document.head.innerHTML += '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">'

  // Fonts
  document.head.innerHTML += '<link rel="preconnect" href="https://fonts.gstatic.com">'
  document.head.innerHTML += '<link href="https://fonts.googleapis.com/css2?family=PT+Mono&display=swap" rel="stylesheet">'
}

function createEditor(editorName, editorBadge, defaultValue) {
  let col = document.createElement("div")
  col.className = "col-lg-4 col-sm"

  let elementBadge = document.createElement("span");
  elementBadge.className = "badge badge-" + editorBadge;
  elementBadge.innerText = editorName.toUpperCase();

  let elementWrapper = document.createElement("div")
  elementWrapper.className = "bg-dark rounded"
  elementWrapper.style.height = "250px"
  elementWrapper.style.overflow = "auto"

  let element = document.createElement("textarea");
  element.setAttribute("rows", 0)
  element.id = editorName
  element.className = "col-11 pl-2 pt-2 bg-dark text-warning"
  element.style.fontFamily = "'PT Mono', monospace"
  element.style.border = "none"
  element.style.outline = "none"
  element.style.overflow = "auto"
  element.style.resize = "none"
  element.style.whiteSpace = "nowrap"
  
  if (defaultValue !== undefined) {
    element.value = defaultValue
  }

  element.placeholder = editorName.toUpperCase();

  elementWrapper.appendChild(element)

  col.appendChild(elementBadge)
  col.appendChild(document.createElement("br"))
  col.appendChild(elementWrapper)

  return col;
}

function initialize() {
  let codeEditor = document.getElementById("code-editor");
  let row = document.createElement("div")

  row.className = "row"
  codeEditor.appendChild(row)

  // HTML
  row.appendChild(createEditor('html', 'primary', codeEditor.dataset.html))

  // CSS
  row.appendChild(createEditor('css', 'danger', codeEditor.dataset.css))

  // JS
  row.appendChild(createEditor('js', 'warning', codeEditor.dataset.js))

  let result = document.createElement("iframe");

  result.id = "code"
  result.className = "col mt-3"

  row.appendChild(result);

}

async function compile() {

  let html = document.getElementById("html")
  let css = document.getElementById("css")
  let js = document.getElementById("js")
  let code = document.getElementById("code").contentWindow.document;

  if (!html.value) {
    const response = await fetch('https://api.quotable.io/random')
    const data = await response.json()
    html.value = '<blockquote>'
    html.value += '<p>'
    html.value += data.content
    html.value += '</p>'
    html.value += '<footer>'
    html.value += '- ' + data.author + ' -'
    html.value += '</footer>'
    html.value += '</blockquote>'

    css.value = "blockquote {text-align: center; font-family: 'PT Mono', monospace;}"

    code.open();
    code.writeln(
      html.value +
      "<style>" +
      css.value +
      "</style>" +
      "<script>" +
      js.value +
      "</script>"
    );
    code.close();
    
  }

  document.body.onload = function () {
    code.open();
    code.writeln(
      html.value +
      "<style>" +
      css.value +
      "</style>" +
      "<script>" +
      js.value +
      "</script>"
    );
    code.close();
  };

  document.body.onkeyup = function () {
    code.open();
    code.writeln(
      html.value +
      "<style>" +
      css.value +
      "</style>" +
      "<script>" +
      js.value +
      "</script>"
    );
    code.close();
  };
}

function tabSupport() {
  var textareas = document.getElementsByTagName("textarea")
  for (let index = 0; index < textareas.length; index++) {
    if (textareas[index].addEventListener) {
      textareas[index].addEventListener('keydown', this.tabHandler, false);
    } else if (textareas[index].attachEvent) {
      textareas[index].attachEvent('onkeydown', this.tabHandler); /* damn IE hack */
    }

  }
}

function tabHandler(e) {
  var TABKEY = 9;
  if (e.keyCode == TABKEY) {
    this.value += "\t";
    if (e.preventDefault) {
      e.preventDefault();
    }
    return false;
  }
}

var eventList = {}

function updateLineNumbers(ta, el) {
    // Let's check if there are more or less lines than before
    const lineCount = ta.value.split("\n").length;
    const childCount = el.children.length;
    let difference = lineCount - childCount;
    // If there is any positive difference, we need to add more line numbers
    if (difference > 0) {
        // Create a fragment to work with so we only have to update DOM once
        const frag = document.createDocumentFragment();
        // For each new line we need to add,
        let i = childCount + 1;
        while (difference > 0) {
            // Create a <span>, add TLN class name, append to fragment and
            // update difference
            ta.setAttribute("rows", lineCount);
            const line_number = document.createElement("div");
            line_number.className = "text-secondary"
            line_number.style.marginLeft = "2px"
            line_number.innerText = i
            frag.appendChild(line_number);
            difference--;
            i+= 1;
        }
        // Append fragment (with <span> children) to our wrapper element
        el.appendChild(frag);
    }
    // If, however, there's negative difference, we need to remove line numbers
    while (difference < 0) {
        // Simple stuff, remove last child and update difference
        el.removeChild(el.lastChild);
        ta.setAttribute("rows", lineCount);
        difference++;
    }
}

function appendLineNumbers(id) {
    // Get reference to desired <textarea>
    const ta = document.getElementById(id);

    // Create line numbers wrapper, insert it before <textarea>
    const el = document.createElement("div");
    el.className = "d-inline-block ml-1"
    el.style.position = "relative"
    el.style.top = "-8px"
    ta.parentNode.insertBefore(el, ta);
    // Call update to actually insert line numbers to the wrapper
    updateLineNumbers(ta, el);
    // Initialize event listeners list for this element ID, so we can remove
    // them later if needed
    eventList[id] = [];

    // Constant list of input event names so we can iterate
    const __change_evts = [
        "propertychange", "input", "keydown", "keyup"
    ];
    // Default handler for input events
    const __change_hdlr = function (ta, el) {
        return function (e) {
            // If pressed key is Left Arrow (when cursor is on the first character),
            // or if it's Enter/Home, then we set horizontal scroll to 0
            if ((+ta.scrollLeft == 10 && (e.keyCode == 37 || e.which == 37
                || e.code == "ArrowLeft" || e.key == "ArrowLeft"))
                || e.keyCode == 36 || e.which == 36 || e.code == "Home" || e.key == "Home"
                || e.keyCode == 13 || e.which == 13 || e.code == "Enter" || e.key == "Enter"
                || e.code == "NumpadEnter")
                ta.scrollLeft = 0;
            // Whether we scrolled or not, let's check for any line count updates
            updateLineNumbers(ta, el);
        }
    }(ta, el);

    // Finally, iterate through those event names, and add listeners to
    // <textarea> and to events list
    for (let i = __change_evts.length - 1; i >= 0; i--) {
        ta.addEventListener(__change_evts[i], __change_hdlr);
        eventList[id].push({
            evt: __change_evts[i],
            hdlr: __change_hdlr
        });
    }

    // Constant list of scroll event names so we can iterate
    const __scroll_evts = ["change", "mousewheel", "scroll"];
    // Default handler for scroll events (pretty self explanatory)
    const __scroll_hdlr = function (ta, el) {
        return function () { el.scrollTop = ta.scrollTop; }
    }(ta, el);
    // Just like before, iterate and add listeners to <textarea> and to list
    for (let i = __scroll_evts.length - 1; i >= 0; i--) {
        ta.addEventListener(__scroll_evts[i], __scroll_hdlr);
        eventList[id].push({
            evt: __scroll_evts[i],
            hdlr: __scroll_hdlr
        });
    }
}

importLibraries()
initialize()
tabSupport()
compile()
appendLineNumbers("html")
appendLineNumbers("css")
appendLineNumbers("js")