// Initiate the state object with the assistant_id and threadId as null and an empty array for messages
let state = {
  assistant_id: null,
  assistant_name: null,
  threadId: null,
  messages: [],
};
// Fetch available assistants from the server
async function fetchAssistants() {
  try {
    const response = await fetch('/assistants');
    const data = await response.json();

    const select = document.getElementById('assistant-select');

    data.assistants.forEach(assistant => {
      const option = document.createElement('option');
      option.value = assistant.id; // Assuming the API returns an 'id' for each assistant
      option.text = assistant.name; // Assuming the API returns a 'name' for each assistant
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Error fetching assistants:', error);
  }
}

// Call API to select an assistant and update the state
async function selectAssistant() {
  const select = document.getElementById('assistant-select');
  const assistantId = select.value;

  if (assistantId!=="Select an assistant") {
    try {
      const response = await fetch('/select-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ assistant_id: assistantId })
      });

      const result = await response.json();

      // Update the state with the selected assistant's details
      state.assistant_id = assistantId;
      state.assistant_name = result['state']['assistant_name']; // Assuming the API returns the assistant's name

      const messageDiv = document.getElementById('assistant-message');
      messageDiv.innerText = `${result['message']}`;
    } catch (error) {
      console.error('Error selecting assistant:', error);
    }
  } else {
    alert('Please select an assistant from the drop down menu first.');
  }
}

// Automatically load assistants on page load
window.onload = fetchAssistants;

async function getThread(){
  if (state.threadId) {
    alert('A thread has already been created.');
    return;
  }
  if (!state.assistant_id) {
    alert('Please select an assistant first.');
    return;
  }
  try {
    const response = await fetch('/create-thread');
    const result = await response.json();

    state.threadId = result['state']['threadId'];

    const messageDiv = document.getElementById('thread-message');
    messageDiv.innerText = `${result['message']}`;
  } catch (error) {
    console.error('Error creating assistant:', error);
  }
}

async function getResponse(){
  const select = document.getElementById('messageInput');
  const message = select.value;
  if (!state.assistant_id) {
    alert('Please select an assistant first.');
    return;
  }
  if (!state.threadId) {
    alert('Please create a thread first.');
    return;
  }

  if (message !=='') {
    try {
      document.getElementById('messageInput').value = '';
      state.messages.push({'role': 'User', 'message': message});
      writeToMessages("User: ", "user")
      writeToMessages(message, "user")
      const response = await fetch('/retrieve-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 'message': message })
      });
      
      const result = await response.json();
      state.messages.push({'role': 'Assistant', 'message': result['response_message']});
      writeToMessages("Assistant: ", "assistant")
      writeToMessages(result['response_message'], "assistant")
      
    } catch (error) {
      console.error('Error creating assistant:', error);
    }
  }
}

// Function to convert Markdown to HTML (using a markdown parser library like marked.js)
function convertMarkdownToHTML(markdown) {
  // Create a new instance of markdown-it
  const md = window.markdownit();
  
  // Check if the input is in Markdown format
  const isMarkdown = /[*_~`#>\[\]]/.test(markdown);
  if (!isMarkdown) {
    return markdown; // Return the original text if it's not Markdown
  }
  
  // Render Markdown to HTML
  return md.render(markdown);
}

async function writeToMessages(message, role){
  const messageContainer = document.getElementById('message-container');
  
  // Create a new message element (div)
  const messageDiv = document.createElement('div');
  
  // Add the 'message' class and either 'user' or 'assistant' class based on the role
  messageDiv.classList.add('message', role);

  // Set the message content
  messageDiv.innerHTML = convertMarkdownToHTML(message);


  // Append the new message div to the message container
  messageContainer.appendChild(messageDiv);

  // Scroll to the bottom of the container to show the latest message
  messageContainer.scrollTop = messageContainer.scrollHeight;
}