const socket = io();
const form = document.getElementById('videoForm');
const imageInput = document.getElementById('image');
const imagePreview = document.getElementById('imagePreview');
const progressDiv = document.getElementById('progress');
const progressFill = document.querySelector('.progress-fill');
const progressText = document.getElementById('progressText');
const resultDiv = document.getElementById('result');
const resultVideo = document.getElementById('resultVideo');
const downloadBtn = document.getElementById('downloadBtn');
const errorDiv = document.getElementById('error');
const errorText = document.getElementById('errorText');
const generateBtn = document.getElementById('generateBtn');

// Image preview
imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    } else {
        imagePreview.innerHTML = '';
    }
});

// Form submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Reset UI
    errorDiv.style.display = 'none';
    resultDiv.style.display = 'none';
    progressDiv.style.display = 'block';
    progressFill.style.width = '0%';
    progressText.textContent = '準備中...';
    generateBtn.disabled = true;
    
    const formData = new FormData(form);
    
    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'エラーが発生しました');
        }
        
        // Track progress with socket
        socket.on(`progress-${data.taskId}`, (update) => {
            if (update.progress) {
                progressFill.style.width = `${update.progress}%`;
            }
            if (update.message) {
                progressText.textContent = update.message;
            }
        });
        
        socket.on(`complete-${data.taskId}`, (result) => {
            progressDiv.style.display = 'none';
            resultDiv.style.display = 'block';
            resultVideo.src = result.videoUrl;
            downloadBtn.href = result.videoUrl;
            generateBtn.disabled = false;
            
            // Clean up socket listeners
            socket.off(`progress-${data.taskId}`);
            socket.off(`complete-${data.taskId}`);
            socket.off(`error-${data.taskId}`);
        });
        
        socket.on(`error-${data.taskId}`, (error) => {
            progressDiv.style.display = 'none';
            errorDiv.style.display = 'block';
            errorText.textContent = error.message || 'エラーが発生しました';
            generateBtn.disabled = false;
            
            // Clean up socket listeners
            socket.off(`progress-${data.taskId}`);
            socket.off(`complete-${data.taskId}`);
            socket.off(`error-${data.taskId}`);
        });
        
    } catch (error) {
        progressDiv.style.display = 'none';
        errorDiv.style.display = 'block';
        errorText.textContent = error.message;
        generateBtn.disabled = false;
    }
});