# ServicesLaunchApp400Response


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**success** | **bool** | Operation failed | [optional] 
**error** | **str** | Error message | [optional] 

## Example

```python
from prometheos_client.models.services_launch_app400_response import ServicesLaunchApp400Response

# TODO update the JSON string below
json = "{}"
# create an instance of ServicesLaunchApp400Response from a JSON string
services_launch_app400_response_instance = ServicesLaunchApp400Response.from_json(json)
# print the JSON string representation of the object
print(ServicesLaunchApp400Response.to_json())

# convert the object into a dict
services_launch_app400_response_dict = services_launch_app400_response_instance.to_dict()
# create an instance of ServicesLaunchApp400Response from a dict
services_launch_app400_response_from_dict = ServicesLaunchApp400Response.from_dict(services_launch_app400_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


