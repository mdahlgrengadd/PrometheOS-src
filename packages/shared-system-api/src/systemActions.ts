import { IApiComponent } from '@shared/api-client';

export const systemApiComponent: IApiComponent = {
  id: 'system',
  type: 'service',
  name: 'System API',
  description: 'Core system operations for PrometheOS desktop environment',
  path: '/api/system',
  state: {
    enabled: true,
    visible: true
  },
  actions: [
    {
      id: 'open',
      name: 'Open Application',
      description: 'Launch an application by ID with optional initialization URL',
      available: true,
      parameters: [
        {
          name: 'appId',
          type: 'string',
          required: true,
          description: 'The ID of the application to launch'
        },
        {
          name: 'initFromUrl',
          type: 'string',
          required: false,
          description: 'Optional URL to initialize the application with'
        }
      ]
    },
    {
      id: 'kill',
      name: 'Kill Application',
      description: 'Terminate an application window by window ID',
      available: true,
      parameters: [
        {
          name: 'windowId',
          type: 'string',
          required: true,
          description: 'The window ID of the application to terminate'
        }
      ]
    },
    {
      id: 'notify',
      name: 'Send Notification',
      description: 'Display a system notification using the specified engine',
      available: true,
      parameters: [
        {
          name: 'message',
          type: 'string',
          required: true,
          description: 'The notification message to display'
        },
        {
          name: 'engine',
          type: 'string',
          required: false,
          description: 'The notification engine to use',
          enum: ['toast', 'native', 'system']
        }
      ]
    },
    {
      id: 'dialog',
      name: 'Show Dialog',
      description: 'Display a modal dialog for user interaction',
      available: true,
      parameters: [
        {
          name: 'title',
          type: 'string',
          required: true,
          description: 'The dialog title'
        },
        {
          name: 'message',
          type: 'string',
          required: true,
          description: 'The dialog message content'
        },
        {
          name: 'type',
          type: 'string',
          required: false,
          description: 'The type of dialog to show',
          enum: ['alert', 'confirm', 'prompt']
        }
      ]
    },
    {
      id: 'events.waitFor',
      name: 'Wait for Event',
      description: 'Wait for a specific event to occur with optional timeout',
      available: true,
      parameters: [
        {
          name: 'eventName',
          type: 'string',
          required: true,
          description: 'The name of the event to wait for'
        },
        {
          name: 'timeout',
          type: 'number',
          required: false,
          description: 'Timeout in milliseconds (0 for no timeout)'
        }
      ]
    },
    {
      id: 'events.list',
      name: 'List Events',
      description: 'Get a list of available events in the system',
      available: true,
      parameters: []
    }
  ]
};