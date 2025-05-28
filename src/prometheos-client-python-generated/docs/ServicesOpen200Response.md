# ServicesOpen200Response


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**success** | **bool** | Whether the operation was successful | [optional] 
**data** | **object** | Result data from the operation | [optional] 

## Example

```python
from prometheos_client.models.services_open200_response import ServicesOpen200Response

# TODO update the JSON string below
json = "{}"
# create an instance of ServicesOpen200Response from a JSON string
services_open200_response_instance = ServicesOpen200Response.from_json(json)
# print the JSON string representation of the object
print(ServicesOpen200Response.to_json())

# convert the object into a dict
services_open200_response_dict = services_open200_response_instance.to_dict()
# create an instance of ServicesOpen200Response from a dict
services_open200_response_from_dict = ServicesOpen200Response.from_dict(services_open200_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


