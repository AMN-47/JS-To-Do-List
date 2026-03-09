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

//variables are assigned to init()
//They are declared here so all functions below can read them

//Render Projects - rebuilds the sidebar project list from appState.projects

function renderProjects() {
  const ul = DOM.projectList;

  // --- Clear existing items ---
  // Setting innerHTML to "" removes all child nodes instantly
  ul.innerHTML = "";

  // --- Create one <li> per project ---
  // forEach() calls a function once for every item in the array.
  // `project` = the current project object; `index` = its position (0,1,2…)
  appState.projects.forEach(function(project, index) {
    const li = document.createElement("li");
    li.classList.add("project-item");

    // Highlight the currently selected project
    if (index === appState.activeIndex) {
      li.classList.add("active");
    }

    // Project name span
    const nameSpan = document.createElement("span");
    nameSpan.classList.add("project-name");
    nameSpan.textContent = project.name;
    li.appendChild(nameSpan);

    // Delete button — sits inside the <li> on the right
    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-project-btn");
    deleteBtn.textContent = "✕";
    deleteBtn.title = "Delete project";
    // Store the index as a data attribute so the handler can read it
    deleteBtn.dataset.index = index;
    li.appendChild(deleteBtn);

    // --- Clicking the <li> selects the project ---
    li.addEventListener("click", function(event) {
      // event.target is the exact element clicked.
      // If it was the delete button, don't also select the project.
      if (event.target.classList.contains("delete-project-btn")) return;

      appState.activeIndex = index;
      saveToLocalStorage();
      renderProjects();  // re-highlight the active item
      renderTodos();     // show this project's todos
    });

    // --- Clicking the delete button removes the project ---
    deleteBtn.addEventListener("click", function(event) {
      // stopPropagation() prevents this click from ALSO firing
      // the <li> click listener above
      event.stopPropagation();

      if (confirm(`Delete project "${project.name}" and all its todos?`)) {
        deleteProject(index);   // topologic.js
        renderProjects();
        renderTodos();
      }
    });

    ul.appendChild(li);
  });
}

/**
 * renderTodos
 * Rebuilds the main panel with the active project's todo cards.
 */
function renderTodos() {
  DOM.todoListEl.innerHTML = "";

  const project = getActiveProject();

  // --- No project selected ---
  if (!project) {
    DOM.projectTitle.textContent = "Select a project";
    DOM.addTodoBtn.classList.add("hidden");
    DOM.emptyState.classList.add("hidden");
    return;
  }

  // --- A project IS selected ---
  DOM.projectTitle.textContent = project.name;
  DOM.addTodoBtn.classList.remove("hidden");

  if (project.todos.length === 0) {
    // Show the "no tasks yet" message
    DOM.emptyState.classList.remove("hidden");
    return;
  }

  // There ARE todos — hide the empty state, build a card for each
  DOM.emptyState.classList.add("hidden");

  project.todos.forEach(function(todo, index) {
    const card = buildTodoCard(todo, index);
    DOM.todoListEl.appendChild(card);
  });
}

/**
 * buildTodoCard
 * Constructs one todo card element entirely through DOM methods.
 * No innerHTML is used here — every piece is created explicitly,
 * which makes it safe (no XSS) and very readable.
 *
 * @param {object} todo   The todo data object
 * @param {number} index  Its position in project.todos
 * @returns {HTMLElement}
 */
function buildTodoCard(todo, index) {

  // --- Outer card wrapper ---
  const card = document.createElement("div");
  card.classList.add("todo-card", `priority-${todo.priority}`);
  if (todo.completed) card.classList.add("completed");

  // ---- LEFT COLUMN: checkbox ----
  const cardLeft = document.createElement("div");
  cardLeft.classList.add("card-left");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.classList.add("todo-check");
  checkbox.checked = todo.completed;
  checkbox.title = "Mark complete";
  // data-index stores the index so we can read it in the handler
  checkbox.dataset.index = index;

  // When the checkbox changes, toggle the todo and redraw
  checkbox.addEventListener("change", function() {
    toggleTodoComplete(index);   // topologic.js
    renderTodos();
  });

  cardLeft.appendChild(checkbox);
  card.appendChild(cardLeft);

  // ---- MIDDLE COLUMN: text content ----
  const cardBody = document.createElement("div");
  cardBody.classList.add("card-body");

  // Top row: title + priority badge
  const cardTop = document.createElement("div");
  cardTop.classList.add("card-top");

  const titleSpan = document.createElement("span");
  titleSpan.classList.add("todo-title");
  titleSpan.textContent = todo.title;  // textContent prevents XSS
  cardTop.appendChild(titleSpan);

  const priorityLabels = { low: "🟢 Low", medium: "🟡 Medium", high: "🔴 High" };
  const badge = document.createElement("span");
  badge.classList.add("priority-badge");
  badge.textContent = priorityLabels[todo.priority] || todo.priority;
  cardTop.appendChild(badge);

  cardBody.appendChild(cardTop);

  // Description (only if present)
  if (todo.description) {
    const desc = document.createElement("p");
    desc.classList.add("todo-desc");
    desc.textContent = todo.description;
    cardBody.appendChild(desc);
  }

  // Meta row: due date
  const meta = document.createElement("div");
  meta.classList.add("card-meta");

  const dueDateSpan = document.createElement("span");
  dueDateSpan.classList.add("due-date");
  dueDateSpan.textContent = todo.dueDate
    ? "📅 " + formatDate(todo.dueDate)
    : "📅 No date";
  meta.appendChild(dueDateSpan);
  cardBody.appendChild(meta);

  // Notes (expandable <details> block, only if present)
  if (todo.notes) {
    const details = document.createElement("details");
    details.classList.add("todo-notes");

    const summary = document.createElement("summary");
    summary.textContent = "Notes";
    details.appendChild(summary);

    const notesPara = document.createElement("p");
    notesPara.textContent = todo.notes;
    details.appendChild(notesPara);

    cardBody.appendChild(details);
  }

  card.appendChild(cardBody);

  // ---- RIGHT COLUMN: action buttons ----
  const cardActions = document.createElement("div");
  cardActions.classList.add("card-actions");

  const editBtn = document.createElement("button");
  editBtn.classList.add("edit-todo-btn");
  editBtn.textContent = "✏️";
  editBtn.title = "Edit";
  editBtn.addEventListener("click", function() {
    openEditModal(todo, index);
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("delete-todo-btn");
  deleteBtn.textContent = "🗑️";
  deleteBtn.title = "Delete";
  deleteBtn.addEventListener("click", function() {
    if (confirm(`Delete "${todo.title}"?`)) {
      deleteTodo(index);   // topologic.js
      renderTodos();
    }
  });

  cardActions.appendChild(editBtn);
  cardActions.appendChild(deleteBtn);
  card.appendChild(cardActions);

  return card;
}


/* ================================================================
   SECTION C — MODAL FUNCTIONS
   ================================================================
   The same modal is used for both "new todo" and "edit todo".
   We just pre-fill it differently.
   ================================================================ */

/**
 * openNewTodoModal  — clears all fields and opens in "add" mode.
 */
function openNewTodoModal() {
  DOM.modalTitle.textContent     = "New Todo";
  DOM.titleInput.value           = "";
  DOM.descInput.value            = "";
  DOM.dateInput.value            = getTodayDateString();
  DOM.prioritySelect.value       = "medium";
  DOM.notesInput.value           = "";
  DOM.editIndexInput.value       = "-1";  // -1 = adding, not editing
  showModal();
}

/**
 * openEditModal  — pre-fills all fields with the todo's current data.
 *
 * @param {object} todo   The todo to edit
 * @param {number} index  Its position (stored so saveTodo knows which to update)
 */
function openEditModal(todo, index) {
  DOM.modalTitle.textContent     = "Edit Todo";
  DOM.titleInput.value           = todo.title;
  DOM.descInput.value            = todo.description;
  DOM.dateInput.value            = todo.dueDate;
  DOM.prioritySelect.value       = todo.priority;
  DOM.notesInput.value           = todo.notes;
  DOM.editIndexInput.value       = String(index);
  showModal();
}

/** showModal  — removes the "hidden" class to display the overlay */
function showModal() {
  DOM.modalOverlay.classList.remove("hidden");
  DOM.titleInput.focus();  // put the cursor in the title field immediately
}

/** closeModal  — adds the "hidden" class to hide the overlay */
function closeModal() {
  DOM.modalOverlay.classList.add("hidden");
}

/**
 * saveTodo
 * Reads the form values and either adds a new todo or updates
 * an existing one, then closes the modal and re-renders.
 */
function saveTodo() {
  const title       = DOM.titleInput.value.trim();
  const description = DOM.descInput.value.trim();
  const dueDate     = DOM.dateInput.value;
  const priority    = DOM.prioritySelect.value;
  const notes       = DOM.notesInput.value.trim();

  // --- Validation: title is required ---
  if (!title) {
    // Play a shake animation on the input to signal the error
    DOM.titleInput.classList.add("shake");
    // { once: true } auto-removes this listener after it fires once
    DOM.titleInput.addEventListener("animationend", function() {
      DOM.titleInput.classList.remove("shake");
    }, { once: true });
    return;  // exit without saving
  }

  // parseInt(string, 10) converts "2" → 2 (the 10 means base-10 / decimal)
  const idx = parseInt(DOM.editIndexInput.value, 10);

  if (idx === -1) {
    addTodo(title, description, dueDate, priority, notes);   // topologic.js
  } else {
    editTodo(idx, title, description, dueDate, priority, notes);  // topologic.js
  }

  closeModal();
  renderTodos();
}


/* ================================================================
   SECTION D — SIDEBAR FORM FUNCTIONS
   ================================================================ */

function showProjectForm() {
  DOM.newProjectForm.classList.remove("hidden");
  DOM.addProjectBtn.classList.add("hidden");
  DOM.newProjectInput.value = "";
  DOM.newProjectInput.focus();
}

function hideProjectForm() {
  DOM.newProjectForm.classList.add("hidden");
  DOM.addProjectBtn.classList.remove("hidden");
}

function confirmNewProject() {
  const name = DOM.newProjectInput.value.trim();
  if (!name) return;

  addProject(name);   // topologic.js

  // Auto-select the new project (it's now the last item in the array)
  appState.activeIndex = appState.projects.length - 1;
  saveToLocalStorage();

  hideProjectForm();
  renderProjects();
  renderTodos();
}


/* ================================================================
   SECTION E — UTILITY HELPERS
   ================================================================ */

/**
 * formatDate  — turns "2025-06-15" into "Jun 15, 2025".
 * Appending "T00:00:00" forces local midnight, avoiding a
 * common timezone bug where dates appear one day off.
 *
 * @param {string} dateStr  "YYYY-MM-DD"
 * @returns {string}
 */
function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day:   "numeric",
    year:  "numeric",
  });
}


/* ================================================================
   SECTION F — EVENT WIRING
   ================================================================
   addEventListener(eventName, handlerFunction) tells the browser
   to call `handlerFunction` whenever `eventName` occurs on that
   element.  Common events: "click", "change", "keydown", "input".
   ================================================================ */

function wireEvents() {

  // Sidebar — show the new-project input form
  DOM.addProjectBtn.addEventListener("click", showProjectForm);

  // New-project form — confirm or cancel
  DOM.confirmProjectBtn.addEventListener("click", confirmNewProject);
  DOM.cancelProjectBtn.addEventListener("click", hideProjectForm);

  // Allow pressing Enter / Escape inside the project name input
  DOM.newProjectInput.addEventListener("keydown", function(event) {
    // event.key gives us the name of the pressed key as a string
    if (event.key === "Enter")  confirmNewProject();
    if (event.key === "Escape") hideProjectForm();
  });

  // Main area — open "add todo" modal
  DOM.addTodoBtn.addEventListener("click", openNewTodoModal);

  // Modal — save or close
  DOM.saveBtn.addEventListener("click",  saveTodo);
  DOM.closeBtn.addEventListener("click", closeModal);

  // Press Enter in the title field to save quickly
  DOM.titleInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") saveTodo();
  });

  // Click the dark backdrop to close the modal
  DOM.modalOverlay.addEventListener("click", function(event) {
    // event.target is the element that received the click.
    // We only close if the user clicked the overlay ITSELF,
    // not something inside the modal box.
    if (event.target === DOM.modalOverlay) closeModal();
  });

  // Press Escape anywhere on the page to close an open modal
  document.addEventListener("keydown", function(event) {
    const modalVisible = !DOM.modalOverlay.classList.contains("hidden");
    if (event.key === "Escape" && modalVisible) closeModal();
  });
}


/* ================================================================
   SECTION G — INITIALISATION
   ================================================================
   init() is the entry point.  It runs once when the page loads.
   Order matters:
     1. Inject base styles (so the layout works immediately)
     2. Build all the DOM elements (so they exist before we wire events)
     3. Wire events (so buttons respond to clicks)
     4. Load or seed data (so we have something to show)
     5. Render (draw the loaded data onto the screen)
   ================================================================ */

function init() {

  // 1. Base styles needed for the layout
  injectGlobalStyles();

  // 2. Build the page structure — returns element references
  const { sidebar, main } = buildLayout();

  const sidebarRefs = buildSidebar(sidebar);
  const mainRefs    = buildMain(main);
  const modalRefs   = buildModal();

  // Collect ALL element references into the shared `DOM` object.
  // Every function in this file reads from `DOM` — this is the
  // equivalent of doing getElementById() at the top of a file,
  // except we created the elements ourselves so we already have them.
  DOM = {
    // Sidebar
    projectList:     sidebarRefs.projectList,
    addProjectBtn:   sidebarRefs.addProjectBtn,
    newProjectForm:  sidebarRefs.newProjectForm,
    newProjectInput: sidebarRefs.newProjectInput,
    confirmProjectBtn: sidebarRefs.confirmBtn,
    cancelProjectBtn:  sidebarRefs.cancelBtn,

    // Main
    projectTitle:  mainRefs.projectTitle,
    addTodoBtn:    mainRefs.addTodoBtn,
    todoListEl:    mainRefs.todoListEl,
    emptyState:    mainRefs.emptyState,

    // Modal
    modalOverlay:  modalRefs.overlay,
    modalTitle:    modalRefs.modalTitle,
    titleInput:    modalRefs.titleInput,
    descInput:     modalRefs.descInput,
    dateInput:     modalRefs.dateInput,
    prioritySelect: modalRefs.prioritySelect,
    notesInput:    modalRefs.notesInput,
    editIndexInput: modalRefs.editIndexInput,
    saveBtn:       modalRefs.saveBtn,
    closeBtn:      modalRefs.closeBtn,
  };

  // 3. Attach event listeners now that all elements exist
  wireEvents();

  // 4. Load saved data from the browser, or seed demo data
  const hadData = loadFromLocalStorage();   // topologic.js
  if (!hadData) {
    seedDefaultData();   // topologic.js
  }

  // 5. Draw the initial state
  renderProjects();
  renderTodos();
}