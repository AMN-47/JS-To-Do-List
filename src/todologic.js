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

//functions for todo operations
function addTodo (title, description, dueDate, priority, notes) {
    const project = getActiveProject();
    if (!project) return; //do nothing if no project selected

    const todo = createTodo(title, description, dueDate, priority, notes);
    project.todos.push(todo);
    saveToLocalStorage();
}

function editTodo(todoIndex, title, description, dueDate, priority, notes) {
    const project = getActiveProject();
    if (!project) return;

    const todo = project.todos[todoIndex];
    todo.title = title;
    todo.description = description;
    todo.dueDate = dueDate;
    todo.priority = priority;
    todo.notes = notes;

    saveToLocalStorage();
} 

function deleteTodo(todoIndex) {
    const project = getActiveProject();
    if (!project) return;

    project.todos.splice(todoIndex, 1);
    saveToLocalStorage();
}

function toggleTodoComplete(todoIndex) {
    const project = getActiveProject();
    if (!project) return;

    project.todos[todoIndex].completed = !project.todos[todoIndex].completed;
    saveToLocalStorage();
}

const STORAGE_KEY = "odin-todo-app-v1";

//function savetoLocal Storage writes each state to local storage

function saveToLocalStorage() {
    const data = JSON.stringify({
        projects: appState.projects,
        activeIndex: appState.activeIndex, 
    });
    localStorage.setItem(STORAGE_KEY, data);
}

//reads saved stroage data
function loadFromLocalStorage() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;

    try {
        const data = JSON.parse(raw);
        appState.projects = data.projects || [];
        appState.activeIndex = (data.activeIndex !== undefined) ? data.activeIndex: -1
        return true;
    } catch (err) {
        console.warn("Could not save data:", err);
        return false;
    }
}

//SEED default data populates the demo project for first time users only if local storage is empty

function seedDefualtData () {
    addProject("Personal");
    appState.activeIndex = 0;

    addTodo(
        "Read the Odin Project Lesson",
        "Work Through the Todo List Project Page",
        getTodayDateString(),
        "high",
        "Focus on factory fucntions and Dom Seperation"
    );
    addTodo (
        "Go for a walk",
        "Fresh air helps after coding sessions",
        "",
        "low",
        ""
    );
} 

function getTodayDateString() {
    return new Date().toISOString().split("T")[0];
}

//Export function makes names of functions to any other file that needs it
export{
    appState,

    getActiveProject,

    addProject,
    deleteProject,

    addTodo,
    editTodo,
    deleteTodo,
    toggleTodoComplete,

    saveToLocalStorage,
    loadFromLocalStorage,

    seedDefualtData,
    getTodayDateString,
}
