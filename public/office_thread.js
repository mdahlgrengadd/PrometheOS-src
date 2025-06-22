/* -*- Mode: JS; tab-width: 2; indent-tabs-mode: nil; js-indent-level: 2; fill-column: 100 -*- */
// SPDX-License-Identifier: MIT

// Debugging note:
// Switch the web worker in the browsers debug tab to debug this code.
// It's the "em-pthread" web worker with the most memory usage, where "zetajs" is defined.

// JS mode: module
import { ZetaHelperThread } from "./assets/vendor/zetajs/zetaHelper.js";

// global variables - zetajs environment:
const zHT = new ZetaHelperThread();
const zetajs = zHT.zetajs;
const css = zHT.css;
const desktop = zHT.desktop;

// = global variables (some are global for easier debugging) =
// common variables:
let letterXModel, letterCtrl;
// example specific:
let writerModuleConfigured = false;
const readyList = { Fonts: false, Window: false };
let letterFrame, fontsList;
let bean_overwrite, bean_odt_export, bean_pdf_export;

// Export variables for debugging. Available for debugging via:
//   globalThis.zetajsStore.threadJsContext
export {
  zHT,
  letterXModel,
  letterCtrl,
  bean_overwrite,
  bean_odt_export,
  bean_pdf_export,
};

function demo() {
  bean_overwrite = new css.beans.PropertyValue({
    Name: "Overwrite",
    Value: true,
  });
  bean_odt_export = new css.beans.PropertyValue({
    Name: "FilterName",
    Value: "writer8",
  });
  bean_pdf_export = new css.beans.PropertyValue({
    Name: "FilterName",
    Value: "writer_pdf_Export",
  });

  zHT.configDisableToolbars(["Writer"]);
  loadFile("letter");
  zHT.thrPort.onmessage = (e) => {
    switch (e.data.cmd) {
      case "download":
        const format =
          e.data.id === "btnOdt" ? bean_odt_export : bean_pdf_export;
        letterXModel.storeToURL("file:///tmp/output", [bean_overwrite, format]);
        zHT.thrPort.postMessage({ cmd: "download", id: e.data.id });
        break;
      case "reload":
        console.log("Reload command received, closing current document");
        letterXModel.close(true);
        // Reset ready state for reload so UI gets properly re-enabled
        readyList.Fonts = false;
        readyList.Window = false;
        console.log("Loading file from /tmp/letter.odt");
        loadFile("letter");
        break;
      case "toggleFormat":
        const params = [];
        const value = e.data.value;
        for (let i = 0; i < value.length; i++) {
          params[i] = new css.beans.PropertyValue({
            Name: value[i][0],
            Value: value[i][1],
          });
        }
        zHT.dispatch(letterCtrl, e.data.id, params);
        break;
      default:
        throw Error("Unknown message command: " + e.data.cmd);
    }
  };
}

function loadFile(fileTab) {
  // Load letter document only (word editor)
  console.log("loadFile called, loading file:///tmp/letter.odt");
  letterXModel = desktop.loadComponentFromURL(
    "file:///tmp/letter.odt",
    "_default",
    0,
    []
  );
  console.log("Document loaded successfully");
  letterCtrl = letterXModel.getCurrentController();
  if (!writerModuleConfigured) {
    writerModuleConfigured = true; // Permanant Writer module toggles. Don't run again on a document reload.
    zHT.dispatch(letterCtrl, "Sidebar", []);
    zHT.dispatch(letterCtrl, "Ruler", []);
  }
  letterFrame = letterCtrl.getFrame();
  // Turn off UI elements (idempotent operations):
  letterFrame.LayoutManager.hideElement("private:resource/statusbar/statusbar");
  letterFrame.LayoutManager.hideElement("private:resource/menubar/menubar");
  // Storing the getContainerWindow() result is unstable.
  letterFrame.getContainerWindow().setPosSize(-1000, -1000, 500, 500, 15);
  letterFrame.getContainerWindow().FullScreen = true;

  // Get font list for toolbar.
  const fontsUrlObj = zHT.transformUrl("FontNameList");
  const fontsDispatcher = zHT.queryDispatch(letterCtrl, fontsUrlObj);
  const fontsDispatchNotifier =
    css.frame.XDispatch.constructor(fontsDispatcher);
  const fontListener = zetajs.unoObject([css.frame.XStatusListener], {
    statusChanged(e) {
      fontsDispatchNotifier.removeStatusListener(fontListener, fontsUrlObj);
      fontsList = zetajs.fromAny(e.State);
      startupReady("Fonts");
    },
  });
  fontsDispatchNotifier.addStatusListener(fontListener, fontsUrlObj);
  for (const id of [
    "Bold",
    "Italic",
    "Underline",
    "Overline",
    "Strikeout",
    "Shadowed",
    "Color",
    "CharBackColor",
    "LeftPara",
    "CenterPara",
    "RightPara",
    "JustifyPara",
    "DefaultBullet",
    "FontHeight",
    "CharFontName",
    "SubScript",
    "SuperScript",
    "Undo",
    "Redo",
  ]) {
    const urlObj = zHT.transformUrl(id);
    const listener = zetajs.unoObject([css.frame.XStatusListener], {
      disposing: (source) => {},
      statusChanged: (rawSt) => {
        // rawState
        rawSt = zetajs.fromAny(rawSt.State);
        // If a non uniformly formatted area is selected, state may contain an invalid value.
        let state;
        if (id === "FontHeight") {
          if (typeof rawSt.Height === "number")
            state = Math.round(rawSt.Height * 10) / 10;
        } else if (id === "CharFontName") {
          if (typeof rawSt.Name === "string") state = rawSt.Name;
        } else if (["Color", "CharBackColor"].includes(id)) {
          if (typeof rawSt === "number") {
            if (id === "Color" && rawSt === -1) rawSt = 0x000000;
            else if (id === "CharBackColor" && rawSt === -1) rawSt = 0xffffff;
            state = "#" + (0x1000000 + rawSt).toString(16).substring(1, 7); // int to #RRGGBB
          }
        } else if (typeof rawSt === "boolean") state = rawSt;
        else state = false; // Behave like desktop UI if a non uniformly formatted area is selected.
        if (typeof state !== "undefined")
          zetajs.mainPort.postMessage({ cmd: "setFormat", id, state });
      },
    });
    zHT.queryDispatch(letterCtrl, urlObj).addStatusListener(listener, urlObj);
  }
  startupReady("Window");
}

function startupReady(startupStep) {
  readyList[startupStep] = true;
  if (Object.values(readyList).indexOf(false) == -1)
    zHT.thrPort.postMessage({ cmd: "ui_ready", fontsList });
}

demo(); // launching demo

/* vim:set shiftwidth=2 softtabstop=2 expandtab cinoptions=b1,g0,N-s cinkeys+=0=break: */
