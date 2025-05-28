# ServicesRestartRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**app_id** | **str** | The ID of the app to restart | 

## Example

```python
from prometheos_client.models.services_restart_request import ServicesRestartRequest

# TODO update the JSON string below
json = "{}"
# create an instance of ServicesRestartRequest from a JSON string
services_restart_request_instance = ServicesRestartRequest.from_json(json)
# print the JSON string representation of the object
print(ServicesRestartRequest.to_json())

# convert the object into a dict
services_restart_request_dict = services_restart_request_instance.to_dict()
# create an instance of ServicesRestartRequest from a dict
services_restart_request_from_dict = ServicesRestartRequest.from_dict(services_restart_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


