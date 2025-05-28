# ServicesWaitForEventRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**eventId** | **string** | The name of the event to wait for | [default to undefined]
**timeout** | **number** | Timeout in milliseconds (optional, default is infinite) | [optional] [default to undefined]

## Example

```typescript
import { ServicesWaitForEventRequest } from 'prometheos-client';

const instance: ServicesWaitForEventRequest = {
    eventId,
    timeout,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
