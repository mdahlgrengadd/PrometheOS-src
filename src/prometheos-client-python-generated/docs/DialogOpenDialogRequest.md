# DialogOpenDialogRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**title** | **str** | Dialog title | 
**description** | **str** | Dialog description | [optional] 
**confirm_label** | **str** | Confirm button label | [optional] 
**cancel_label** | **str** | Cancel button label | [optional] 

## Example

```python
from prometheos_client.models.dialog_open_dialog_request import DialogOpenDialogRequest

# TODO update the JSON string below
json = "{}"
# create an instance of DialogOpenDialogRequest from a JSON string
dialog_open_dialog_request_instance = DialogOpenDialogRequest.from_json(json)
# print the JSON string representation of the object
print(DialogOpenDialogRequest.to_json())

# convert the object into a dict
dialog_open_dialog_request_dict = dialog_open_dialog_request_instance.to_dict()
# create an instance of DialogOpenDialogRequest from a dict
dialog_open_dialog_request_from_dict = DialogOpenDialogRequest.from_dict(dialog_open_dialog_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


