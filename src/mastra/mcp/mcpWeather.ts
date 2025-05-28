import { z } from 'zod';

// Basit Vercel-style tool
const getWeatherTool = {
  id: 'get_weather',
  description: 'Get live weather temperature for a given latitude and longitude',
  parameters: z.object({
    latitude: z.number().describe('The latitude coordinate'),
    longitude: z.number().describe('The longitude coordinate'),
  }),
  execute: async ({ latitude, longitude }: { latitude: number; longitude: number }) => {
    console.log(`🔍 Vercel Tool execute called with: lat=${latitude}, lon=${longitude}`);

    try {
      console.log(`🌤️ Weather API çağrısı: lat=${latitude}, lon=${longitude}`);

      // OpenMeteo API'sini kullan (ücretsiz ve güvenilir)
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`;
      console.log(`🌐 API URL: ${url}`);

      const response = await fetch(url);
      console.log(`📡 Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`❌ API Error: ${errorText}`);
        return `Failed to fetch weather data: ${response.status} ${response.statusText}`;
      }

      const data = await response.json();
      console.log(`📊 API Response:`, JSON.stringify(data, null, 2));

      // OpenMeteo yanıtını işle
      if (data.current_weather && typeof data.current_weather.temperature === 'number') {
        console.log(`🌡️ Temperature found: ${data.current_weather.temperature}°C`);
        return `İstanbul'da şu anda ${data.current_weather.temperature}°C sıcaklık var.`;
      } else {
        console.log(`❌ Unexpected response format:`, data);
        return 'Unexpected response format from weather service';
      }
    } catch (error) {
      console.log(`💥 Network error:`, error);
      return `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
};

// MCP interface
export const mcp = {
  async getTools() {
    return {
      get_weather: getWeatherTool,
    };
  }
};
