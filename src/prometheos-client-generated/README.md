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
*SystemApi* | [**servicesKillApp**](docs/SystemApi.md#serviceskillapp) | **POST** /api/services/killApp | Kill App
*SystemApi* | [**servicesLaunchApp**](docs/SystemApi.md#serviceslaunchapp) | **POST** /api/services/launchApp | Launch App
*SystemApi* | [**servicesListEvents**](docs/SystemApi.md#serviceslistevents) | **POST** /api/services/listEvents | List Events
*SystemApi* | [**servicesNotify**](docs/SystemApi.md#servicesnotify) | **POST** /api/services/notify | Notify
*SystemApi* | [**servicesOpenDialog**](docs/SystemApi.md#servicesopendialog) | **POST** /api/services/openDialog | Open Dialog
*SystemApi* | [**servicesWaitForEvent**](docs/SystemApi.md#serviceswaitforevent) | **POST** /api/services/waitForEvent | Wait For Event


### Documentation For Models

 - [ServicesKillAppRequest](docs/ServicesKillAppRequest.md)
 - [ServicesLaunchApp200Response](docs/ServicesLaunchApp200Response.md)
 - [ServicesLaunchApp400Response](docs/ServicesLaunchApp400Response.md)
 - [ServicesLaunchAppRequest](docs/ServicesLaunchAppRequest.md)
 - [ServicesNotifyRequest](docs/ServicesNotifyRequest.md)
 - [ServicesOpenDialogRequest](docs/ServicesOpenDialogRequest.md)
 - [ServicesWaitForEventRequest](docs/ServicesWaitForEventRequest.md)


<a id="documentation-for-authorization"></a>
## Documentation For Authorization

Endpoints do not require authorization.

