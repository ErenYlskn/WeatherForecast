import { mastra } from './mastra';
import 'dotenv/config';

async function testWeatherAgent() {
  console.log('Environment check:');
  console.log('GOOGLE_GENERATIVE_AI_API_KEY:', process.env.GOOGLE_GENERATIVE_AI_API_KEY ? 'SET' : 'NOT SET');
  console.log('🌤️  Gemini Flash 2.0 Weather Agent - Smithery Entegrasyonu Testi');
  console.log('==============================================================');

  try {
    // Weather tool'unu doğrudan test et
    console.log('\n1. Weather tool doğrudan test ediliyor...');
    const { weatherTools } = await import('./mastra/tools');
    const weatherTool = weatherTools[0];

    if (weatherTool) {
      console.log('İstanbul koordinatları test ediliyor...');
      const result = await weatherTool.execute({
        latitude: 41.0082,  // İstanbul koordinatları
        longitude: 28.9784
      });

      console.log('Tool sonucu:', result);
    }

    // Weather agent'ı test et
    console.log('\n2. Gemini Flash 2.0 Weather Agent test ediliyor...');
    const agent = (mastra as any).agents['Weather Agent'];

    if (agent) {
      const response = await agent.generate([
        {
          role: 'user',
          content: 'İstanbul\'da şu an hava nasıl? Sıcaklık kaç derece?'
        }
      ]);

      console.log('Gemini Agent yanıtı:', response);

      // İkinci test
      console.log('\n3. Ankara için test...');
      const response2 = await agent.generate([
        {
          role: 'user',
          content: 'Ankara\'nın şu anki sıcaklığını öğrenebilir miyim?'
        }
      ]);

      console.log('Ankara için yanıt:', response2);
    }

  } catch (error) {
    console.error('Weather agent test hatası:', error);
  }
}

// Demo'yu çalıştır
testWeatherAgent();

export { testWeatherAgent };
