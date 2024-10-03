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

    console.log('API response:', data);

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

  if (assistantId) {
    try {
      console.log('Selected assistant:', assistantId);
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
      state.assistant_name = result.assistant_name; // Assuming the API returns the assistant's name

      const messageDiv = document.getElementById('message');
      messageDiv.innerText = `Selected Assistant: ${result.assistant_name}`;
    } catch (error) {
      console.error('Error selecting assistant:', error);
    }
  }
}

// Automatically load assistants on page load
window.onload = fetchAssistants;

async function getThread(){

// Enter Code Here

}
async function getResponse(){

// Enter Code Here

}
async function writeToMessages(message){
  let messageDiv = document.getElementById("message-container");
  messageDiv.innerHTML = message;
  document.getElementById('messages').appendChild(messageDiv);
}