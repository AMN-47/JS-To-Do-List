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

    //todolist
    const todoListEl = document.createElement("div");
    todoListEl.id = "todo-list";
    main.appendChild(todoListEl); 

    //Empty state message
    const emptyState = document.createElement("div");
    emptyState.id = "empty-state";
    emptyState.classList.add("hidden");

    const emptyMsg = document.createElement("p");
    emptyMsg.textContent = "no tasks yet - add one above!";
    emptyState.appendChild(emptyMsg);
    main.appendChild(emptyState);

    return {projectTitle, addTodoBtn, todoListEl, emptyState};
} 

function buildModal() {
    //overlay - Dark Backdrop

    const overlay = document.createElement("div");
    overlay.id = "modal-overlay";
    overlay.classList.add("hidden");


    //Modal Box
    const modal = document.createElement("div");
    modal.id = "modal";

    //Title of Modal such as Add todo or Edit Todo
    const modalTitle = document.createElement("h3");
    modalTitle.id = "modal-title";
    modalTitle.textContent = "New Todo";
    modal.appendChild(modalTitle);
} 

//Helper: creates label warapping input and text area
function makeField(labelText, required, inputEl) {
    const label = document.createElement("label");

    const span = document.createElement("span");
    span.textContent = labelText + " ";
    label.appendChild(span);

    if (required) {
        const req = document.createElement("span");
        req.classList.add("required");
        req.textContent = "*";
        span.appendChild(req);
    }

    label.appendChild(inputEl);
    return label;
} 

//Title Field 
const titleInput = document.createElement("input");
titleInput.type = "text";
titleInput.id = "todo-title-input";
titleInput.placeholder = "What needs doing?";
titleInput.maxLength = 60;
modal.appendChild(makeField("Title", true, titleInput));

//Description Field
const descInput = document.createElement("textarea");
descInput.id = "todo-desc-input";
descInput.placeholder = "More Details ...";
descInput.rows = 3;
modal.appendChild(makeField("Description", true , descInput));

//code for two-column row: Due Date and Priority
const twoCol = document.createElement("div");
twoCol.classList.add("two-col");

const dateInput = document.createElement("input");
dataInput.type = "date";
dataInput.id = "todo-date-input";
twoCol.appendChild(makeField("Due Date", false, dataInput));

const prioritySelect = document.createElement("select");
prioritySelect.id = "todo-priority-input";
[
   { value: "low",    label: "🟢 Low"    },
   { value: "medium", label: "🟡 Medium" },
   { value: "high",   label: "🔴 High"   },
].forEach(({value, label}) => {
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = label;
    if (value === "medium") opt.selected = true; //Makes this the defaulted selection
    prioritySelect.appendChild(opt);
});
twoCol.appendChild(makeField("Priority", false, prioritySelect));

modal.appendChild(twoCol);

