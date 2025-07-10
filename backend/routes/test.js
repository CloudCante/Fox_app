const express = require('express');
const router = express.Router();
const multer = require('multer');

console.log('📝 Initializing test route handler...');

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
}).single('file');

// Simple catch endpoint with error handling
router.post('/catch-file', (req, res) => {
    console.log('📥 Received request to /api/test/catch-file');
    
    upload(req, res, function(err) {
        if (err) {
            console.error('❌ File upload error:', err);
            return res.status(400).json({ 
                message: 'File upload failed',
                error: err.message 
            });
        }

        if (!req.file) {
            console.warn('⚠️ No file received in request');
            return res.status(400).json({ 
                message: 'No file received' 
            });
        }
        
        // Read the file content as text
        const fileContent = req.file.buffer.toString('utf-8');
        console.log('📄 File contents:', fileContent);
        
        console.log('✅ File received successfully:', {
            filename: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype,
            content: fileContent
        });
        
        res.json({
            message: 'File received and read',
            filename: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype,
            content: fileContent,
            timestamp: new Date().toISOString()
        });
    });
});

console.log('✅ Test route handler initialized');

module.exports = router;