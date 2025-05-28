/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/** Notification engine to use */
export enum LauncherNotifyTypeEnum {
  Radix = "radix",
  Sonner = "sonner",
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter(
      (key) => "undefined" !== typeof query[key],
    );
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== "string"
        ? JSON.stringify(input)
        : input,
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams,
  ): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (
    cancelToken: CancelToken,
  ): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData
            ? { "Content-Type": type }
            : {}),
        },
        signal:
          (cancelToken
            ? this.createAbortSignal(cancelToken)
            : requestParams.signal) || null,
        body:
          typeof body === "undefined" || body === null
            ? null
            : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response.clone() as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title PrometheOS API
 * @version 1.0.0
 *
 * API for AI agent interaction with the PrometheOS
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * @description Opens a confirmation dialog and returns whether the user confirmed
     *
     * @tags System
     * @name DialogOpenDialog
     * @summary Open Dialog
     * @request POST:/api/dialog/openDialog
     */
    dialogOpenDialog: (
      data: {
        /** Cancel button label */
        cancelLabel?: string;
        /** Confirm button label */
        confirmLabel?: string;
        /** Dialog description */
        description?: string;
        /** Dialog title */
        title: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** Result data from the operation */
          data?: object;
          /** Whether the operation was successful */
          success?: boolean;
        },
        {
          /** Error message */
          error?: string;
          /**
           * Operation failed
           * @example false
           */
          success?: boolean;
        }
      >({
        path: `/api/dialog/openDialog`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Returns all known event names
     *
     * @tags System
     * @name EventListEvents
     * @summary List Events
     * @request POST:/api/event/listEvents
     */
    eventListEvents: (params: RequestParams = {}) =>
      this.request<
        {
          /** Result data from the operation */
          data?: object;
          /** Whether the operation was successful */
          success?: boolean;
        },
        {
          /** Error message */
          error?: string;
          /**
           * Operation failed
           * @example false
           */
          success?: boolean;
        }
      >({
        path: `/api/event/listEvents`,
        method: "POST",
        format: "json",
        ...params,
      }),

    /**
     * @description Closes an app by its ID
     *
     * @tags System
     * @name LauncherKillApp
     * @summary Kill App
     * @request POST:/api/launcher/killApp
     */
    launcherKillApp: (
      data: {
        /** The ID of the app to close */
        appId: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** Result data from the operation */
          data?: object;
          /** Whether the operation was successful */
          success?: boolean;
        },
        {
          /** Error message */
          error?: string;
          /**
           * Operation failed
           * @example false
           */
          success?: boolean;
        }
      >({
        path: `/api/launcher/killApp`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Launch an app by its ID
     *
     * @tags System
     * @name LauncherLaunchApp
     * @summary Launch App
     * @request POST:/api/launcher/launchApp
     */
    launcherLaunchApp: (
      data: {
        /** The ID of the app to launch */
        appId: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** Result data from the operation */
          data?: object;
          /** Whether the operation was successful */
          success?: boolean;
        },
        {
          /** Error message */
          error?: string;
          /**
           * Operation failed
           * @example false
           */
          success?: boolean;
        }
      >({
        path: `/api/launcher/launchApp`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Show a notification on screen
     *
     * @tags System
     * @name LauncherNotify
     * @summary Notify
     * @request POST:/api/launcher/notify
     */
    launcherNotify: (
      data: {
        /** The notification message to display */
        message: string;
        /** Notification engine to use */
        type?: LauncherNotifyTypeEnum;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** Result data from the operation */
          data?: object;
          /** Whether the operation was successful */
          success?: boolean;
        },
        {
          /** Error message */
          error?: string;
          /**
           * Operation failed
           * @example false
           */
          success?: boolean;
        }
      >({
        path: `/api/launcher/notify`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Waits for the specified event to be emitted or until the timeout is reached
     *
     * @tags System
     * @name OnEventWaitForEvent
     * @summary Wait For Event
     * @request POST:/api/onEvent/waitForEvent
     */
    onEventWaitForEvent: (
      data: {
        /** The name of the event to wait for */
        eventId: string;
        /** Timeout in milliseconds (optional, default is infinite) */
        timeout?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** Result data from the operation */
          data?: object;
          /** Whether the operation was successful */
          success?: boolean;
        },
        {
          /** Error message */
          error?: string;
          /**
           * Operation failed
           * @example false
           */
          success?: boolean;
        }
      >({
        path: `/api/onEvent/waitForEvent`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}
