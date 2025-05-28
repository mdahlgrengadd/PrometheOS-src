# LauncherLaunchApp400Response


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**success** | **bool** | Operation failed | [optional] 
**error** | **str** | Error message | [optional] 

## Example

```python
from prometheos_client.models.launcher_launch_app400_response import LauncherLaunchApp400Response

# TODO update the JSON string below
json = "{}"
# create an instance of LauncherLaunchApp400Response from a JSON string
launcher_launch_app400_response_instance = LauncherLaunchApp400Response.from_json(json)
# print the JSON string representation of the object
print(LauncherLaunchApp400Response.to_json())

# convert the object into a dict
launcher_launch_app400_response_dict = launcher_launch_app400_response_instance.to_dict()
# create an instance of LauncherLaunchApp400Response from a dict
launcher_launch_app400_response_from_dict = LauncherLaunchApp400Response.from_dict(launcher_launch_app400_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


