# prometheos_client.SystemApi

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**dialog_open_dialog**](SystemApi.md#dialog_open_dialog) | **POST** /api/dialog/openDialog | Open Dialog
[**event_list_events**](SystemApi.md#event_list_events) | **POST** /api/event/listEvents | List Events
[**launcher_kill_app**](SystemApi.md#launcher_kill_app) | **POST** /api/launcher/killApp | Kill App
[**launcher_launch_app**](SystemApi.md#launcher_launch_app) | **POST** /api/launcher/launchApp | Launch App
[**launcher_notify**](SystemApi.md#launcher_notify) | **POST** /api/launcher/notify | Notify
[**on_event_wait_for_event**](SystemApi.md#on_event_wait_for_event) | **POST** /api/onEvent/waitForEvent | Wait For Event


# **dialog_open_dialog**
> LauncherLaunchApp200Response dialog_open_dialog(dialog_open_dialog_request)

Open Dialog

Opens a confirmation dialog and returns whether the user confirmed

### Example


```python
import prometheos_client
from prometheos_client.models.dialog_open_dialog_request import DialogOpenDialogRequest
from prometheos_client.models.launcher_launch_app200_response import LauncherLaunchApp200Response
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
    dialog_open_dialog_request = prometheos_client.DialogOpenDialogRequest() # DialogOpenDialogRequest | 

    try:
        # Open Dialog
        api_response = await api_instance.dialog_open_dialog(dialog_open_dialog_request)
        print("The response of SystemApi->dialog_open_dialog:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling SystemApi->dialog_open_dialog: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **dialog_open_dialog_request** | [**DialogOpenDialogRequest**](DialogOpenDialogRequest.md)|  | 

### Return type

[**LauncherLaunchApp200Response**](LauncherLaunchApp200Response.md)

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

# **event_list_events**
> LauncherLaunchApp200Response event_list_events()

List Events

Returns all known event names

### Example


```python
import prometheos_client
from prometheos_client.models.launcher_launch_app200_response import LauncherLaunchApp200Response
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
        api_response = await api_instance.event_list_events()
        print("The response of SystemApi->event_list_events:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling SystemApi->event_list_events: %s\n" % e)
```



### Parameters

This endpoint does not need any parameter.

### Return type

[**LauncherLaunchApp200Response**](LauncherLaunchApp200Response.md)

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

# **launcher_kill_app**
> LauncherLaunchApp200Response launcher_kill_app(launcher_kill_app_request)

Kill App

Closes an app by its ID

### Example


```python
import prometheos_client
from prometheos_client.models.launcher_kill_app_request import LauncherKillAppRequest
from prometheos_client.models.launcher_launch_app200_response import LauncherLaunchApp200Response
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
    launcher_kill_app_request = prometheos_client.LauncherKillAppRequest() # LauncherKillAppRequest | 

    try:
        # Kill App
        api_response = await api_instance.launcher_kill_app(launcher_kill_app_request)
        print("The response of SystemApi->launcher_kill_app:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling SystemApi->launcher_kill_app: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **launcher_kill_app_request** | [**LauncherKillAppRequest**](LauncherKillAppRequest.md)|  | 

### Return type

[**LauncherLaunchApp200Response**](LauncherLaunchApp200Response.md)

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

# **launcher_launch_app**
> LauncherLaunchApp200Response launcher_launch_app(launcher_launch_app_request)

Launch App

Launch an app by its ID

### Example


```python
import prometheos_client
from prometheos_client.models.launcher_launch_app200_response import LauncherLaunchApp200Response
from prometheos_client.models.launcher_launch_app_request import LauncherLaunchAppRequest
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
    launcher_launch_app_request = prometheos_client.LauncherLaunchAppRequest() # LauncherLaunchAppRequest | 

    try:
        # Launch App
        api_response = await api_instance.launcher_launch_app(launcher_launch_app_request)
        print("The response of SystemApi->launcher_launch_app:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling SystemApi->launcher_launch_app: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **launcher_launch_app_request** | [**LauncherLaunchAppRequest**](LauncherLaunchAppRequest.md)|  | 

### Return type

[**LauncherLaunchApp200Response**](LauncherLaunchApp200Response.md)

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

# **launcher_notify**
> LauncherLaunchApp200Response launcher_notify(launcher_notify_request)

Notify

Show a notification on screen

### Example


```python
import prometheos_client
from prometheos_client.models.launcher_launch_app200_response import LauncherLaunchApp200Response
from prometheos_client.models.launcher_notify_request import LauncherNotifyRequest
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
    launcher_notify_request = prometheos_client.LauncherNotifyRequest() # LauncherNotifyRequest | 

    try:
        # Notify
        api_response = await api_instance.launcher_notify(launcher_notify_request)
        print("The response of SystemApi->launcher_notify:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling SystemApi->launcher_notify: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **launcher_notify_request** | [**LauncherNotifyRequest**](LauncherNotifyRequest.md)|  | 

### Return type

[**LauncherLaunchApp200Response**](LauncherLaunchApp200Response.md)

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

# **on_event_wait_for_event**
> LauncherLaunchApp200Response on_event_wait_for_event(on_event_wait_for_event_request)

Wait For Event

Waits for the specified event to be emitted or until the timeout is reached

### Example


```python
import prometheos_client
from prometheos_client.models.launcher_launch_app200_response import LauncherLaunchApp200Response
from prometheos_client.models.on_event_wait_for_event_request import OnEventWaitForEventRequest
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
    on_event_wait_for_event_request = prometheos_client.OnEventWaitForEventRequest() # OnEventWaitForEventRequest | 

    try:
        # Wait For Event
        api_response = await api_instance.on_event_wait_for_event(on_event_wait_for_event_request)
        print("The response of SystemApi->on_event_wait_for_event:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling SystemApi->on_event_wait_for_event: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **on_event_wait_for_event_request** | [**OnEventWaitForEventRequest**](OnEventWaitForEventRequest.md)|  | 

### Return type

[**LauncherLaunchApp200Response**](LauncherLaunchApp200Response.md)

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

