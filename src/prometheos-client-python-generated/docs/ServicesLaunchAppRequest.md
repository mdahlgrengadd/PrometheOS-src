# ServicesLaunchAppRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**app_id** | **str** | The ID of the app to launch | 

## Example

```python
from prometheos_client.models.services_launch_app_request import ServicesLaunchAppRequest

# TODO update the JSON string below
json = "{}"
# create an instance of ServicesLaunchAppRequest from a JSON string
services_launch_app_request_instance = ServicesLaunchAppRequest.from_json(json)
# print the JSON string representation of the object
print(ServicesLaunchAppRequest.to_json())

# convert the object into a dict
services_launch_app_request_dict = services_launch_app_request_instance.to_dict()
# create an instance of ServicesLaunchAppRequest from a dict
services_launch_app_request_from_dict = ServicesLaunchAppRequest.from_dict(services_launch_app_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


