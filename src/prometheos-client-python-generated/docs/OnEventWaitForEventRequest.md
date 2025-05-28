# OnEventWaitForEventRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**event_id** | **str** | The name of the event to wait for | 
**timeout** | **float** | Timeout in milliseconds (optional, default is infinite) | [optional] 

## Example

```python
from prometheos_client.models.on_event_wait_for_event_request import OnEventWaitForEventRequest

# TODO update the JSON string below
json = "{}"
# create an instance of OnEventWaitForEventRequest from a JSON string
on_event_wait_for_event_request_instance = OnEventWaitForEventRequest.from_json(json)
# print the JSON string representation of the object
print(OnEventWaitForEventRequest.to_json())

# convert the object into a dict
on_event_wait_for_event_request_dict = on_event_wait_for_event_request_instance.to_dict()
# create an instance of OnEventWaitForEventRequest from a dict
on_event_wait_for_event_request_from_dict = OnEventWaitForEventRequest.from_dict(on_event_wait_for_event_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


