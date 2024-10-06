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
async function get_assistants() {
  try {
    const response = await openai.beta.assistants.list({
      order: 'desc',
      limit: 20, // Limit to 20 assistants
    });
    // Filter the assistants to only include the ones you want to display
    // This can be updated if there are more assiatants you want the user to choose from
    const filteredAssistants = response.data.filter(assistant => ['BankTest'].includes(assistant.name));
    return filteredAssistants;
  } catch (error) {
    console.error('Error fetching assistants from OpenAI API:', error.response?.data || error.message);
    throw error;
  }
}

// Function to retrieve an assistant from OpenAI API
async function retrieve_assistant(assistant_id) {
  try {
    const response = await openai.beta.assistants.retrieve(
      assistant_id
    );
    return response;
  } catch (error) {
    console.error('Error fetching assistant from OpenAI API:', error.response?.data || error.message);
    throw error;
  }
}

// Function to create a thread
async function create_thread() {
  try{
    let response = await openai.beta.threads.create()
    return response;
  } catch (error) {
    console.error('Error creating thread:', error.response?.data || error.message);
    throw error;
  }
}

// Function to clean the response from the OpenAI API
// Removes citation placeholders from the response
function cleanResponse(response) {
  return response.replace(/【\d+:\d+†source】/g, ''); // Removes citation placeholders
}

// Function to get all messages from the thread and filter on just the most recent response
async function get_all_messages(messages) {
  let full_response = JSON.stringify(messages);
  full_response = JSON.parse(full_response);

  // Get the most recent response from the assistant
  let content = full_response.data[0].content
  let response_message = content[0].text.value;

  // Clean the response for citation placeholders
  const cleanedMessage = cleanResponse(response_message);
  return cleanedMessage;
}

// API endpoint to fetch assistants and send them to the client
app.get('/assistants', async (req, res) => {
  try {
    const assistants = await get_assistants();
    res.json({ assistants });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch assistants.' });
  }
});

// API endpoint to set the selected assistant
app.post('/select-assistant', async (req, res) => {
  const assistant_id = req.body.assistant_id;
  
  if (!assistant_id) {
    return res.status(400).json({ message: 'Assistant ID required.' });
  }

  try {
    // Await the result of the async function
    const assistant = await retrieve_assistant(assistant_id);
    
    // Now that the assistant object is fully resolved, we can access its properties and update state
    state.assistant_id = assistant_id;
    state.assistant_name = assistant.name; // Access the name and other attributes
    state.threadId = null; // Reset threadId when a new assistant is selected
    state.messages = []; // Clear messages when a new assistant is selected

    res.json({ message: 'Assistant selected successfully.', state });
    
  } catch (error) {
    console.error('Error fetching assistant:', error.message);
    res.status(500).json({ message: 'Failed to retrieve assistant.' });
  }
});

// API endpoint to create a thread
app.get('/create-thread', async (req, res) => {
  try {
    // Create a new thread
    const thread = await create_thread();

    // Update the state with the thread ID
    state.threadId = thread.id;
    res.json({message: 'Thread created successfully.', state});
  } catch (error) {
    res.status(500).json({ message: 'Failed to create a thread.' });
  }
});

// API endpoint to retrieve a response from the assistant
app.post('/retrieve-response', async (req, res) => {
  const message = req.body.message;
  const threadId = state.threadId;

  // Check if the message and threadId are provided
  if (!message || !threadId) {
    return res.status(400).json({ message: 'Message and threadId required.' });
  }

  // Add user's message to the state
  state.messages.push({'role': 'User', 'message': message});

  try {
    let thread_id = state.threadId;
    // Send user's message to the OpenAI API
    await openai.beta.threads.messages.create(thread_id,
        {
            role: "user",
            content: message,
        })
    // Run and poll thread V2 API feature
    let run = await openai.beta.threads.runs.createAndPoll(thread_id, {
        assistant_id: state.assistant_id
    })
    // update the state with the run ID
    let run_id = run.id;
    state.run_id = run_id;

    // Retrieve the messages from the thread
    let messages = await openai.beta.threads.messages.list(thread_id);
    let all_messages = await get_all_messages(messages);
    all_messages = all_messages.toString();
    
    // Add assistant's response to the state
    state.messages.push({'role': 'Assistant', 'message': all_messages});
    res.json({'response_message': all_messages});
  }
  catch (error) {
      console.log(error);
      return error;
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});