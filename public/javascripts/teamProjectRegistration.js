const memberList = document.getElementById('memberList');
const addBtn = document.getElementById('addBtn');
const inputField = document.getElementById('existing-members');
const form = document.getElementById('projectForm');
let membersArray = ['23BCE7839', '23BCE7308', '23BCE7155'];

// Function to render the list
function renderList() {
  memberList.innerHTML = ''; // Clear the current list
  membersArray.forEach((member, index) => {
    const li = document.createElement('li');
    li.className = 'text-black bg-emerald-300 font-medium rounded-lg px-2 h-8 flex justify-center items-center';
    li.innerHTML = `
          <div>${member}</div>
          <button class="pl-2 h-4 mb-2 mt-2" onclick="removeMember(${index})">
            <img src="/images/delete-button.png" class="h-4 w-4" alt="">
          </button>
        `;
    memberList.appendChild(li);
  });
}

// Function to add member
addBtn.addEventListener('click', () => {
  const newMember = inputField.value.trim().toUpperCase(); // Get the input value and trim it
  if (newMember && !membersArray.includes(newMember)) { // Check if not empty and not duplicate
    membersArray.push(newMember); // Add the new member to the array
    inputField.value = ''; // Clear the input field
    renderList(); // Re-render the list
  }
});

// Function to remove a member
function removeMember(index) {
  membersArray.splice(index, 1); // Remove member at the specified index
  renderList(); // Re-render the list
}
form.addEventListener('submit', (e) => {
  const hiddenField = document.createElement('input');
  hiddenField.type = 'hidden';
  hiddenField.name = 'project[existing_members]'; // The name for the array field in your form
  hiddenField.value = JSON.stringify(membersArray); // Convert array to JSON string

  form.appendChild(hiddenField); // Append the hidden field to the form
});

// Initial render of the list
renderList();


function showDropdown() {
  document.getElementById('skillsDropdown').classList.remove('hidden');
}

function hideDropdown() {
  document.getElementById('skillsDropdown').classList.add('hidden');
}

function selectSkill(skill) {
  document.getElementById('project_skills').value = skill;
  hideDropdown();
}

// Hide the dropdown if clicked outside
document.addEventListener('click', function(event) {
  const dropdown = document.getElementById('skillsDropdown');
  const input = document.getElementById('project_skills');
  
  if (!dropdown.contains(event.target) && event.target !== input) {
    hideDropdown();
  }
});