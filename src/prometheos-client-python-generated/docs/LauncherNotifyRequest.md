# LauncherNotifyRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**message** | **str** | The notification message to display | 
**type** | **str** | Notification engine to use | [optional] 

## Example

```python
from prometheos_client.models.launcher_notify_request import LauncherNotifyRequest

# TODO update the JSON string below
json = "{}"
# create an instance of LauncherNotifyRequest from a JSON string
launcher_notify_request_instance = LauncherNotifyRequest.from_json(json)
# print the JSON string representation of the object
print(LauncherNotifyRequest.to_json())

# convert the object into a dict
launcher_notify_request_dict = launcher_notify_request_instance.to_dict()
# create an instance of LauncherNotifyRequest from a dict
launcher_notify_request_from_dict = LauncherNotifyRequest.from_dict(launcher_notify_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


