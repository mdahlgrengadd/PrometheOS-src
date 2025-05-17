import { Plugin } from '../../plugins/types';
import { manifest } from './manifest';
import webllm2-chatContent from './ui';

/**
 * Webllm2-chat plugin
 */
const webllm2-chatPlugin: Plugin = {
  id: manifest.id,
  manifest,
  init: async () => {
    console.log("Webllm2-chat plugin initialized");
  },
  render: () => {
    return <webllm2-chatContent />;
  },
  onOpen: () => {
    console.log("Webllm2-chat window opened");
  },
  onClose: () => {
    console.log("Webllm2-chat window closed");
  }
};

export default webllm2-chatPlugin; 