const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Routes
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { effects, text } = req.body;
    let processedImage = sharp(req.file.path);

    // Apply effects based on request
    if (effects) {
      if (effects.brightness) {
        processedImage = processedImage.modulate({ brightness: effects.brightness });
      }
      if (effects.contrast) {
        processedImage = processedImage.modulate({ contrast: effects.contrast });
      }
      if (effects.saturation) {
        processedImage = processedImage.modulate({ saturation: effects.saturation });
      }
    }

    // Add text if provided
    if (text) {
      processedImage = processedImage.composite([{
        input: Buffer.from(
          `<svg><text x="50%" y="50%" font-size="24" fill="white" text-anchor="middle">${text}</text></svg>`
        ),
        gravity: 'center'
      }]);
    }

    // Process and save the image
    const outputPath = path.join('uploads', `processed_${Date.now()}.png`);
    await processedImage.toFile(outputPath);

    res.json({ 
      success: true, 
      imageUrl: `/uploads/${path.basename(outputPath)}` 
    });
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ error: 'Error processing image' });
  }
});

// Serve static files
app.use('/uploads', express.static('uploads'));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 
