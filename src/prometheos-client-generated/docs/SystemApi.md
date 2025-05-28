# SystemApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**servicesKillApp**](#serviceskillapp) | **POST** /api/services/killApp | Kill App|
|[**servicesLaunchApp**](#serviceslaunchapp) | **POST** /api/services/launchApp | Launch App|
|[**servicesListEvents**](#serviceslistevents) | **POST** /api/services/listEvents | List Events|
|[**servicesNotify**](#servicesnotify) | **POST** /api/services/notify | Notify|
|[**servicesOpenDialog**](#servicesopendialog) | **POST** /api/services/openDialog | Open Dialog|
|[**servicesWaitForEvent**](#serviceswaitforevent) | **POST** /api/services/waitForEvent | Wait For Event|

# **servicesKillApp**
> ServicesLaunchApp200Response servicesKillApp(servicesKillAppRequest)

Closes an app by its ID

### Example

```typescript
import {
    SystemApi,
    Configuration,
    ServicesKillAppRequest
} from 'prometheos-client';

const configuration = new Configuration();
const apiInstance = new SystemApi(configuration);

let servicesKillAppRequest: ServicesKillAppRequest; //

const { status, data } = await apiInstance.servicesKillApp(
    servicesKillAppRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **servicesKillAppRequest** | **ServicesKillAppRequest**|  | |


### Return type

**ServicesLaunchApp200Response**

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

# **servicesLaunchApp**
> ServicesLaunchApp200Response servicesLaunchApp(servicesLaunchAppRequest)

Launch an app by its ID

### Example

```typescript
import {
    SystemApi,
    Configuration,
    ServicesLaunchAppRequest
} from 'prometheos-client';

const configuration = new Configuration();
const apiInstance = new SystemApi(configuration);

let servicesLaunchAppRequest: ServicesLaunchAppRequest; //

const { status, data } = await apiInstance.servicesLaunchApp(
    servicesLaunchAppRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **servicesLaunchAppRequest** | **ServicesLaunchAppRequest**|  | |


### Return type

**ServicesLaunchApp200Response**

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

# **servicesListEvents**
> ServicesLaunchApp200Response servicesListEvents()

Returns all known event names

### Example

```typescript
import {
    SystemApi,
    Configuration
} from 'prometheos-client';

const configuration = new Configuration();
const apiInstance = new SystemApi(configuration);

const { status, data } = await apiInstance.servicesListEvents();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**ServicesLaunchApp200Response**

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

# **servicesNotify**
> ServicesLaunchApp200Response servicesNotify(servicesNotifyRequest)

Show a notification on screen

### Example

```typescript
import {
    SystemApi,
    Configuration,
    ServicesNotifyRequest
} from 'prometheos-client';

const configuration = new Configuration();
const apiInstance = new SystemApi(configuration);

let servicesNotifyRequest: ServicesNotifyRequest; //

const { status, data } = await apiInstance.servicesNotify(
    servicesNotifyRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **servicesNotifyRequest** | **ServicesNotifyRequest**|  | |


### Return type

**ServicesLaunchApp200Response**

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

# **servicesOpenDialog**
> ServicesLaunchApp200Response servicesOpenDialog(servicesOpenDialogRequest)

Opens a confirmation dialog and returns whether the user confirmed

### Example

```typescript
import {
    SystemApi,
    Configuration,
    ServicesOpenDialogRequest
} from 'prometheos-client';

const configuration = new Configuration();
const apiInstance = new SystemApi(configuration);

let servicesOpenDialogRequest: ServicesOpenDialogRequest; //

const { status, data } = await apiInstance.servicesOpenDialog(
    servicesOpenDialogRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **servicesOpenDialogRequest** | **ServicesOpenDialogRequest**|  | |


### Return type

**ServicesLaunchApp200Response**

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

# **servicesWaitForEvent**
> ServicesLaunchApp200Response servicesWaitForEvent(servicesWaitForEventRequest)

Waits for the specified event to be emitted or until the timeout is reached

### Example

```typescript
import {
    SystemApi,
    Configuration,
    ServicesWaitForEventRequest
} from 'prometheos-client';

const configuration = new Configuration();
const apiInstance = new SystemApi(configuration);

let servicesWaitForEventRequest: ServicesWaitForEventRequest; //

const { status, data } = await apiInstance.servicesWaitForEvent(
    servicesWaitForEventRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **servicesWaitForEventRequest** | **ServicesWaitForEventRequest**|  | |


### Return type

**ServicesLaunchApp200Response**

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

