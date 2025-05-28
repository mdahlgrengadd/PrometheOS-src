# ServicesOpen400Response


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**success** | **bool** | Operation failed | [optional] 
**error** | **str** | Error message | [optional] 

## Example

```python
from prometheos_client.models.services_open400_response import ServicesOpen400Response

# TODO update the JSON string below
json = "{}"
# create an instance of ServicesOpen400Response from a JSON string
services_open400_response_instance = ServicesOpen400Response.from_json(json)
# print the JSON string representation of the object
print(ServicesOpen400Response.to_json())

# convert the object into a dict
services_open400_response_dict = services_open400_response_instance.to_dict()
# create an instance of ServicesOpen400Response from a dict
services_open400_response_from_dict = ServicesOpen400Response.from_dict(services_open400_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


