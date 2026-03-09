/* ================================================================
   src/initialdommanip.js  —  DOM MANIPULATION
   ================================================================

   This file is the "hands" of the app.
   Its only job is to BUILD and UPDATE what the user sees.

   The HTML file contains just ONE element: <div id="content">
   Everything — the sidebar, the todo cards, the modal popup —
   is created here using JavaScript DOM methods.

   KEY DOM METHODS USED:
     document.createElement("div")     make a new element (not on page yet)
     element.id = "my-id"              set an id attribute
     element.classList.add("foo")      add a CSS class
     element.textContent = "Hello"     set visible text (safe — no HTML risk)
     parent.appendChild(child)         attach child INSIDE parent (now on page)
     element.addEventListener("click", fn)  listen for user interaction

   DEPENDS ON: topologic.js
     We import the logic functions at the top so we can call them
     when the user does something (clicks a button, submits a form…)
   ================================================================ */

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
  seedDefaultData,
  getTodayDateString,
} from "./todologic.js";

import "./style.css"
/* ================================================================
   SECTION A — BUILD THE PAGE SKELETON
   ================================================================
   These functions run ONCE on startup. They create the structural
   elements, attach them to the page, and return references so the
   rest of the code can update them without searching the DOM again.
   ================================================================ */

/**
 * buildLayout
 * Creates the two top-level panels and attaches them to #content.
 *
 * The whole page layout is:
 *   #content
 *     <aside id="sidebar">   ← project list on the left
 *     <main id="main-content"> ← todos on the right
 *
 * @returns {{ sidebar, main }}  references to both panels
 */
function buildLayout() {
  // This is the only element that already exists in the HTML file
  const content = document.getElementById("content");

  // createElement() creates an element IN MEMORY.
  // It does not appear on screen until we call appendChild().
  const sidebar = document.createElement("aside");
  sidebar.id = "sidebar";

  const main = document.createElement("main");
  main.id = "main-content";

  // Now attach them — order matters: sidebar goes first (left)
  content.appendChild(sidebar);
  content.appendChild(main);

  return { sidebar, main };
}

/**
 * buildSidebar
 * Fills the sidebar panel with:
 *   - App title
 *   - <ul> for project buttons  (will be populated by renderProjects)
 *   - "New Project" button
 *   - Hidden inline form for entering a project name
 *
 * @param   {HTMLElement} sidebar
 * @returns {object}  refs to the interactive parts
 */
function buildSidebar(sidebar) {

  /* ---- App title ---- */
  const header = document.createElement("div");
  header.id = "sidebar-header";

  const h1 = document.createElement("h1");
  h1.id = "app-title";
  // textContent sets plain text — no HTML tags are interpreted.
  // Always use textContent for user-supplied text to stay safe.
  h1.textContent = "✦ TASKS";

  header.appendChild(h1);
  sidebar.appendChild(header);

  /* ---- Project list <ul> ---- */
  // This starts empty. renderProjects() fills it every time the
  // list of projects changes.
  const projectList = document.createElement("ul");
  projectList.id = "project-list";
  sidebar.appendChild(projectList);

  /* ---- "New Project" button ---- */
  const addProjectBtn = document.createElement("button");
  addProjectBtn.id = "add-project-btn";
  addProjectBtn.textContent = "+ New Project";
  sidebar.appendChild(addProjectBtn);

  /* ---- Inline new-project form (hidden until button clicked) ---- */
  const newProjectForm = document.createElement("div");
  newProjectForm.id = "new-project-form";
  // "hidden" is a CSS class that sets display:none
  newProjectForm.classList.add("hidden");

  const newProjectInput = document.createElement("input");
  newProjectInput.type = "text";
  newProjectInput.placeholder = "Project name…";
  newProjectInput.maxLength = 30;

  // Row of action buttons inside the form
  const formActions = document.createElement("div");
  formActions.classList.add("form-actions");

  const confirmBtn = document.createElement("button");
  confirmBtn.textContent = "Add";

  const cancelBtn = document.createElement("button");
  cancelBtn.classList.add("btn-ghost");
  cancelBtn.textContent = "Cancel";

  formActions.appendChild(confirmBtn);
  formActions.appendChild(cancelBtn);
  newProjectForm.appendChild(newProjectInput);
  newProjectForm.appendChild(formActions);
  sidebar.appendChild(newProjectForm);

  // Return everything the event-wiring step will need
  return { projectList, addProjectBtn, newProjectForm, newProjectInput, confirmBtn, cancelBtn };
}

/**
 * buildMain
 * Fills the main panel with:
 *   - Header row (project title + "Add Todo" button)
 *   - Empty div for todo cards  (filled by renderTodos)
 *   - Empty-state message
 *
 * @param   {HTMLElement} main
 * @returns {object}  refs to the parts we update during rendering
 */
function buildMain(main) {

  /* ---- Header row ---- */
  const header = document.createElement("div");
  header.id = "content-header";

  const projectTitle = document.createElement("h2");
  projectTitle.id = "project-title";
  projectTitle.textContent = "Select a project";

  const addTodoBtn = document.createElement("button");
  addTodoBtn.id = "add-todo-btn";
  addTodoBtn.textContent = "+ Add Todo";
  addTodoBtn.classList.add("hidden");   // shown only when a project is active

  header.appendChild(projectTitle);
  header.appendChild(addTodoBtn);
  main.appendChild(header);

  /* ---- Todo cards container ---- */
  const todoListEl = document.createElement("div");
  todoListEl.id = "todo-list";
  main.appendChild(todoListEl);

  /* ---- Empty-state message ---- */
  const emptyState = document.createElement("div");
  emptyState.id = "empty-state";
  emptyState.classList.add("hidden");

  const emptyMsg = document.createElement("p");
  emptyMsg.textContent = "No tasks yet — add one above!";
  emptyState.appendChild(emptyMsg);
  main.appendChild(emptyState);

  return { projectTitle, addTodoBtn, todoListEl, emptyState };
}

/**
 * buildModal
 * Creates the todo form popup and attaches it to <body>.
 * (Attached to body, not #content, so it can overlay everything
 *  using CSS position:fixed.)
 *
 * The same modal is reused for both "new todo" and "edit todo".
 *
 * @returns {object}  refs to every form field and button
 */
function buildModal() {

  /* ---- Dark backdrop overlay ---- */
  const overlay = document.createElement("div");
  overlay.id = "modal-overlay";
  overlay.classList.add("hidden");

  /* ---- White/dark modal box ---- */
  const modal = document.createElement("div");
  modal.id = "modal";

  /* ---- Modal heading ---- */
  const modalTitle = document.createElement("h3");
  modalTitle.id = "modal-title";
  modalTitle.textContent = "New Todo";
  modal.appendChild(modalTitle);

  /* ----
     makeField(labelText, required, inputEl)
     A tiny helper that wraps any input element inside a <label>.

     <label>
       <span>Title <span class="required">*</span></span>
       [inputEl goes here]
     </label>

     Using a helper avoids copy-pasting the same 8 lines five times.
  ---- */
  function makeField(labelText, required, inputEl) {
    const label = document.createElement("label");

    const textSpan = document.createElement("span");
    textSpan.textContent = labelText;

    if (required) {
      // * marker next to required field names
      const star = document.createElement("span");
      star.classList.add("required");
      star.textContent = " *";
      textSpan.appendChild(star);
    }

    label.appendChild(textSpan);
    label.appendChild(inputEl);
    return label;   // the caller appends this to the modal
  }

  /* ---- Title field ---- */
  const titleInput = document.createElement("input");
  titleInput.type = "text";
  titleInput.placeholder = "What needs doing?";
  titleInput.maxLength = 60;
  modal.appendChild(makeField("Title", true, titleInput));

  /* ---- Description field ---- */
  const descInput = document.createElement("textarea");
  descInput.placeholder = "More details…";
  descInput.rows = 3;
  modal.appendChild(makeField("Description", false, descInput));

  /* ---- Two-column row: Due Date + Priority ---- */
  const twoCol = document.createElement("div");
  twoCol.classList.add("two-col");

  const dateInput = document.createElement("input");
  dateInput.type = "date";
  twoCol.appendChild(makeField("Due Date", false, dateInput));

  // Build the priority <select> with three <option> children
  const prioritySelect = document.createElement("select");
  [
    { value: "low",    label: "🟢 Low"    },
    { value: "medium", label: "🟡 Medium" },
    { value: "high",   label: "🔴 High"   },
  ].forEach(({ value, label }) => {
    // Arrow function: ({value, label}) => { ... }
    // This is shorthand for: function({ value, label }) { ... }
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    if (value === "medium") option.selected = true;
    prioritySelect.appendChild(option);
  });
  twoCol.appendChild(makeField("Priority", false, prioritySelect));

  modal.appendChild(twoCol);

  /* ---- Notes field ---- */
  const notesInput = document.createElement("textarea");
  notesInput.placeholder = "Any extra notes…";
  notesInput.rows = 2;
  modal.appendChild(makeField("Notes", false, notesInput));

  /* ----
     Hidden field: stores the todo index when editing.
     -1  →  we are ADDING a new todo
     0+  →  we are EDITING the todo at that index
  ---- */
  const editIndexInput = document.createElement("input");
  editIndexInput.type = "hidden";
  editIndexInput.value = "-1";
  modal.appendChild(editIndexInput);

  /* ---- Save / Cancel buttons ---- */
  const formActions = document.createElement("div");
  formActions.classList.add("form-actions");

  const saveBtn = document.createElement("button");
  saveBtn.id = "save-todo-btn";
  saveBtn.textContent = "Save";

  const closeBtn = document.createElement("button");
  closeBtn.classList.add("btn-ghost");
  closeBtn.textContent = "Cancel";

  formActions.appendChild(saveBtn);
  formActions.appendChild(closeBtn);
  modal.appendChild(formActions);

  // Nest: modal box sits inside the overlay
  overlay.appendChild(modal);
  // The overlay covers the whole viewport, so it goes on <body>
  document.body.appendChild(overlay);

  return {
    overlay, modalTitle,
    titleInput, descInput, dateInput,
    prioritySelect, notesInput, editIndexInput,
    saveBtn, closeBtn,
  };
}


/* ================================================================
   SECTION B — THE DOM REFERENCE OBJECT
   ================================================================
   `DOM` is a plain object that holds a reference to every
   interactive element we need to read or update.

   It is populated in init() once all elements have been created.
   Every function below reads from `DOM` instead of calling
   getElementById or querySelector repeatedly.
   ================================================================ */
let DOM = {};


/* ================================================================
   SECTION C — RENDER FUNCTIONS
   ================================================================
   "Render" = "draw the current state onto the screen".

   Pattern used:
     1. Clear the container  (innerHTML = "" removes all children)
     2. Read from appState
     3. Create new elements for each item
     4. Append them to the container

   This "wipe and rebuild" approach is simple: you always know the
   screen exactly matches appState.
   ================================================================ */

/**
 * renderProjects
 * Clears the sidebar <ul> and rebuilds one <li> per project.
 */
function renderProjects() {
  const ul = DOM.projectList;
  ul.innerHTML = "";   // clear previous items

  // forEach() iterates every item in an array.
  // `project` = current project object
  // `index`   = its position in the array (0, 1, 2 …)
  appState.projects.forEach(function(project, index) {

    const li = document.createElement("li");
    li.classList.add("project-item");

    // Highlight the currently-selected project
    if (index === appState.activeIndex) {
      li.classList.add("active");
    }

    /* Project name span */
    const nameSpan = document.createElement("span");
    nameSpan.classList.add("project-name");
    nameSpan.textContent = project.name;
    li.appendChild(nameSpan);

    /* Delete button — visually hidden, shown on hover via CSS */
    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-project-btn");
    deleteBtn.textContent = "✕";
    deleteBtn.title = "Delete project";
    li.appendChild(deleteBtn);

    /* Clicking the <li> selects this project */
    li.addEventListener("click", function(event) {
      // event.target — the exact element that was clicked.
      // If the user clicked the delete button inside the <li>,
      // we do NOT also want to select the project, so we return early.
      if (event.target.classList.contains("delete-project-btn")) return;

      appState.activeIndex = index;
      saveToLocalStorage();
      renderProjects();   // re-render to move the highlight
      renderTodos();      // show the newly selected project's todos
    });

    /* Clicking the delete button removes the project */
    deleteBtn.addEventListener("click", function(event) {
      // stopPropagation() prevents this click from ALSO triggering
      // the <li> click listener above.
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
 * Clears the main content area and rebuilds one card per todo
 * in the currently active project.
 */
function renderTodos() {
  DOM.todoListEl.innerHTML = "";

  const project = getActiveProject();   // topologic.js

  /* No project selected */
  if (!project) {
    DOM.projectTitle.textContent = "Select a project";
    DOM.addTodoBtn.classList.add("hidden");
    DOM.emptyState.classList.add("hidden");
    return;   // exit early — nothing else to draw
  }

  /* A project IS selected */
  DOM.projectTitle.textContent = project.name;
  DOM.addTodoBtn.classList.remove("hidden");

  /* Project has no todos yet */
  if (project.todos.length === 0) {
    DOM.emptyState.classList.remove("hidden");
    return;
  }

  /* Project has todos — draw a card for each one */
  DOM.emptyState.classList.add("hidden");

  project.todos.forEach(function(todo, index) {
    const card = buildTodoCard(todo, index);
    DOM.todoListEl.appendChild(card);
  });
}

/**
 * buildTodoCard
 * Creates and returns a single todo card element using only DOM methods.
 * No innerHTML is used — every node is created explicitly.
 *
 * Why avoid innerHTML here?
 *   innerHTML parses a string as HTML. If any user text contains
 *   < > & characters, it could break the layout or run scripts.
 *   textContent is always safe because it's treated as plain text.
 *
 * @param   {object} todo   — todo data from topologic.js
 * @param   {number} index  — position in project.todos[]
 * @returns {HTMLElement}   — a <div> ready to be appended
 */
function buildTodoCard(todo, index) {

  /* --- Outer wrapper --- */
  const card = document.createElement("div");
  card.classList.add("todo-card");
  // e.g. "priority-high" — CSS uses this for the left-border colour
  card.classList.add(`priority-${todo.priority}`);
  if (todo.completed) card.classList.add("completed");

  /* --- LEFT: checkbox --- */
  const cardLeft = document.createElement("div");
  cardLeft.classList.add("card-left");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.classList.add("todo-check");
  checkbox.checked = todo.completed;
  checkbox.title = "Mark complete";

  // "change" fires whenever the checkbox value changes
  checkbox.addEventListener("change", function() {
    toggleTodoComplete(index);   // topologic.js — flips completed flag
    renderTodos();               // redraw to show the strikethrough
  });

  cardLeft.appendChild(checkbox);
  card.appendChild(cardLeft);

  /* --- MIDDLE: text content --- */
  const cardBody = document.createElement("div");
  cardBody.classList.add("card-body");

  // Top row: title + priority badge
  const cardTop = document.createElement("div");
  cardTop.classList.add("card-top");

  const titleSpan = document.createElement("span");
  titleSpan.classList.add("todo-title");
  titleSpan.textContent = todo.title;
  cardTop.appendChild(titleSpan);

  const priorityLabels = { low: "🟢 Low", medium: "🟡 Medium", high: "🔴 High" };
  const badge = document.createElement("span");
  badge.classList.add("priority-badge");
  badge.textContent = priorityLabels[todo.priority] || todo.priority;
  cardTop.appendChild(badge);

  cardBody.appendChild(cardTop);

  // Description paragraph (only if the user entered one)
  if (todo.description) {
    const desc = document.createElement("p");
    desc.classList.add("todo-desc");
    desc.textContent = todo.description;
    cardBody.appendChild(desc);
  }

  // Due date meta line
  const meta = document.createElement("div");
  meta.classList.add("card-meta");
  const dueDateSpan = document.createElement("span");
  dueDateSpan.classList.add("due-date");
  dueDateSpan.textContent = todo.dueDate
    ? "📅 " + formatDate(todo.dueDate)
    : "📅 No date";
  meta.appendChild(dueDateSpan);
  cardBody.appendChild(meta);

  // Expandable notes section (<details> is a native HTML disclosure widget)
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

  /* --- RIGHT: action buttons --- */
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
   SECTION D — MODAL FUNCTIONS
   ================================================================ */

/**
 * openNewTodoModal
 * Clears every field and opens the form in "add new" mode.
 */
function openNewTodoModal() {
  DOM.modalTitle.textContent  = "New Todo";
  DOM.titleInput.value        = "";
  DOM.descInput.value         = "";
  DOM.dateInput.value         = getTodayDateString();   // default to today
  DOM.prioritySelect.value    = "medium";
  DOM.notesInput.value        = "";
  DOM.editIndexInput.value    = "-1";   // -1 signals "add" not "edit"
  showModal();
}

/**
 * openEditModal
 * Pre-fills every field with the todo's existing data.
 *
 * @param {object} todo   — the todo to edit
 * @param {number} index  — stored so saveTodo knows which todo to update
 */
function openEditModal(todo, index) {
  DOM.modalTitle.textContent  = "Edit Todo";
  DOM.titleInput.value        = todo.title;
  DOM.descInput.value         = todo.description;
  DOM.dateInput.value         = todo.dueDate;
  DOM.prioritySelect.value    = todo.priority;
  DOM.notesInput.value        = todo.notes;
  DOM.editIndexInput.value    = String(index);
  showModal();
}

function showModal() {
  DOM.overlay.classList.remove("hidden");
  DOM.titleInput.focus();   // move keyboard cursor into the title field
}

function closeModal() {
  DOM.overlay.classList.add("hidden");
}

/**
 * saveTodo
 * Reads form values, validates, then calls addTodo or editTodo.
 */
function saveTodo() {
  const title       = DOM.titleInput.value.trim();
  const description = DOM.descInput.value.trim();
  const dueDate     = DOM.dateInput.value;
  const priority    = DOM.prioritySelect.value;
  const notes       = DOM.notesInput.value.trim();

  // Validation: title must not be empty
  if (!title) {
    DOM.titleInput.classList.add("shake");
    // { once: true } — remove this listener after it fires once,
    // so the shake class can be applied again next time
    DOM.titleInput.addEventListener("animationend", function() {
      DOM.titleInput.classList.remove("shake");
    }, { once: true });
    return;
  }

  // parseInt(string, 10) converts the string "2" to the number 2
  // The second argument (10) specifies base-10 (decimal) notation
  const idx = parseInt(DOM.editIndexInput.value, 10);

  if (idx === -1) {
    addTodo(title, description, dueDate, priority, notes);        // topologic.js
  } else {
    editTodo(idx, title, description, dueDate, priority, notes);  // topologic.js
  }

  closeModal();
  renderTodos();
}


/* ================================================================
   SECTION E — SIDEBAR FORM FUNCTIONS
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
  if (!name) return;   // do nothing if the input is empty

  addProject(name);   // topologic.js — creates and stores the project

  // Automatically select the newly created project.
  // It was pushed to the END of the array, so its index is length - 1.
  appState.activeIndex = appState.projects.length - 1;
  saveToLocalStorage();

  hideProjectForm();
  renderProjects();
  renderTodos();
}


/* ================================================================
   SECTION F — UTILITY HELPERS
   ================================================================ */

/**
 * formatDate
 * Converts "2025-06-15" → "Jun 15, 2025" for display.
 *
 * Why append "T00:00:00"?
 *   Without it, `new Date("2025-06-15")` is parsed as UTC midnight,
 *   which in negative-offset timezones (e.g. UTC-5) becomes
 *   June 14 at 19:00 local time — showing the wrong day.
 *   Adding "T00:00:00" forces LOCAL midnight, fixing the bug.
 *
 * @param   {string} dateStr  "YYYY-MM-DD"
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
   SECTION G — EVENT WIRING
   ================================================================
   All addEventListener() calls live here so they are easy to find.
   Nothing else in this file calls addEventListener.

   addEventListener(eventName, fn):
     - eventName: a string like "click", "change", "keydown"
     - fn: the function to call when that event happens
   ================================================================ */

function wireEvents() {

  /* Sidebar */
  DOM.addProjectBtn.addEventListener("click", showProjectForm);
  DOM.confirmProjectBtn.addEventListener("click", confirmNewProject);
  DOM.cancelProjectBtn.addEventListener("click", hideProjectForm);

  // Let the user press Enter or Escape in the project-name input
  DOM.newProjectInput.addEventListener("keydown", function(event) {
    // event.key — the name of the key as a string
    if (event.key === "Enter")  confirmNewProject();
    if (event.key === "Escape") hideProjectForm();
  });

  /* Main content */
  DOM.addTodoBtn.addEventListener("click", openNewTodoModal);

  /* Modal */
  DOM.saveBtn.addEventListener("click", saveTodo);
  DOM.closeBtn.addEventListener("click", closeModal);

  // Enter in the title field saves the form
  DOM.titleInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") saveTodo();
  });

  // Clicking the dark backdrop (outside the modal box) closes it
  DOM.overlay.addEventListener("click", function(event) {
    // event.target — the element directly clicked.
    // If the user clicked something INSIDE the modal (an input,
    // a button…) event.target is that inner element, not the overlay,
    // so we do nothing. We only close on a direct overlay click.
    if (event.target === DOM.overlay) closeModal();
  });

  // Escape key closes the modal from anywhere on the page
  document.addEventListener("keydown", function(event) {
    const isOpen = !DOM.overlay.classList.contains("hidden");
    if (event.key === "Escape" && isOpen) closeModal();
  });
}


/* ================================================================
   SECTION H — INITIALISATION
   ================================================================
   init() is the entry point. It is called once at the bottom of
   this file.

   Order is critical:
     1. Build elements  →  they must exist before we can wire events
     2. Populate DOM    →  store refs before render calls use them
     3. Wire events     →  attach listeners to existing elements
     4. Load data       →  restore state from localStorage
     5. Render          →  draw the loaded state onto the screen
   ================================================================ */

function init() {

  /* 1 & 2 — Build the page and collect all element references */
  const { sidebar, main } = buildLayout();

  const sidebarRefs = buildSidebar(sidebar);
  const mainRefs    = buildMain(main);
  const modalRefs   = buildModal();

  // Merge every reference into the shared DOM object so all
  // functions above can access them without re-querying the DOM
  DOM = {
    // Sidebar
    projectList:      sidebarRefs.projectList,
    addProjectBtn:    sidebarRefs.addProjectBtn,
    newProjectForm:   sidebarRefs.newProjectForm,
    newProjectInput:  sidebarRefs.newProjectInput,
    confirmProjectBtn: sidebarRefs.confirmBtn,
    cancelProjectBtn:  sidebarRefs.cancelBtn,

    // Main
    projectTitle: mainRefs.projectTitle,
    addTodoBtn:   mainRefs.addTodoBtn,
    todoListEl:   mainRefs.todoListEl,
    emptyState:   mainRefs.emptyState,

    // Modal
    overlay:       modalRefs.overlay,
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

  /* 3 — Attach all event listeners */
  wireEvents();

  /* 4 — Restore data or seed demo data */
  const hadData = loadFromLocalStorage();   // topologic.js
  if (!hadData) {
    seedDefaultData();   // topologic.js
  }

  /* 5 — Draw the initial UI */
  renderProjects();
  renderTodos();
}

// ----------------------------------------------------------------
// Start the app.
// Because this file is loaded as type="module", it runs AFTER
// the HTML has been parsed — so getElementById("content") will
// always find the element. No need for DOMContentLoaded wrapper.
// ----------------------------------------------------------------
init();