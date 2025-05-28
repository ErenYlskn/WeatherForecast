import { createTool } from '@mastra/core';
import { z } from 'zod';

// Weather tool that connects to your Smithery deployment
export const getWeatherTool = createTool({
  id: 'get_weather',
  description: 'Get live weather temperature for a given latitude and longitude using the deployed Smithery weather service',
  inputSchema: z.object({
    latitude: z.number().describe('The latitude coordinate'),
    longitude: z.number().describe('The longitude coordinate'),
  }),
  outputSchema: z.object({
    temperature: z.number().optional().describe('The current temperature'),
    error: z.string().optional().describe('Error message if request failed'),
  }),
  execute: async (context) => {
    const { latitude, longitude } = context;
    try {
      // Connect to your Smithery deployment
      const response = await fetch('https://smithery.ai/server/%40ErenYlskn%2Fweather_app/tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'tools/call',
          params: {
            name: 'get_live_temp',
            arguments: {
              latitude,
              longitude,
            },
          },
        }),
      });

      if (!response.ok) {
        return {
          error: `Failed to fetch weather data: ${response.status} ${response.statusText}`,
        };
      }

      const data = await response.json();

      // Handle the response from your Smithery deployment
      if (data.result && typeof data.result.temperature === 'number') {
        return {
          temperature: data.result.temperature,
        };
      } else if (data.result && data.result.error) {
        return {
          error: data.result.error,
        };
      } else {
        return {
          error: 'Unexpected response format from weather service',
        };
      }
    } catch (error) {
      return {
        error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  },
});

export const weatherTools = [getWeatherTool];
