# LauncherKillAppRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**app_id** | **str** | The ID of the app to close | 

## Example

```python
from prometheos_client.models.launcher_kill_app_request import LauncherKillAppRequest

# TODO update the JSON string below
json = "{}"
# create an instance of LauncherKillAppRequest from a JSON string
launcher_kill_app_request_instance = LauncherKillAppRequest.from_json(json)
# print the JSON string representation of the object
print(LauncherKillAppRequest.to_json())

# convert the object into a dict
launcher_kill_app_request_dict = launcher_kill_app_request_instance.to_dict()
# create an instance of LauncherKillAppRequest from a dict
launcher_kill_app_request_from_dict = LauncherKillAppRequest.from_dict(launcher_kill_app_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


