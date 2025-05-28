# ServicesOpenRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**app_id** | **str** | The ID of the app to launch | 

## Example

```python
from prometheos_client.models.services_open_request import ServicesOpenRequest

# TODO update the JSON string below
json = "{}"
# create an instance of ServicesOpenRequest from a JSON string
services_open_request_instance = ServicesOpenRequest.from_json(json)
# print the JSON string representation of the object
print(ServicesOpenRequest.to_json())

# convert the object into a dict
services_open_request_dict = services_open_request_instance.to_dict()
# create an instance of ServicesOpenRequest from a dict
services_open_request_from_dict = ServicesOpenRequest.from_dict(services_open_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


