# ServicesWaitForEventRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**event_id** | **str** | The name of the event to wait for | 
**timeout** | **float** | Timeout in milliseconds (optional, default is infinite) | [optional] 

## Example

```python
from prometheos_client.models.services_wait_for_event_request import ServicesWaitForEventRequest

# TODO update the JSON string below
json = "{}"
# create an instance of ServicesWaitForEventRequest from a JSON string
services_wait_for_event_request_instance = ServicesWaitForEventRequest.from_json(json)
# print the JSON string representation of the object
print(ServicesWaitForEventRequest.to_json())

# convert the object into a dict
services_wait_for_event_request_dict = services_wait_for_event_request_instance.to_dict()
# create an instance of ServicesWaitForEventRequest from a dict
services_wait_for_event_request_from_dict = ServicesWaitForEventRequest.from_dict(services_wait_for_event_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


