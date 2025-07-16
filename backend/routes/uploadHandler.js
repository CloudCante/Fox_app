const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');

console.log('📝 Initializing test route handler...');

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
}).single('file');

// Simple catch endpoint with error handling and file saving
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
        //const fileContent = req.file.buffer.toString('utf-8');
        //console.log('📄 File contents:', fileContent);
        
        console.log('✅ File received successfully:', {
            filename: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype,
            //content: fileContent
        });

        //Transfer file to input for file monitor
        const targetDir = '/home/darvin/Fox_ETL/input/';
        const targetPath = path.join(targetDir, req.file.originalname);

        console.log(`📝 Attempting to save file to: ${targetPath}`);
        fs.writeFile(targetPath, req.file.buffer, (err) => {
            if (err) {
                console.error('❌ Error writing file:', err);
                // Extra logging for permissions or path issues
                if (err.code === 'EACCES') {
                    console.error('❌ Permission denied. Check if the Node.js process has write access to the target directory.');
                }
                if (err.code === 'ENOENT') {
                    console.error('❌ Directory does not exist. Check if the path is correct:', targetDir);
                }
                return res.status(500).json({ message: 'Failed to save file', error: err.message });
            }
            console.log('✅ File saved to:', targetPath);
            res.json({
                message: 'File saved successfully',
                filename: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype,
                //content: fileContent,
                savedTo: targetPath,
                timestamp: new Date().toISOString()
            });
        });
    });
});

console.log('✅ Test route handler initialized');

module.exports = router;