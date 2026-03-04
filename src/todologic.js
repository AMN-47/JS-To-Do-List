function createTodo(title, description, dueDate, priority, notes) {
    return {
        title: title || "Untitled",
        description: description || "",
        dueDate: dueDate || "",
        priority: priority || "medium",
        notes: notes || "",
        completed: false, //standard for all todos to start as incomplete
    };
}

//function to display the name of the project
function createProject(name) {
    return {
        name: name || "Untitled Project",
        todos: [],
    };
}

//App State
//App State function is where central object stores everything that needs to be remembered in that moment

const appState = {
    projects: [], //Lists the project the user created
    activeIndex: -1, //current project selected with -1 meaning no project selected
}; 

//function to get active project
function getActiveProject() {
    if (appState.activeIndex === -1) return null;
    return appState.projects[appState.activeIndex];
}
//function to create Project and add it to list
function addProject(name) {
    const project = createProject(name);
    appState.projects.push(project);
    saveToLocalStorage();
} 

//function to delete project by its position in the array
function deleteProject(index) {
    appState.projects.splice(index, 1);

    if (appState.activeIndex === index) {
        appState.activeIndex = -1;
    } else if (appState,activeIndex > index) {
        appState.activeIndex--;
    }

    saveToLocalStorage();
}

