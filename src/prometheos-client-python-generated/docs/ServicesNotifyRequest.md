# ServicesNotifyRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**message** | **str** | The notification message to display | 
**type** | **str** | Notification engine to use | [optional] 

## Example

```python
from prometheos_client.models.services_notify_request import ServicesNotifyRequest

# TODO update the JSON string below
json = "{}"
# create an instance of ServicesNotifyRequest from a JSON string
services_notify_request_instance = ServicesNotifyRequest.from_json(json)
# print the JSON string representation of the object
print(ServicesNotifyRequest.to_json())

# convert the object into a dict
services_notify_request_dict = services_notify_request_instance.to_dict()
# create an instance of ServicesNotifyRequest from a dict
services_notify_request_from_dict = ServicesNotifyRequest.from_dict(services_notify_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


