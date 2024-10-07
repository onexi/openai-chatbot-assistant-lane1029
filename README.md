# PS03OpenAIAssistantChatBot

## Set Up
1. Create a .env file and put in your OPENAI_API_KEY

## How to Run:
1. In your Github Codespaces (for this repo), input `node server.js` into the terminal.
2. When the option to open the browser pops up, click on **Open in Browser**
3. Select your assistant from the drop down menu.
4. Click **Select Assistant**
5. Click **Create Thread**
6. Type a prompt into the text box
7. Click **Send**
8. Continue the conversation until you get the information you need.

## server.js
This file contains the the code required to create a server and interact with the ChatGPT Assistant.

#### Key Features
- State dictionary: This keeps track of the Assistant ID, Thread ID, Run ID, and user and assistant messages
- get_assistant: This function fetches the list of assistants accessible via the OpenAI API Key and filters the list to the assistants the user should be able to interact with.
- retrieve_assistant: This function retrieves the assistant chosen by the user.
- create_thread: This function created a new thread associated with the chosen assistant.
- clean_response: This function removes citation tags from the resonse message.
- get_all_messages: Retrieves the response from the LLM and filters to the actual message
- 
