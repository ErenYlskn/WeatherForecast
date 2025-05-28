import { mastra } from './mastra';

async function testWeatherAgent() {
  console.log('🌤️  Testing Weather Agent with Smithery Integration');
  console.log('================================================');

  try {
    // Test the weather tool directly
    console.log('\n1. Testing weather tool directly...');
    const { weatherTools } = await import('./mastra/tools');
    const weatherTool = weatherTools[0];

    if (weatherTool) {
      const result = await weatherTool.execute({
        latitude: 40.7128,  // New York City coordinates
        longitude: -74.0060
      });

      console.log('Direct tool result:', result);
    }

    // Test the weather agent
    console.log('\n2. Testing weather agent...');
    const agent = (mastra as any).agents['Weather Agent'];

    if (agent) {
      const response = await agent.generate([
        {
          role: 'user',
          content: 'What is the current temperature at latitude 40.7128 and longitude -74.0060 (New York City)?'
        }
      ]);

      console.log('Agent response:', response);
    }

  } catch (error) {
    console.error('Error testing weather agent:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testWeatherAgent();
}

export { testWeatherAgent };
