import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Download,
  FileText,
  Italic,
  List,
  Minus,
  Palette,
  Plus,
  Redo,
  RefreshCw,
  Strikethrough,
  Subscript,
  Superscript,
  Type,
  Underline,
  Undo,
  Upload,
} from "lucide-react";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

declare global {
  interface Window {
    toggleFormatting: (id: string, value: any[]) => void;
    btnDownloadFunc: (format: string) => void;
    btnUploadFunc: () => void;
    btnReloadFunc: () => void;
  }
}

interface ControlBarState {
  active: {
    Bold: boolean;
    Italic: boolean;
    Underline: boolean;
    Overline: boolean;
    Strikeout: boolean;
    Shadowed: boolean;
    Color: string;
    CharBackColor: string;
    FontHeight: number;
    CharFontName: string;
    LeftPara: boolean;
    CenterPara: boolean;
    RightPara: boolean;
    JustifyPara: boolean;
    DefaultBullet: boolean;
    SubScript: boolean;
    SuperScript: boolean;
  };
  font_name_list: string[];
  disabled: boolean;
}

export interface ControlBarRef {
  state: ControlBarState;
  setState: React.Dispatch<React.SetStateAction<ControlBarState>>;
}

export const ControlBar = forwardRef<ControlBarRef, { id?: string }>(
  (_props, ref) => {
    const [state, setState] = useState<ControlBarState>({
      active: {
        Bold: false,
        Italic: false,
        Underline: false,
        Overline: false,
        Strikeout: false,
        Shadowed: false,
        Color: "#000000",
        CharBackColor: "#FFFFFF",
        FontHeight: 12,
        CharFontName: "Noto Sans",
        LeftPara: false,
        CenterPara: false,
        RightPara: false,
        JustifyPara: false,
        DefaultBullet: false,
        SubScript: false,
        SuperScript: false,
      },
      font_name_list: [],
      disabled: true,
    });

    useImperativeHandle(ref, () => ({
      state,
      setState,
    }));
    useEffect(() => {
      // Store reference globally so pre_soffice.js can access it
      window.reactControlBarComponent = { state, setState };

      // Call the global jsPassCtrlBar function once the component is mounted
      if (window.jsPassCtrlBar) {
        console.log("Calling jsPassCtrlBar with React component");
        window.jsPassCtrlBar({ state, setState });
      } else {
        console.log(
          "jsPassCtrlBar not available yet, will be called when pre_soffice.js loads"
        );
      }
    }, []); // Empty dependency array to run only once

    const toggleFormat = (id: string, value: any[] = []) => {
      if (window.toggleFormatting) {
        window.toggleFormatting(id, value);
      }
    };

    const downloadFile = (format: string) => {
      if (window.btnDownloadFunc) {
        window.btnDownloadFunc(format);
      }
    };

    return (
      <div className="flex flex-wrap items-center gap-2 p-2 border border-border rounded-lg bg-card">
        {/* Text formatting buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant={state.active.Bold ? "default" : "outline"}
            size="sm"
            disabled={state.disabled}
            onClick={() => toggleFormat("Bold")}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant={state.active.Italic ? "default" : "outline"}
            size="sm"
            disabled={state.disabled}
            onClick={() => toggleFormat("Italic")}
          >
            <Italic className="h-4 w-4" />
          </Button>{" "}
          <Button
            variant={state.active.Underline ? "default" : "outline"}
            size="sm"
            disabled={state.disabled}
            onClick={() => toggleFormat("Underline")}
          >
            <Underline className="h-4 w-4" />
          </Button>
          <Button
            variant={state.active.Strikeout ? "default" : "outline"}
            size="sm"
            disabled={state.disabled}
            onClick={() => toggleFormat("Strikeout")}
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
          <Button
            variant={state.active.SubScript ? "default" : "outline"}
            size="sm"
            disabled={state.disabled}
            onClick={() => toggleFormat("SubScript")}
          >
            <Subscript className="h-4 w-4" />
          </Button>
          <Button
            variant={state.active.SuperScript ? "default" : "outline"}
            size="sm"
            disabled={state.disabled}
            onClick={() => toggleFormat("SuperScript")}
          >
            <Superscript className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-border" />

        {/* Color controls */}
        <div className="flex items-center gap-1">
          <div className="flex items-center">
            <label htmlFor="text-color" className="sr-only">
              Text Color
            </label>
            <input
              id="text-color"
              type="color"
              value={state.active.Color}
              disabled={state.disabled}
              onChange={(e) =>
                toggleFormat("Color", [
                  ["Color", parseInt(e.target.value.replace("#", ""), 16)],
                ])
              }
              className="w-8 h-8 border border-border rounded cursor-pointer disabled:cursor-not-allowed"
              title="Text Color"
            />
          </div>

          <div className="flex items-center">
            <label htmlFor="background-color" className="sr-only">
              Background Color
            </label>
            <input
              id="background-color"
              type="color"
              value={state.active.CharBackColor}
              disabled={state.disabled}
              onChange={(e) =>
                toggleFormat("CharBackColor", [
                  [
                    "CharBackColor",
                    parseInt(e.target.value.replace("#", ""), 16),
                  ],
                ])
              }
              className="w-8 h-8 border border-border rounded cursor-pointer disabled:cursor-not-allowed"
              title="Background Color"
            />
          </div>
        </div>

        <div className="w-px h-6 bg-border" />

        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={state.disabled}
            onClick={() => toggleFormat("Undo")}
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={state.disabled}
            onClick={() => toggleFormat("Redo")}
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-border" />

        {/* File operations */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={state.disabled}
            onClick={() => {
              const input = document.getElementById(
                "file-upload"
              ) as HTMLInputElement;
              input?.click();
            }}
            title="Upload File"
          >
            <Upload className="h-4 w-4 mr-1" />
            Upload
          </Button>

          <input
            id="file-upload"
            type="file"
            accept=".odt"
            className="hidden"
            onChange={() => {
              if (window.btnUploadFunc) {
                window.btnUploadFunc();
              }
            }}
          />

          <Button
            variant="outline"
            size="sm"
            disabled={state.disabled}
            onClick={() => {
              if (window.btnReloadFunc) {
                window.btnReloadFunc();
              }
            }}
            title="Reload File"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Reload
          </Button>
        </div>

        <div className="w-px h-6 bg-border" />

        {/* Font size controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={state.disabled}
            onClick={() => toggleFormat("Shrink")}
          >
            <Minus className="h-4 w-4" />
          </Button>

          <Select
            value={state.active.FontHeight.toString()}
            disabled={state.disabled}
            onValueChange={(value) => {
              const height = parseFloat(value);
              toggleFormat("FontHeight", [["FontHeight.Height", height]]);
            }}
          >
            <SelectTrigger className="w-16">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[
                8, 9, 10, 11, 12, 13, 14, 16, 18, 20, 22, 24, 26, 28, 32, 36,
                48, 72,
              ].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            disabled={state.disabled}
            onClick={() => toggleFormat("Grow")}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-border" />

        {/* Font family */}
        <Select
          value={state.active.CharFontName}
          disabled={state.disabled}
          onValueChange={(value) => {
            toggleFormat("CharFontName", [["CharFontName.FamilyName", value]]);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {state.font_name_list.map((fontName) => (
              <SelectItem key={fontName} value={fontName}>
                {fontName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="w-px h-6 bg-border" />

        {/* Alignment buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant={state.active.LeftPara ? "default" : "outline"}
            size="sm"
            disabled={state.disabled}
            onClick={() => toggleFormat("LeftPara")}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>

          <Button
            variant={state.active.CenterPara ? "default" : "outline"}
            size="sm"
            disabled={state.disabled}
            onClick={() => toggleFormat("CenterPara")}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>

          <Button
            variant={state.active.RightPara ? "default" : "outline"}
            size="sm"
            disabled={state.disabled}
            onClick={() => toggleFormat("RightPara")}
          >
            <AlignRight className="h-4 w-4" />
          </Button>

          <Button
            variant={state.active.JustifyPara ? "default" : "outline"}
            size="sm"
            disabled={state.disabled}
            onClick={() => toggleFormat("JustifyPara")}
          >
            <AlignJustify className="h-4 w-4" />
          </Button>

          <Button
            variant={state.active.DefaultBullet ? "default" : "outline"}
            size="sm"
            disabled={state.disabled}
            onClick={() => toggleFormat("DefaultBullet")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-border" />

        {/* Download buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={state.disabled}
            onClick={() => downloadFile("btnOdt")}
          >
            <FileText className="h-4 w-4 mr-1" />
            ODT
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={state.disabled}
            onClick={() => downloadFile("btnPdf")}
          >
            <Download className="h-4 w-4 mr-1" />
            PDF
          </Button>
        </div>
      </div>
    );
  }
);

ControlBar.displayName = "ControlBar";
