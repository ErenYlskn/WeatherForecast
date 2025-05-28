# Weather Agent - Mastra Integration

This is a Mastra-powered weather agent that integrates with your deployed Smithery weather service.

## Features

- 🌤️ **Weather Agent**: An intelligent agent that can provide weather information
- 🔧 **Smithery Integration**: Connects to your deployed weather service at `https://smithery.ai/server/%40ErenYlskn%2Fweather_app/tools`
- 🛠️ **Weather Tool**: Direct tool for fetching temperature data by coordinates
- 🤖 **AI-Powered**: Uses OpenAI GPT-4o-mini for natural language interactions

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Run the demo**:
   ```bash
   npm run demo
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

## Usage

### Using the Weather Tool Directly

```typescript
import { mastra } from './src/mastra';

const weatherTool = mastra.getTool('get_weather');
const result = await weatherTool.execute({
  latitude: 40.7128,  // New York City
  longitude: -74.0060
});
```

### Using the Weather Agent

```typescript
import { mastra } from './src/mastra';

const agent = mastra.getAgent('Weather Agent');
const response = await agent.generate([
  {
    role: 'user',
    content: 'What is the current temperature in New York City?'
  }
]);
```

## Architecture

- **Tools** (`src/mastra/tools/`): Contains the weather tool that connects to your Smithery deployment
- **Agents** (`src/mastra/agents/`): Contains the weather agent with natural language capabilities
- **Main** (`src/mastra/index.ts`): Main Mastra configuration
- **Demo** (`src/demo.ts`): Test script to verify everything works

## Smithery Integration

The weather tool connects to your deployed Smithery service and calls the `get_live_temp` function with latitude and longitude coordinates. The integration handles:

- HTTP requests to your Smithery endpoint
- Error handling and response parsing
- Type-safe input/output schemas

## Next Steps

- Add more weather-related tools (forecasts, alerts, etc.)
- Enhance the agent with location lookup capabilities
- Add more sophisticated error handling
- Deploy the agent to your preferred platform
