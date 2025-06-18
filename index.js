import { fal } from '@fal-ai/client';
import dotenv from 'dotenv';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

fal.config({
  credentials: process.env.FAL_KEY || process.env.FAL_API_KEY
});

async function generateVideo(prompt, options = {}) {
  const {
    duration = 'short',
    aspectRatio = '16:9',
    outputPath = null,
    imagePath = null
  } = options;

  console.log('🎬 Starting video generation...');
  
  // Convert duration to API format (Veo3 only accepts '8s' for now)
  const apiDuration = '8s';  // Veo3 currently only supports 8 second videos
  
  const input = {
    prompt,
    duration: apiDuration,
    aspect_ratio: aspectRatio
  };

  if (imagePath) {
    console.log(`🖼️  Using image: ${imagePath}`);
    if (!existsSync(imagePath)) {
      throw new Error(`Image file not found: ${imagePath}`);
    }
    
    const imageBuffer = readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';
    input.image_url = `data:${mimeType};base64,${base64Image}`;
  }

  console.log(`📝 Prompt: ${prompt}`);
  console.log(`⏱️  Duration: ${duration}`);
  console.log(`📐 Aspect Ratio: ${aspectRatio}`);

  try {
    const result = await fal.subscribe('fal-ai/veo3', {
      input,
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          console.log(`⏳ Progress: ${update.logs || 'Processing...'}`);
          if (options.onProgress && typeof options.onProgress === 'function') {
            // Check if logs is a string before trying to match
            if (typeof update.logs === 'string') {
              const progressMatch = update.logs.match(/(\d+)%/);
              if (progressMatch) {
                options.onProgress(parseInt(progressMatch[1]));
              }
            } else {
              // Default progress update
              options.onProgress(50);
            }
          }
        }
      }
    });

    console.log('✅ Video generated successfully!');
    console.log('API Response:', JSON.stringify(result, null, 2));
    
    // Handle different response structures
    const videoUrl = result.video?.url || result.url || result.data?.video?.url;
    
    if (!videoUrl) {
      console.error('❌ No video URL found in response');
      throw new Error('Video URL not found in API response');
    }
    
    console.log(`🔗 Video URL: ${videoUrl}`);

    if (outputPath) {
      console.log(`💾 Downloading video to ${outputPath}...`);
      const response = await fetch(videoUrl);
      const buffer = await response.arrayBuffer();
      writeFileSync(outputPath, Buffer.from(buffer));
      console.log(`✅ Video saved to ${outputPath}`);
    }

    // Normalize response format
    return {
      video: {
        url: videoUrl
      },
      ...result
    };
  } catch (error) {
    console.error('❌ Error generating video:', error.message);
    if (error.body && error.body.detail) {
      console.error('Error details:', JSON.stringify(error.body.detail, null, 2));
    }
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
Usage: npm run generate -- "your prompt here" [options]

Options:
  --duration <short|medium|long>  Video duration (default: short)
  --aspect-ratio <16:9|9:16|1:1>  Aspect ratio (default: 16:9)
  --image <path>                   Use image as input for video generation
  --output <path>                  Save video to file

Examples:
  npm run generate -- "A serene lake at sunset with mountains"
  npm run generate -- "Dancing robot in neon city" --duration medium --aspect-ratio 9:16
  npm run generate -- "Underwater coral reef" --output output.mp4
  npm run generate -- "Make the car drive fast" --image car.jpg
  npm run generate -- "Animate this painting" --image artwork.png --duration long
    `);
    process.exit(0);
  }

  const prompt = args[0];
  const options = {};

  for (let i = 1; i < args.length; i += 2) {
    const flag = args[i];
    const value = args[i + 1];

    switch (flag) {
      case '--duration':
        options.duration = value;
        break;
      case '--aspect-ratio':
        options.aspectRatio = value;
        break;
      case '--image':
        options.imagePath = resolve(value);
        break;
      case '--output':
        options.outputPath = value;
        break;
    }
  }

  await generateVideo(prompt, options);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { generateVideo };