# ServicesKillAppRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**app_id** | **str** | The ID of the app to close | 

## Example

```python
from prometheos_client.models.services_kill_app_request import ServicesKillAppRequest

# TODO update the JSON string below
json = "{}"
# create an instance of ServicesKillAppRequest from a JSON string
services_kill_app_request_instance = ServicesKillAppRequest.from_json(json)
# print the JSON string representation of the object
print(ServicesKillAppRequest.to_json())

# convert the object into a dict
services_kill_app_request_dict = services_kill_app_request_instance.to_dict()
# create an instance of ServicesKillAppRequest from a dict
services_kill_app_request_from_dict = ServicesKillAppRequest.from_dict(services_kill_app_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


