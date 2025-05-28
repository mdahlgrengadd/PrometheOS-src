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
*SystemApi* | [**servicesKill**](docs/SystemApi.md#serviceskill) | **POST** /api/services/kill | Kill App
*SystemApi* | [**servicesListEvents**](docs/SystemApi.md#serviceslistevents) | **POST** /api/services/listEvents | List Events
*SystemApi* | [**servicesNotify**](docs/SystemApi.md#servicesnotify) | **POST** /api/services/notify | Notify
*SystemApi* | [**servicesOpen**](docs/SystemApi.md#servicesopen) | **POST** /api/services/open | Open App
*SystemApi* | [**servicesOpenDialog**](docs/SystemApi.md#servicesopendialog) | **POST** /api/services/openDialog | Open Dialog
*SystemApi* | [**servicesRestart**](docs/SystemApi.md#servicesrestart) | **POST** /api/services/restart | Restart App
*SystemApi* | [**servicesWaitForEvent**](docs/SystemApi.md#serviceswaitforevent) | **POST** /api/services/waitForEvent | Wait For Event


### Documentation For Models

 - [ServicesKillRequest](docs/ServicesKillRequest.md)
 - [ServicesNotifyRequest](docs/ServicesNotifyRequest.md)
 - [ServicesOpen200Response](docs/ServicesOpen200Response.md)
 - [ServicesOpen400Response](docs/ServicesOpen400Response.md)
 - [ServicesOpenDialogRequest](docs/ServicesOpenDialogRequest.md)
 - [ServicesOpenRequest](docs/ServicesOpenRequest.md)
 - [ServicesRestartRequest](docs/ServicesRestartRequest.md)
 - [ServicesWaitForEventRequest](docs/ServicesWaitForEventRequest.md)


<a id="documentation-for-authorization"></a>
## Documentation For Authorization

Endpoints do not require authorization.

