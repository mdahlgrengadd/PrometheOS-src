/* -*- Mode: JS; tab-width: 2; indent-tabs-mode: nil; js-indent-level: 2; fill-column: 100 -*- */
// SPDX-License-Identifier: MIT

import { ZetaHelperMain } from "./assets/vendor/zetajs/zetaHelper.js";

let tbDataJs; // toolbar dataset passed from React for plain JS

const loadingInfo = document.getElementById("loadingInfo");
const canvas = document.getElementById("qtcanvas");
const controlbar = document.getElementById("controlbar");
const controlCell = document.getElementById("controlCell");
const canvasCell = document.getElementById("canvasCell");
const lblUpload = document.getElementById("lblUpload");
const btnUpload = document.getElementById("btnUpload");
const fileUpload = document.getElementById("file-upload"); // The actual file input
const btnReload = document.getElementById("btnReload");
const disabledElementsAry = [btnUpload, btnReload];

// Dynamic canvas sizing
function getCanvasDimensions() {
  const container = canvas.parentElement;
  const containerWidth = container.clientWidth;
  const containerHeight = Math.max(600, window.innerHeight * 0.6);
  return {
    width: Math.max(800, containerWidth - 40), // Minimum 800px with some padding
    height: containerHeight,
  };
}

const { width: canvas_width, height: canvas_height } = getCanvasDimensions();

// IMPORTANT:
// Set base URL to the soffice.* files.
// Use an empty string if those files are in the same directory.
let wasmPkg;
try {
  wasmPkg = "url:" + config_soffice_base_url; // May fail. config.js is optional.
} catch {}
const zHM = new ZetaHelperMain("office_thread.js", {
  threadJsType: "module",
  wasmPkg,
});

// Handle canvas resizing
function updateCanvasSize() {
  const dimensions = getCanvasDimensions();
  canvas.style.width = dimensions.width + "px";
  canvas.style.height = dimensions.height + "px";
}

// Update canvas size on window resize with debouncing
let resizeTimeout;
let isResizing = false;
window.addEventListener("resize", (event) => {
  // Only handle actual window resize events, not programmatic ones
  if (event.isTrusted && !isResizing) {
    updateCanvasSize();
    // Debounce resize events to reduce noise
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      isResizing = true;
      window.dispatchEvent(new Event("resize"));
      setTimeout(() => {
        isResizing = false;
      }, 100);
    }, 150);
  }
});

// Set initial canvas size
updateCanvasSize();

// Functions stored below window.* are usually accessed from React.

window.jsPassCtrlBar = (pTbDataJs) => {
  // window....: make it accessible to React
  console.log("jsPassCtrlBar called with:", pTbDataJs);
  tbDataJs = pTbDataJs;
  disabledElementsAry.push(tbDataJs);
  console.log("tbDataJs set, disabled state:", tbDataJs.state?.disabled);
};

window.toggleFormatting = (id, value) => {
  // window....: make it accessible to React
  setToolbarActive(id, !tbDataJs.state.active[id]);
  zHM.thrPort.postMessage({ cmd: "toggleFormat", id, value });
  // Give focus to the LO canvas to avoid issues with
  // <https://bugs.documentfoundation.org/show_bug.cgi?id=162291> "Setting Bold is
  // undone when clicking into non-empty document" when the user would need to click
  // into the canvas to give back focus to it:
  canvas.focus();
};

function setToolbarActive(id, value) {
  if (tbDataJs && tbDataJs.setState) {
    tbDataJs.setState((prevState) => ({
      ...prevState,
      active: {
        ...prevState.active,
        [id]: value,
      },
    }));
  }
}

window.btnDownloadFunc = (btnId) => {
  // window....: make it accessible to React
  zHM.thrPort.postMessage({ cmd: "download", id: btnId });
};

window.btnUploadFunc = () => {
  // window....: make it accessible to React
  const fileInput = document.getElementById("file-upload");
  if (!fileInput || !fileInput.files || !fileInput.files[0]) {
    console.error("No file selected for upload");
    return;
  }

  const selectedFile = fileInput.files[0];
  console.log(
    "Selected file:",
    selectedFile.name,
    "Type:",
    selectedFile.type,
    "Size:",
    selectedFile.size
  );

  // Check if it's an ODT file
  if (!selectedFile.name.toLowerCase().endsWith(".odt")) {
    console.warn(
      "Warning: File doesn't have .odt extension. This might cause issues."
    );
  }

  for (const elem of disabledElementsAry) elem.disabled = true;
  lblUpload?.classList.add("disabled");
  const filename = "letter.odt";
  console.log("Starting file upload...");

  selectedFile
    .arrayBuffer()
    .then((aryBuf) => {
      console.log("File read, size:", aryBuf.byteLength, "bytes");

      // Verify the file was read correctly
      if (aryBuf.byteLength === 0) {
        console.error("File is empty or couldn't be read");
        return;
      }

      console.log("Writing file to filesystem...");
      zHM.FS.writeFile("/tmp/" + filename, new Uint8Array(aryBuf));
      console.log("File written to /tmp/" + filename);

      // Verify the file was written
      try {
        const writtenFile = zHM.FS.readFile("/tmp/" + filename);
        console.log(
          "Verification: File size on filesystem:",
          writtenFile.length,
          "bytes"
        );
      } catch (e) {
        console.error("Error verifying written file:", e);
      }

      btnReloadFunc();
    })
    .catch((error) => {
      console.error("Error reading file:", error);
      // Re-enable controls on error
      for (const elem of disabledElementsAry) {
        if (elem) elem.disabled = false;
      }
      lblUpload?.classList.remove("disabled");
    });
};

window.btnReloadFunc = () => {
  // window....: make it accessible to React
  for (const elem of disabledElementsAry) elem.disabled = true;
  lblUpload?.classList.add("disabled");
  if (loadingInfo) loadingInfo.style.display = null;
  if (canvas) canvas.style.visibility = "hidden";
  zHM.thrPort.postMessage({ cmd: "reload", id: true });
};

async function getDataFile(file_url) {
  const response = await fetch(file_url);
  return response.arrayBuffer();
}

zHM.start(() => {
  zHM.thrPort.onmessage = (e) => {
    switch (e.data.cmd) {
      case "ui_ready":
        console.log("UI ready event received");
        // Trigger resize of the embedded window to match the canvas size.
        window.dispatchEvent(new Event("resize"));
        setTimeout(() => {
          // display Office UI properly
          console.log("Enabling toolbar and UI elements");
          // Handle loading info and canvas visibility - word editor only
          const currentCanvas = document.getElementById("qtcanvas");
          const currentLoading = document.getElementById("loadingInfo");

          if (currentLoading) {
            currentLoading.style.display = "none";
            console.log("Loading info hidden");
          }
          if (currentCanvas) {
            currentCanvas.style.visibility = null;
            console.log("Canvas made visible");
          }

          if (tbDataJs && tbDataJs.setState) {
            tbDataJs.setState((prevState) => ({
              ...prevState,
              font_name_list: e.data.fontsList,
              disabled: false,
            }));
            console.log("Toolbar enabled, font list:", e.data.fontsList);
          } else {
            console.error(
              "tbDataJs is not set! React component may not be connected properly."
            );
          }
          for (const elem of disabledElementsAry) {
            if (elem) elem.disabled = false;
          }
          lblUpload?.classList.remove("disabled");
          console.log("All UI elements enabled");
        }, 1000); // milliseconds
        break;
      case "setFormat":
        setToolbarActive(e.data.id, e.data.state);
        break;
      case "download":
        const bytes = zHM.FS.readFile("/tmp/output");
        const format = e.data.id === "btnOdt" ? "odt" : "pdf";
        const blob = new Blob([bytes], { type: "application/" + format });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "letter." + format;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        break;
      default:
        throw Error("Unknown message command: " + e.data.cmd);
    }
  };
  getDataFile("./letter.odt").then((aryBuf) => {
    zHM.FS.writeFile("/tmp/letter.odt", new Uint8Array(aryBuf));
  });
});

/* vim:set shiftwidth=2 softtabstop=2 expandtab cinoptions=b1,g0,N-s cinkeys+=0=break: */
