import {
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
} from './todologic.js'; //Bringing in logic to work on elements

import "./style.css"; // importing stylesheet to work on page during runtime 

//Bui;ding the skeleton 

function buildLayout() {
    const content = document.getElementById("content");


    //Side Bar
    const sidebar = document.createElement("aside");
    sidebar.id = sidebar;

    //Main content
    const main = document.createElement("main");
    main.id = "main-content";


    content.appendChild(sidebar);
    content.appendChild(main);

    return {sidebar, main};
}

/*Build Side bar:
    -Populates side bar panel with heading, ul for project buttons, new project button, inline form for project name*/
function buildSideBar(sidebar) {
    //App Titile
    const title = document.createElement("div");
    title.id = "sidebar-header";

    const h1 = document.createElement("h1");
    h1.id = "app-title";
    h1.textContent = "+ TASKS";
    title.appendChild(h1);
    sidebar.appendChild(title);

    //project list ul
    const projectList = document.createElement("ul");
    projectList.id = "project-list";
    sidebar.appendChild(projectList);

    //New Project Button
    const addProjectBtn = document.createElement("button");
    addProjectBtn.id = "add-project-btn";
    addProjectBtn.textContent = "+ New Project";
    sidebar.appendChild(addProjectBtn); 

    //inline new-project form (hidden by defualt)
    const newProjectForm = document.createElement("div");
    newProjectForm.id = "new-project-form";
    newProjectForm,classList.add("hidden"); //Starts invisible

    const newProjectInput = document.createElement("input");
    newProjectInput.type = "text";
    newProjectInput.id = "new-project-input";
    newProjectInput.placeholder = "Project name...";
    newProjectInput.maxLength = 30; 

    //Action buttons row inside the form
    const formActions = document.createElement("div");
    formActions.classList.add("form-actions");

    const confirmBtn = document.createElement("button");
    confirmBtn.id = "confirm-project-btn";
    confirmBtn.textContent = "Add";

    const cancelBtn = document.createElement("button");
    cancelBtn.id = "cancel-project-btn";
    cancelBtn.classList.add("btn-ghost");
    cancelBtn.textContent = "Cancel";

    formActions.appendChild(confirmBtn);
    formActions.appendChild(cancelBtn);

    newProjectForm.appendChild(newProjectInput);
    newProjectForm.appendChild(formActions);
    sidebar.appendChild(newProjectForm);

    return {projectList, addProjectBtn, newProjectForm, newProjectForm, confirmBtn, cancelBtn};

}

//Main element for parts 
function buildMain(main) {

    //Header: project + add Todo
    const header = document.createElement("div");
    header.id = "content-header";

    const projectTitle = document.createElement("h2");
    projectTitle.id = "project-title";
    projectTitle.textContent = "Select a project";

    const addTodoBtn = document.createElement("button");
    addTodoBtn.id = "add-todo-btn";
    addTodoBtn.textContent = "+ Add Todo";
    addTodoBtn.classList.add("hidden"); //hidden until a project is selected

    header.appendChild(projectTitle);
    header.appendChild(addTodoBtn);
    main.appendChild(header);

    
}