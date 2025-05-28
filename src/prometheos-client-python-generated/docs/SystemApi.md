# prometheos_client.SystemApi

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**services_kill**](SystemApi.md#services_kill) | **POST** /api/services/kill | Kill App
[**services_list_events**](SystemApi.md#services_list_events) | **POST** /api/services/listEvents | List Events
[**services_notify**](SystemApi.md#services_notify) | **POST** /api/services/notify | Notify
[**services_open**](SystemApi.md#services_open) | **POST** /api/services/open | Open App
[**services_open_dialog**](SystemApi.md#services_open_dialog) | **POST** /api/services/openDialog | Open Dialog
[**services_restart**](SystemApi.md#services_restart) | **POST** /api/services/restart | Restart App
[**services_wait_for_event**](SystemApi.md#services_wait_for_event) | **POST** /api/services/waitForEvent | Wait For Event


# **services_kill**
> ServicesOpen200Response services_kill(services_kill_request)

Kill App

Closes an app by its ID

### Example


```python
import prometheos_client
from prometheos_client.models.services_kill_request import ServicesKillRequest
from prometheos_client.models.services_open200_response import ServicesOpen200Response
from prometheos_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost
# See configuration.py for a list of all supported configuration parameters.
configuration = prometheos_client.Configuration(
    host = "http://localhost"
)


# Enter a context with an instance of the API client
async with prometheos_client.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = prometheos_client.SystemApi(api_client)
    services_kill_request = prometheos_client.ServicesKillRequest() # ServicesKillRequest | 

    try:
        # Kill App
        api_response = await api_instance.services_kill(services_kill_request)
        print("The response of SystemApi->services_kill:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling SystemApi->services_kill: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **services_kill_request** | [**ServicesKillRequest**](ServicesKillRequest.md)|  | 

### Return type

[**ServicesOpen200Response**](ServicesOpen200Response.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Successful operation |  -  |
**400** | Error response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **services_list_events**
> ServicesOpen200Response services_list_events()

List Events

Returns all known event names

### Example


```python
import prometheos_client
from prometheos_client.models.services_open200_response import ServicesOpen200Response
from prometheos_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost
# See configuration.py for a list of all supported configuration parameters.
configuration = prometheos_client.Configuration(
    host = "http://localhost"
)


# Enter a context with an instance of the API client
async with prometheos_client.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = prometheos_client.SystemApi(api_client)

    try:
        # List Events
        api_response = await api_instance.services_list_events()
        print("The response of SystemApi->services_list_events:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling SystemApi->services_list_events: %s\n" % e)
```



### Parameters

This endpoint does not need any parameter.

### Return type

[**ServicesOpen200Response**](ServicesOpen200Response.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Successful operation |  -  |
**400** | Error response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **services_notify**
> ServicesOpen200Response services_notify(services_notify_request)

Notify

Show a notification on screen

### Example


```python
import prometheos_client
from prometheos_client.models.services_notify_request import ServicesNotifyRequest
from prometheos_client.models.services_open200_response import ServicesOpen200Response
from prometheos_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost
# See configuration.py for a list of all supported configuration parameters.
configuration = prometheos_client.Configuration(
    host = "http://localhost"
)


# Enter a context with an instance of the API client
async with prometheos_client.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = prometheos_client.SystemApi(api_client)
    services_notify_request = prometheos_client.ServicesNotifyRequest() # ServicesNotifyRequest | 

    try:
        # Notify
        api_response = await api_instance.services_notify(services_notify_request)
        print("The response of SystemApi->services_notify:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling SystemApi->services_notify: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **services_notify_request** | [**ServicesNotifyRequest**](ServicesNotifyRequest.md)|  | 

### Return type

[**ServicesOpen200Response**](ServicesOpen200Response.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Successful operation |  -  |
**400** | Error response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **services_open**
> ServicesOpen200Response services_open(services_open_request)

Open App

Launch an app by its ID

### Example


```python
import prometheos_client
from prometheos_client.models.services_open200_response import ServicesOpen200Response
from prometheos_client.models.services_open_request import ServicesOpenRequest
from prometheos_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost
# See configuration.py for a list of all supported configuration parameters.
configuration = prometheos_client.Configuration(
    host = "http://localhost"
)


# Enter a context with an instance of the API client
async with prometheos_client.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = prometheos_client.SystemApi(api_client)
    services_open_request = prometheos_client.ServicesOpenRequest() # ServicesOpenRequest | 

    try:
        # Open App
        api_response = await api_instance.services_open(services_open_request)
        print("The response of SystemApi->services_open:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling SystemApi->services_open: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **services_open_request** | [**ServicesOpenRequest**](ServicesOpenRequest.md)|  | 

### Return type

[**ServicesOpen200Response**](ServicesOpen200Response.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Successful operation |  -  |
**400** | Error response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **services_open_dialog**
> ServicesOpen200Response services_open_dialog(services_open_dialog_request)

Open Dialog

Opens a confirmation dialog and returns whether the user confirmed

### Example


```python
import prometheos_client
from prometheos_client.models.services_open200_response import ServicesOpen200Response
from prometheos_client.models.services_open_dialog_request import ServicesOpenDialogRequest
from prometheos_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost
# See configuration.py for a list of all supported configuration parameters.
configuration = prometheos_client.Configuration(
    host = "http://localhost"
)


# Enter a context with an instance of the API client
async with prometheos_client.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = prometheos_client.SystemApi(api_client)
    services_open_dialog_request = prometheos_client.ServicesOpenDialogRequest() # ServicesOpenDialogRequest | 

    try:
        # Open Dialog
        api_response = await api_instance.services_open_dialog(services_open_dialog_request)
        print("The response of SystemApi->services_open_dialog:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling SystemApi->services_open_dialog: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **services_open_dialog_request** | [**ServicesOpenDialogRequest**](ServicesOpenDialogRequest.md)|  | 

### Return type

[**ServicesOpen200Response**](ServicesOpen200Response.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Successful operation |  -  |
**400** | Error response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **services_restart**
> ServicesOpen200Response services_restart(services_restart_request)

Restart App

Restarts an app by closing and reopening it

### Example


```python
import prometheos_client
from prometheos_client.models.services_open200_response import ServicesOpen200Response
from prometheos_client.models.services_restart_request import ServicesRestartRequest
from prometheos_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost
# See configuration.py for a list of all supported configuration parameters.
configuration = prometheos_client.Configuration(
    host = "http://localhost"
)


# Enter a context with an instance of the API client
async with prometheos_client.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = prometheos_client.SystemApi(api_client)
    services_restart_request = prometheos_client.ServicesRestartRequest() # ServicesRestartRequest | 

    try:
        # Restart App
        api_response = await api_instance.services_restart(services_restart_request)
        print("The response of SystemApi->services_restart:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling SystemApi->services_restart: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **services_restart_request** | [**ServicesRestartRequest**](ServicesRestartRequest.md)|  | 

### Return type

[**ServicesOpen200Response**](ServicesOpen200Response.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Successful operation |  -  |
**400** | Error response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **services_wait_for_event**
> ServicesOpen200Response services_wait_for_event(services_wait_for_event_request)

Wait For Event

Waits for the specified event to be emitted or until the timeout is reached

### Example


```python
import prometheos_client
from prometheos_client.models.services_open200_response import ServicesOpen200Response
from prometheos_client.models.services_wait_for_event_request import ServicesWaitForEventRequest
from prometheos_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost
# See configuration.py for a list of all supported configuration parameters.
configuration = prometheos_client.Configuration(
    host = "http://localhost"
)


# Enter a context with an instance of the API client
async with prometheos_client.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = prometheos_client.SystemApi(api_client)
    services_wait_for_event_request = prometheos_client.ServicesWaitForEventRequest() # ServicesWaitForEventRequest | 

    try:
        # Wait For Event
        api_response = await api_instance.services_wait_for_event(services_wait_for_event_request)
        print("The response of SystemApi->services_wait_for_event:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling SystemApi->services_wait_for_event: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **services_wait_for_event_request** | [**ServicesWaitForEventRequest**](ServicesWaitForEventRequest.md)|  | 

### Return type

[**ServicesOpen200Response**](ServicesOpen200Response.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Successful operation |  -  |
**400** | Error response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

