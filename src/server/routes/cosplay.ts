import { Router } from 'express';
import { getRandomImage, getImageById } from '../services/db.js';

const router = Router();

// Endpoint 1: Fetch a random image
router.get('/', async (req, res) => {
  try {
    const randomImage = await getRandomImage();
    
    if (!randomImage) {
      return res.status(404).json({ success: false, message: 'No images found' });
    }

    res.json({
      success: true,
      message: randomImage.url,
      id: randomImage.id
    });
  } catch (error: any) {
    console.error('Error fetching random image:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Endpoint 2: Fetch specific image by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const image = await getImageById(id);

    if (!image) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    res.json({
      success: true,
      message: (image as any).url,
      id: image.id,
      metadata: image
    });
  } catch (error: any) {
    console.error('Error fetching image by ID:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
