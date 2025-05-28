# SystemApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**dialogOpenDialog**](#dialogopendialog) | **POST** /api/dialog/openDialog | Open Dialog|
|[**eventListEvents**](#eventlistevents) | **POST** /api/event/listEvents | List Events|
|[**launcherKillApp**](#launcherkillapp) | **POST** /api/launcher/killApp | Kill App|
|[**launcherLaunchApp**](#launcherlaunchapp) | **POST** /api/launcher/launchApp | Launch App|
|[**launcherNotify**](#launchernotify) | **POST** /api/launcher/notify | Notify|
|[**onEventWaitForEvent**](#oneventwaitforevent) | **POST** /api/onEvent/waitForEvent | Wait For Event|

# **dialogOpenDialog**
> LauncherLaunchApp200Response dialogOpenDialog(dialogOpenDialogRequest)

Opens a confirmation dialog and returns whether the user confirmed

### Example

```typescript
import {
    SystemApi,
    Configuration,
    DialogOpenDialogRequest
} from 'prometheos-client';

const configuration = new Configuration();
const apiInstance = new SystemApi(configuration);

let dialogOpenDialogRequest: DialogOpenDialogRequest; //

const { status, data } = await apiInstance.dialogOpenDialog(
    dialogOpenDialogRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **dialogOpenDialogRequest** | **DialogOpenDialogRequest**|  | |


### Return type

**LauncherLaunchApp200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful operation |  -  |
|**400** | Error response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **eventListEvents**
> LauncherLaunchApp200Response eventListEvents()

Returns all known event names

### Example

```typescript
import {
    SystemApi,
    Configuration
} from 'prometheos-client';

const configuration = new Configuration();
const apiInstance = new SystemApi(configuration);

const { status, data } = await apiInstance.eventListEvents();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**LauncherLaunchApp200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful operation |  -  |
|**400** | Error response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **launcherKillApp**
> LauncherLaunchApp200Response launcherKillApp(launcherKillAppRequest)

Closes an app by its ID

### Example

```typescript
import {
    SystemApi,
    Configuration,
    LauncherKillAppRequest
} from 'prometheos-client';

const configuration = new Configuration();
const apiInstance = new SystemApi(configuration);

let launcherKillAppRequest: LauncherKillAppRequest; //

const { status, data } = await apiInstance.launcherKillApp(
    launcherKillAppRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **launcherKillAppRequest** | **LauncherKillAppRequest**|  | |


### Return type

**LauncherLaunchApp200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful operation |  -  |
|**400** | Error response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **launcherLaunchApp**
> LauncherLaunchApp200Response launcherLaunchApp(launcherLaunchAppRequest)

Launch an app by its ID

### Example

```typescript
import {
    SystemApi,
    Configuration,
    LauncherLaunchAppRequest
} from 'prometheos-client';

const configuration = new Configuration();
const apiInstance = new SystemApi(configuration);

let launcherLaunchAppRequest: LauncherLaunchAppRequest; //

const { status, data } = await apiInstance.launcherLaunchApp(
    launcherLaunchAppRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **launcherLaunchAppRequest** | **LauncherLaunchAppRequest**|  | |


### Return type

**LauncherLaunchApp200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful operation |  -  |
|**400** | Error response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **launcherNotify**
> LauncherLaunchApp200Response launcherNotify(launcherNotifyRequest)

Show a notification on screen

### Example

```typescript
import {
    SystemApi,
    Configuration,
    LauncherNotifyRequest
} from 'prometheos-client';

const configuration = new Configuration();
const apiInstance = new SystemApi(configuration);

let launcherNotifyRequest: LauncherNotifyRequest; //

const { status, data } = await apiInstance.launcherNotify(
    launcherNotifyRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **launcherNotifyRequest** | **LauncherNotifyRequest**|  | |


### Return type

**LauncherLaunchApp200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful operation |  -  |
|**400** | Error response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **onEventWaitForEvent**
> LauncherLaunchApp200Response onEventWaitForEvent(onEventWaitForEventRequest)

Waits for the specified event to be emitted or until the timeout is reached

### Example

```typescript
import {
    SystemApi,
    Configuration,
    OnEventWaitForEventRequest
} from 'prometheos-client';

const configuration = new Configuration();
const apiInstance = new SystemApi(configuration);

let onEventWaitForEventRequest: OnEventWaitForEventRequest; //

const { status, data } = await apiInstance.onEventWaitForEvent(
    onEventWaitForEventRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **onEventWaitForEventRequest** | **OnEventWaitForEventRequest**|  | |


### Return type

**LauncherLaunchApp200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful operation |  -  |
|**400** | Error response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

