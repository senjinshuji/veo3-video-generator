import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { generateVideo } from './index.js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*"
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Generate unique task ID
function generateTaskId() {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// API endpoint for video generation
app.post('/api/generate', upload.single('image'), async (req, res) => {
    try {
        const { prompt, duration = 'short', aspectRatio = '16:9' } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }
        
        const taskId = generateTaskId();
        const options = { duration, aspectRatio };
        
        // Handle image upload
        if (req.file) {
            const tempPath = join(__dirname, 'temp', `${taskId}.${req.file.mimetype.split('/')[1]}`);
            await writeFileSync(tempPath, req.file.buffer);
            options.imagePath = tempPath;
        }
        
        // Send initial response
        res.json({ taskId, message: 'Video generation started' });
        
        // Start video generation in background
        generateVideoWithProgress(taskId, prompt, options, io);
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Generate video with progress updates
async function generateVideoWithProgress(taskId, prompt, options, io) {
    try {
        io.emit(`progress-${taskId}`, { 
            progress: 10, 
            message: '動画生成を開始しています...' 
        });
        
        // Custom progress handler
        const customOptions = {
            ...options,
            onProgress: (progress) => {
                io.emit(`progress-${taskId}`, { 
                    progress: 10 + (progress * 0.8), 
                    message: `処理中... ${Math.round(progress)}%` 
                });
            }
        };
        
        const result = await generateVideo(prompt, customOptions);
        
        io.emit(`progress-${taskId}`, { 
            progress: 95, 
            message: '動画を準備しています...' 
        });
        
        // Clean up temp file if exists
        if (options.imagePath && existsSync(options.imagePath)) {
            unlinkSync(options.imagePath);
        }
        
        io.emit(`complete-${taskId}`, {
            videoUrl: result.video.url,
            message: 'Video generation completed'
        });
        
    } catch (error) {
        console.error('Video generation error:', error);
        io.emit(`error-${taskId}`, {
            message: error.message || 'Video generation failed'
        });
        
        // Clean up temp file on error
        if (options.imagePath && existsSync(options.imagePath)) {
            unlinkSync(options.imagePath);
        }
    }
}

// Socket.io connection
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Create temp directory
import { mkdirSync, existsSync, unlinkSync, writeFileSync } from 'fs';
const tempDir = join(__dirname, 'temp');
if (!existsSync(tempDir)) {
    mkdirSync(tempDir);
}

// Start server
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Important for Render deployment
httpServer.listen(PORT, HOST, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📁 Serving from ${join(__dirname, 'public')}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});