# ServicesKillRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**app_id** | **str** | The ID of the app to close | 

## Example

```python
from prometheos_client.models.services_kill_request import ServicesKillRequest

# TODO update the JSON string below
json = "{}"
# create an instance of ServicesKillRequest from a JSON string
services_kill_request_instance = ServicesKillRequest.from_json(json)
# print the JSON string representation of the object
print(ServicesKillRequest.to_json())

# convert the object into a dict
services_kill_request_dict = services_kill_request_instance.to_dict()
# create an instance of ServicesKillRequest from a dict
services_kill_request_from_dict = ServicesKillRequest.from_dict(services_kill_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


