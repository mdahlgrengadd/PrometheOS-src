// TypeScript declarations for ZetaHelper

declare module "./assets/vendor/zetajs/zetaHelper.js" {
  export class ZetaHelperMain {
    static wasmUrls: Record<string, string>;

    canvas: HTMLElement;
    Module: any;
    threadJs: string | null;
    threadJsType: string;
    soffice_base_url: string;
    thrPort: MessagePort;
    FS: any;

    constructor(
      threadJs: string | URL | null,
      options: {
        threadJsType?: string;
        wasmPkg?: string;
        blockPageScroll?: boolean;
      }
    );

    start(app_init: () => void): void;
    widthPxAdd(obj: CSSStyleDeclaration, value: number): void;
  }

  export class ZetaHelperThread {
    zetajs: any;
    css: any;
    desktop: any;
    thrPort: MessagePort;

    constructor();
    configDisableToolbars(officeModules: string[]): void;
    transformUrl(unoUrl: string): any;
    queryDispatch(ctrl: any, urlObj: any): any;
    dispatch(ctrl: any, unoUrl: string, params?: any[]): void;
  }

  export function zetaHelperWrapThread(): void;
}
