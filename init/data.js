const { v4: uuidv4 } = require('uuid');

const projects = [
    {
        personName: "Surya",
        projectName: "COLAB CREATION",
        description: "A website that helps for collaboration",
        membersRequired: 4,
        members: ['23BCE7849', '23BCE7658', '23BCE7568'],
        requiredSkills: ['webdevelopment', 'graphicDesign'],
        projectId: uuidv4(),
        
    },
    {
        personName: "Rohan",
        projectName: "TaskMaster",
        description: "A productivity app to manage tasks",
        membersRequired: 3,
        members: ['23BCE7032', '23BCE7019', '23BCE7998'],
        requiredSkills: ['webdevelopment', 'graphicDesign'],
        projectId: uuidv4() // Generate a new ID here
    },
    // Add the rest of your project objects similarly
];

// Log the projects to see the generated IDs
console.log(projects);

// Export the projects array
module.exports = projects;
