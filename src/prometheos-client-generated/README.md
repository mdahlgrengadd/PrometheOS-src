## prometheos-client@1.0.0

This generator creates TypeScript/JavaScript client that utilizes [axios](https://github.com/axios/axios). The generated Node module can be used in the following environments:

Environment
* Node.js
* Webpack
* Browserify

Language level
* ES5 - you must have a Promises/A+ library installed
* ES6

Module system
* CommonJS
* ES6 module system

It can be used in both TypeScript and JavaScript. In TypeScript, the definition will be automatically resolved via `package.json`. ([Reference](https://www.typescriptlang.org/docs/handbook/declaration-files/consumption.html))

### Building

To build and compile the typescript sources to javascript use:
```
npm install
npm run build
```

### Publishing

First build the package then run `npm publish`

### Consuming

navigate to the folder of your consuming project and run one of the following commands.

_published:_

```
npm install prometheos-client@1.0.0 --save
```

_unPublished (not recommended):_

```
npm install PATH_TO_GENERATED_PACKAGE --save
```

### Documentation for API Endpoints

All URIs are relative to *http://localhost*

Class | Method | HTTP request | Description
------------ | ------------- | ------------- | -------------
*SystemApi* | [**dialogOpenDialog**](docs/SystemApi.md#dialogopendialog) | **POST** /api/dialog/openDialog | Open Dialog
*SystemApi* | [**eventListEvents**](docs/SystemApi.md#eventlistevents) | **POST** /api/event/listEvents | List Events
*SystemApi* | [**launcherKillApp**](docs/SystemApi.md#launcherkillapp) | **POST** /api/launcher/killApp | Kill App
*SystemApi* | [**launcherLaunchApp**](docs/SystemApi.md#launcherlaunchapp) | **POST** /api/launcher/launchApp | Launch App
*SystemApi* | [**launcherNotify**](docs/SystemApi.md#launchernotify) | **POST** /api/launcher/notify | Notify
*SystemApi* | [**onEventWaitForEvent**](docs/SystemApi.md#oneventwaitforevent) | **POST** /api/onEvent/waitForEvent | Wait For Event


### Documentation For Models

 - [DialogOpenDialogRequest](docs/DialogOpenDialogRequest.md)
 - [LauncherKillAppRequest](docs/LauncherKillAppRequest.md)
 - [LauncherLaunchApp200Response](docs/LauncherLaunchApp200Response.md)
 - [LauncherLaunchApp400Response](docs/LauncherLaunchApp400Response.md)
 - [LauncherLaunchAppRequest](docs/LauncherLaunchAppRequest.md)
 - [LauncherNotifyRequest](docs/LauncherNotifyRequest.md)
 - [OnEventWaitForEventRequest](docs/OnEventWaitForEventRequest.md)


<a id="documentation-for-authorization"></a>
## Documentation For Authorization

Endpoints do not require authorization.

