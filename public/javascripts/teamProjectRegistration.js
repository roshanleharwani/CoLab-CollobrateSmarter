const memberList = document.getElementById('memberList');
const addBtn = document.getElementById('addBtn');
const inputField = document.getElementById('existing-members');
const form = document.getElementById('projectForm');
const hiddenDiv = document.getElementById("registered-list");
let membersArray = [];

// Function to render the list
function renderList() {
  memberList.innerHTML = ''; // Clear the current list
  
  // Loop through the members array to create list items
  membersArray.forEach((member, index) => {
    const li = document.createElement('li');
    li.className = 'text-black bg-emerald-300 font-medium rounded-lg px-2 h-8 flex justify-center items-center';
    li.innerHTML = `
      <div>${member}</div>
      <button class="ml-2 text-red-500 font-bold" onclick="removeMember(${index})">
        ×
      </button>
    `;
    memberList.appendChild(li);
  });

  // Show or hide the hiddenDiv based on the membersArray length
  if (membersArray.length > 0) {
    hiddenDiv.classList.remove('hidden');
  } else {
    hiddenDiv.classList.add('hidden');
  }
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



// skills section

const selectedSkills = []; // Array to hold selected skills

  function toggleDropdown() {
    const dropdown = document.getElementById('skillsDropdown');
    dropdown.classList.toggle('hidden');
  }

  function showDropdown() {
    const dropdown = document.getElementById('skillsDropdown');
    dropdown.classList.remove('hidden');
  }

  function selectSkill(skill) {
    // Store the selected skill in the input field
    document.getElementById('project_skills').value = skill;
    toggleDropdown();
  }

  function addSkill() {
    const skill = document.getElementById('project_skills').value;

    if (skill && !selectedSkills.includes(skill)) {
      selectedSkills.push(skill); // Add skill to the array
      updateSkillList(); // Update the displayed skill list
      document.getElementById('project_skills').value = ''; // Clear the input
    }
  }

  function updateSkillList() {
    const skillList = document.getElementById('skillList');
    skillList.innerHTML = ''; // Clear the list

    selectedSkills.forEach((skill, index) => {
      const li = document.createElement('li');
      li.className = 'flex items-center bg-emerald-300 rounded-lg p-2'; // Styling for the skill items
      
      li.textContent = skill; // Set the skill text

      // Create a remove button
      const removeBtn = document.createElement('button');
      removeBtn.textContent = '×'; // Cross mark
      removeBtn.className = 'ml-2 text-red-500 font-bold'; // Styling for the remove button
      removeBtn.onclick = () => removeSkill(index); // Set onclick event for removing skill

      li.appendChild(removeBtn); // Append remove button to the list item
      skillList.appendChild(li); // Append the list item to the skill list
    });

    // Show the added skills div if there are skills
    document.getElementById('addedSkills').classList.toggle('hidden', selectedSkills.length === 0);
  }

  function removeSkill(index) {
    // Remove skill from the array
    selectedSkills.splice(index, 1);
    updateSkillList(); // Update the displayed skill list
  }
  form.addEventListener('submit', (e) => {
    // Create hidden input for skills
    const hiddenSkillField = document.createElement('input');
    hiddenSkillField.type = 'hidden';
    hiddenSkillField.name = 'project[skills]'; // The name for the array field in your form
    hiddenSkillField.value = JSON.stringify(selectedSkills); // Convert array to JSON string

    form.appendChild(hiddenSkillField); // Append the hidden field to the form
});