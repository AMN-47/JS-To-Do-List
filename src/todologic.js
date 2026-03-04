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