import { Router } from 'express';
import { createPost, createDescription } from '../utils/postcreation.js';

const router = Router();

// Health check
router.get('/health', (_req, res) => res.json({ service: 'growth', status: 'ok' }));

// Create a post based on user prompt
router.post('/create-post', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ 
        error: 'Prompt is required',
        message: 'Please provide a prompt in the request body'
      });
    }

    // Generate the post image using GPT-image-1
    const result = await createPost(prompt);
    
    // Return the generated image URL and enhanced prompt
    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      image: result.imageUrl,
      originalPrompt: result.originalPrompt,
      enhancedPrompt: result.enhancedPrompt
    });
    
  } catch (error) {
    console.error('Error in create-post route:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create post. Please try again later.'
    });
  }
});

// Create a description based on user prompt (text generation)
router.post('/create-description', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: 'Prompt is required',
        message: 'Please provide a prompt in the request body'
      });
    }

    // Generate the post description using a current GPT-4.1-class model
    const description = await createDescription(prompt);

    res.status(201).json({
      success: true,
      message: 'Description created successfully',
      description
    });
  } catch (error) {
    console.error('Error in create-description route:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create description. Please try again later.'
    });
  }
});


export default router;
