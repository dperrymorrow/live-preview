
const styles = {
  preview: {
    position: "absolute",
    top: 0,
    left: 0,
    "z-index": -1,
    "overflow": "hidden",
    "resize": "none",
    "width": "100%",
    "box-sizing": "border-box"
  },
  container: {
    "display": "flex",
    "position": "relative"
  },
  editor: {
    "caret-color": "black",
    "box-sizing": "border-box",
    "flex-basis": "100%",
    "color": "rgba(0,0,0,0.0)",
    "background": "transparent",
    "resize": "none"
  }
};

function _cloneEditorStyles($editor, $preview) {
  const cssStyles = window.getComputedStyle($editor, null);
  Array.from(cssStyles).forEach(key => {
    const value = cssStyles.getPropertyValue(key);
    if (!(key in styles.preview) && !["none", "auto"].includes(value) && !key.includes("-webkit-")) {
      $preview.style.setProperty(key, value, cssStyles.getPropertyPriority(key));
    }
  });
}

const _addStyles = ($el, styles) => Object.keys(styles).forEach(key => $el.style[key] = styles[key]);
const _validate = (config) => {
  if (typeof config.format !== "function")
    throw new Error("must pass a format function in options to LivePreview");
  if (!(config.textarea instanceof HTMLTextAreaElement))
    throw new Error("must pass a textare instance to LivePreview");
};

export default function ({ textarea, format }) {
  _validate(arguments[0]);
  // setup the DOM
  const $editor = textarea;
  const $container = document.createElement("div");
  const $preview = document.createElement("div");

  $container.classList.add("live-preview-container");
  $editor.classList.add("live-preview-editor");
  $preview.classList.add("live-preview-preview");

  $editor.parentNode.appendChild($container);
  $container.appendChild($preview);
  $container.appendChild($editor);

  // listeners
  const _scroll = () => $preview.scrollTop = $editor.scrollTop;
  const _change = () => {
    $preview.innerText = $editor.value;
    $preview.innerHTML = format($editor.value);
  };

  _cloneEditorStyles($editor, $preview);
  _addStyles($preview, styles.preview, true);
  _addStyles($editor, styles.editor);
  _addStyles($container, styles.container);

  // this will get moved to a worker
  if ($editor.value.length) _change();
  $editor.addEventListener("scroll", _scroll);
  $editor.addEventListener("input", _change);

  return {
    $editor, $container, $preview,
    destroy() {
      $editor.removeEventListener("scroll", _scroll);
      $editor.removeEventListener("input", _change);
    }
  };
}
