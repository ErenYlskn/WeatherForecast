
import { Mastra } from '@mastra/core';
import { weatherAgent } from './agents';
import { weatherTools } from './tools';

export const mastra = new Mastra({
  agents: {
    'Weather Agent': weatherAgent,
  },
});