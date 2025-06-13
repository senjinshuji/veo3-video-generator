import { generateVideo } from './index.js';

async function runExamples() {
  console.log('🚀 Running Veo3 Video Generator Examples\n');

  const examples = [
    {
      name: 'Nature Scene',
      prompt: 'A peaceful mountain lake at sunrise with mist rising from the water',
      options: { duration: 'short', aspectRatio: '16:9' }
    },
    {
      name: 'Vertical Video',
      prompt: 'Colorful fish swimming in a coral reef',
      options: { duration: 'short', aspectRatio: '9:16' }
    },
    {
      name: 'Square Format',
      prompt: 'Time-lapse of flowers blooming in a garden',
      options: { duration: 'medium', aspectRatio: '1:1' }
    }
  ];

  for (const example of examples) {
    console.log(`\n📹 Example: ${example.name}`);
    console.log(`📝 Prompt: "${example.prompt}"`);
    
    try {
      const result = await generateVideo(example.prompt, example.options);
      console.log(`✅ Success! Video URL: ${result.video.url}`);
    } catch (error) {
      console.error(`❌ Failed: ${error.message}`);
    }
    
    console.log('-'.repeat(50));
  }
}

runExamples().catch(console.error);