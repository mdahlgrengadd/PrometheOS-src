# LauncherLaunchAppRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**app_id** | **str** | The ID of the app to launch | 

## Example

```python
from prometheos_client.models.launcher_launch_app_request import LauncherLaunchAppRequest

# TODO update the JSON string below
json = "{}"
# create an instance of LauncherLaunchAppRequest from a JSON string
launcher_launch_app_request_instance = LauncherLaunchAppRequest.from_json(json)
# print the JSON string representation of the object
print(LauncherLaunchAppRequest.to_json())

# convert the object into a dict
launcher_launch_app_request_dict = launcher_launch_app_request_instance.to_dict()
# create an instance of LauncherLaunchAppRequest from a dict
launcher_launch_app_request_from_dict = LauncherLaunchAppRequest.from_dict(launcher_launch_app_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


