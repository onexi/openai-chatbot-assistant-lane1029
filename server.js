// Load environment variables
import dotenv from 'dotenv';
import OpenAI from 'openai';
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { fileURLToPath } from 'url';
import path from 'path';

// Load environment variables
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
const app = express();
app.use(express.json())
app.use(cors());
app.use(express.static('public')); // Serve static files from the 'public' directory

const PORT = 3000;

// State dictionary
let state = {
  assistant_id: null,
  assistant_name: null,
  threadId: null,
  messages: [],
};

// Simulate `__dirname` in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

// Function to fetch the list of assistants from OpenAI API
async function get_assistant() {
  try {
    const response = await openai.beta.assistants.list({
      order: 'desc',
      limit: 20, // Limit to 20 assistants
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching assistants from OpenAI API:', error.response?.data || error.message);

    // console.error('Error fetching assistants:', error);
    throw error;
  }
}

// API endpoint to fetch assistants and send them to the client
app.get('/assistants', async (req, res) => {
  try {
    const assistants = await get_assistant();
    res.json({ assistants });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch assistants.' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});