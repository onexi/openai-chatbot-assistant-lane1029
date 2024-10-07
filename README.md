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
- /assistants: retrieves the list of assistants associated with the API Key
- /select-assistant: calls retrieve_assistant and updates the state
- /create-thread: Calls create_thread and updates the state
- /retrieve-response: passes a message to the openai api, receives the output and calls get_all_messages. Updates the state

## index.html
This file contains the html structure for the webpage.

#### Key Features
- Drop down menu for the assistants
- Select assistant button (calls selectAssistant when pressed)
- New thread button (calls C when pressed)
- Input message box and send button (calls X when pressed)
- Message output container to house the user inputs and responses
- Imports markdown-it to convert markdown responses to html
- Imports bootstrap for look and feel of the webpage

## scripts.js
This file contains all of the functions executed when the web page is loaded and when buttons are pressed

#### Key Features
- fetchAssistants: Calls /assistants in server.js to prepopulate the list of available assistants when web page is loaded.
- selectAssistant: Grabs the value for the selected assistant calls /select-assistent in the server to get the assistant info. Updates the state.
- getThread: Calls /create-thread if the assistant has been selected and there is not already an existing thread. Updates state
- getResponse: Writes the user's message to the message container. Calls /retrieve response and updates the message-container with the response. Updates the state.
- convertMarkdownToHTML: Converts a message from markdown to HTML if the message is in markdown format
- writeToMessages: Adds an element to the message container to write the message to the container in the appropriate color.