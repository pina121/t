import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  Slider, 
  TextField, 
  Button,
  ThemeProvider,
  createTheme,
  CssBaseline
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import axios from 'axios';
import './App.css';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
  },
});

function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [effects, setEffects] = useState({
    brightness: 1,
    contrast: 1,
    saturation: 1,
  });
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    multiple: false
  });

  const handleEffectChange = (effect) => (event, value) => {
    setEffects(prev => ({
      ...prev,
      [effect]: value
    }));
  };

  const handleSubmit = async () => {
    if (!image) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('image', image);
    formData.append('effects', JSON.stringify(effects));
    formData.append('text', text);

    try {
      const response = await axios.post('http://localhost:5000/api/upload', formData);
      setResult(response.data.imageUrl);
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h3" component="h1" gutterBottom align="center">
              Dynamic Sticker Maker
            </Typography>
          </motion.div>

          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              mt: 4,
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Box {...getRootProps()} sx={{ 
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'grey.500',
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              cursor: 'pointer',
              mb: 3
            }}>
              <input {...getInputProps()} />
              <Typography>
                {isDragActive
                  ? "Drop the image here..."
                  : "Drag and drop an image here, or click to select"}
              </Typography>
            </Box>

            {preview && (
              <Box sx={{ mb: 3 }}>
                <img 
                  src={preview} 
                  alt="Preview" 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '300px',
                    objectFit: 'contain'
                  }} 
                />
              </Box>
            )}

            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom>Brightness</Typography>
              <Slider
                value={effects.brightness}
                onChange={handleEffectChange('brightness')}
                min={0}
                max={2}
                step={0.1}
                valueLabelDisplay="auto"
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom>Contrast</Typography>
              <Slider
                value={effects.contrast}
                onChange={handleEffectChange('contrast')}
                min={0}
                max={2}
                step={0.1}
                valueLabelDisplay="auto"
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom>Saturation</Typography>
              <Slider
                value={effects.saturation}
                onChange={handleEffectChange('saturation')}
                min={0}
                max={2}
                step={0.1}
                valueLabelDisplay="auto"
              />
            </Box>

            <TextField
              fullWidth
              label="Add Text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              sx={{ mb: 3 }}
            />

            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleSubmit}
              disabled={!image || loading}
            >
              {loading ? 'Processing...' : 'Create Sticker'}
            </Button>

            {result && (
              <Box sx={{ mt: 3 }}>
                <Typography gutterBottom>Your Sticker:</Typography>
                <img 
                  src={`http://localhost:5000${result}`} 
                  alt="Result" 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '300px',
                    objectFit: 'contain'
                  }} 
                />
                <Button
                  variant="outlined"
                  color="secondary"
                  fullWidth
                  sx={{ mt: 2 }}
                  href={`http://localhost:5000${result}`}
                  download
                >
                  Download Sticker
                </Button>
              </Box>
            )}
          </Paper>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App; 
