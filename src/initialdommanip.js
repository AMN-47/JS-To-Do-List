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

  // ----- Overlay (dark backdrop) -----
  const overlay = document.createElement("div");
  overlay.id = "modal-overlay";
  overlay.classList.add("hidden");

  // ----- Modal box -----
  const modal = document.createElement("div");
  modal.id = "modal";

  // Title of the modal ("New Todo" or "Edit Todo")
  const modalTitle = document.createElement("h3");
  modalTitle.id = "modal-title";
  modalTitle.textContent = "New Todo";
  modal.appendChild(modalTitle);

  // Helper: creates a <label> wrapping an <input> or <textarea>/<select>
  // This keeps the code DRY ("Don't Repeat Yourself")
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

  // ----- Title field -----
  const titleInput = document.createElement("input");
  titleInput.type = "text";
  titleInput.id = "todo-title-input";
  titleInput.placeholder = "What needs doing?";
  titleInput.maxLength = 60;
  modal.appendChild(makeField("Title", true, titleInput));

  // ----- Description field -----
  const descInput = document.createElement("textarea");
  descInput.id = "todo-desc-input";
  descInput.placeholder = "More details…";
  descInput.rows = 3;
  modal.appendChild(makeField("Description", false, descInput));

  // ----- Two-column row: Due Date + Priority -----
  const twoCol = document.createElement("div");
  twoCol.classList.add("two-col");

  const dateInput = document.createElement("input");
  dateInput.type = "date";
  dateInput.id = "todo-date-input";
  twoCol.appendChild(makeField("Due Date", false, dateInput));

  const prioritySelect = document.createElement("select");
  prioritySelect.id = "todo-priority-input";
  // Build the <option> elements programmatically
  [
    { value: "low",    label: "🟢 Low"    },
    { value: "medium", label: "🟡 Medium" },
    { value: "high",   label: "🔴 High"   },
  ].forEach(({ value, label }) => {
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = label;
    if (value === "medium") opt.selected = true;  // default selection
    prioritySelect.appendChild(opt);
  });
  twoCol.appendChild(makeField("Priority", false, prioritySelect));

  modal.appendChild(twoCol);

  // ----- Notes field -----
  const notesInput = document.createElement("textarea");
  notesInput.id = "todo-notes-input";
  notesInput.placeholder = "Any extra notes…";
  notesInput.rows = 2;
  modal.appendChild(makeField("Notes", false, notesInput));

  // ----- Hidden field: stores the index when editing -----
  // -1 means "we're adding new"; any other number means "we're editing"
  const editIndexInput = document.createElement("input");
  editIndexInput.type = "hidden";
  editIndexInput.id = "edit-todo-index";
  editIndexInput.value = "-1";
  modal.appendChild(editIndexInput);

  // ----- Form action buttons -----
  const formActions = document.createElement("div");
  formActions.classList.add("form-actions");

  const saveBtn = document.createElement("button");
  saveBtn.id = "save-todo-btn";
  saveBtn.textContent = "Save";

  const closeBtn = document.createElement("button");
  closeBtn.id = "close-modal-btn";
  closeBtn.classList.add("btn-ghost");
  closeBtn.textContent = "Cancel";

  formActions.appendChild(saveBtn);
  formActions.appendChild(closeBtn);
  modal.appendChild(formActions);

  // Attach the modal box to the overlay, overlay to <body>
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  return {
    overlay, modal, modalTitle,
    titleInput, descInput, dateInput,
    prioritySelect, notesInput, editIndexInput,
    saveBtn, closeBtn,
  };
} 

/*
Injects global Style inserts Style tag with CSS Custom properties and base resets
builk of css will be in style.css file
*/

function injectGlobalStyles() {
    const style = document.createElement("style");
    style.textContent = `
        body {margin: 0;}
        #content {
            display: flex;
            height: 100vh;
            overflow: hidden;
        }
    `;
    document.head.appendChild(style);
}

