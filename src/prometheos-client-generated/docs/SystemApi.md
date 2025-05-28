# SystemApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**servicesKill**](#serviceskill) | **POST** /api/services/kill | Kill App|
|[**servicesListEvents**](#serviceslistevents) | **POST** /api/services/listEvents | List Events|
|[**servicesNotify**](#servicesnotify) | **POST** /api/services/notify | Notify|
|[**servicesOpen**](#servicesopen) | **POST** /api/services/open | Open App|
|[**servicesOpenDialog**](#servicesopendialog) | **POST** /api/services/openDialog | Open Dialog|
|[**servicesRestart**](#servicesrestart) | **POST** /api/services/restart | Restart App|
|[**servicesWaitForEvent**](#serviceswaitforevent) | **POST** /api/services/waitForEvent | Wait For Event|

# **servicesKill**
> ServicesOpen200Response servicesKill(servicesKillRequest)

Closes an app by its ID

### Example

```typescript
import {
    SystemApi,
    Configuration,
    ServicesKillRequest
} from 'prometheos-client';

const configuration = new Configuration();
const apiInstance = new SystemApi(configuration);

let servicesKillRequest: ServicesKillRequest; //

const { status, data } = await apiInstance.servicesKill(
    servicesKillRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **servicesKillRequest** | **ServicesKillRequest**|  | |


### Return type

**ServicesOpen200Response**

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
> ServicesOpen200Response servicesListEvents()

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

**ServicesOpen200Response**

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
> ServicesOpen200Response servicesNotify(servicesNotifyRequest)

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

**ServicesOpen200Response**

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

# **servicesOpen**
> ServicesOpen200Response servicesOpen(servicesOpenRequest)

Launch an app by its ID

### Example

```typescript
import {
    SystemApi,
    Configuration,
    ServicesOpenRequest
} from 'prometheos-client';

const configuration = new Configuration();
const apiInstance = new SystemApi(configuration);

let servicesOpenRequest: ServicesOpenRequest; //

const { status, data } = await apiInstance.servicesOpen(
    servicesOpenRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **servicesOpenRequest** | **ServicesOpenRequest**|  | |


### Return type

**ServicesOpen200Response**

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
> ServicesOpen200Response servicesOpenDialog(servicesOpenDialogRequest)

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

**ServicesOpen200Response**

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

# **servicesRestart**
> ServicesOpen200Response servicesRestart(servicesRestartRequest)

Restarts an app by closing and reopening it

### Example

```typescript
import {
    SystemApi,
    Configuration,
    ServicesRestartRequest
} from 'prometheos-client';

const configuration = new Configuration();
const apiInstance = new SystemApi(configuration);

let servicesRestartRequest: ServicesRestartRequest; //

const { status, data } = await apiInstance.servicesRestart(
    servicesRestartRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **servicesRestartRequest** | **ServicesRestartRequest**|  | |


### Return type

**ServicesOpen200Response**

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
> ServicesOpen200Response servicesWaitForEvent(servicesWaitForEventRequest)

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

**ServicesOpen200Response**

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

