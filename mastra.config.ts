import { createMastra } from '@mastra/core';

export default createMastra({
  server: {
    host: '0.0.0.0', // Tüm IP adreslerinde dinle
    port: 4111,
  },
});
