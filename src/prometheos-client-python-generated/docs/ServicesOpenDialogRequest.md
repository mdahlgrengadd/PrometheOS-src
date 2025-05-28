# ServicesOpenDialogRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**title** | **str** | Dialog title | 
**description** | **str** | Dialog description | [optional] 
**confirm_label** | **str** | Confirm button label | [optional] 
**cancel_label** | **str** | Cancel button label | [optional] 

## Example

```python
from prometheos_client.models.services_open_dialog_request import ServicesOpenDialogRequest

# TODO update the JSON string below
json = "{}"
# create an instance of ServicesOpenDialogRequest from a JSON string
services_open_dialog_request_instance = ServicesOpenDialogRequest.from_json(json)
# print the JSON string representation of the object
print(ServicesOpenDialogRequest.to_json())

# convert the object into a dict
services_open_dialog_request_dict = services_open_dialog_request_instance.to_dict()
# create an instance of ServicesOpenDialogRequest from a dict
services_open_dialog_request_from_dict = ServicesOpenDialogRequest.from_dict(services_open_dialog_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


