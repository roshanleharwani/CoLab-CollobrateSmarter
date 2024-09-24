// Get references to the input, button, and hidden div
const addBtn = document.getElementById('addBtn');
const inputField = document.getElementById('existing-members');
const registeredListDiv = document.getElementById('registered-list');
const memberList = document.getElementById('memberList');

// Add event listener to the button
addBtn.addEventListener('click', function () {
  const inputValue = inputField.value.trim();
  console.log(inputValue);

  if (inputValue) {
    // Create a new list item

    const newItem = document.createElement('li');
    newItem.className = "flex justify-between items-center bg-emerald-300 font-medium"
    const textItem = document.createElement('span');
    textItem.textContent = inputValue.toUpperCase();
    const crossButton = document.createElement('span');
    const icon = document.createElement('i');
    icon.classList.add('fa-solid', 'fa-x');  // Use classList.add
    icon.style.color = '#e60000';  // Set color using the correct property
    crossButton.appendChild(icon);

    newItem.appendChild(textItem);
    newItem.appendChild(crossButton);
    // Add the new item to the list
    memberList.appendChild(newItem);

    // Show the hidden div
    registeredListDiv.classList.remove('hidden');

    // Clear the input field
    inputField.value = '';
  }
});