# LauncherLaunchApp200Response


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**success** | **bool** | Whether the operation was successful | [optional] 
**data** | **object** | Result data from the operation | [optional] 

## Example

```python
from prometheos_client.models.launcher_launch_app200_response import LauncherLaunchApp200Response

# TODO update the JSON string below
json = "{}"
# create an instance of LauncherLaunchApp200Response from a JSON string
launcher_launch_app200_response_instance = LauncherLaunchApp200Response.from_json(json)
# print the JSON string representation of the object
print(LauncherLaunchApp200Response.to_json())

# convert the object into a dict
launcher_launch_app200_response_dict = launcher_launch_app200_response_instance.to_dict()
# create an instance of LauncherLaunchApp200Response from a dict
launcher_launch_app200_response_from_dict = LauncherLaunchApp200Response.from_dict(launcher_launch_app200_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


