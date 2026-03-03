//app shell, sidebar and todo list views

import {
    getProjects,
    getProject,
    getTodosForProject,
    getActiveProjectId,
    setActiveProject,
    addProject,
    deleteProject,
    deleteTodo,
    toggleTodoComplete,
    toggleCheckListItem,
} from './todo-logic'

import { openCreateTodoModal, openEditTodoModal } from './create-to-do';
import {renderBlankProject} from './blank-project-load'

//App shell
export function initDom() {
    const root = document.getElementById('content');
    root.innerHTML = '';

    const app = document.createElement('div');
    app.className = 'app';
    app.innerHTML = `
        <aside class="sidebar">
            <div class="sidebar__brand">
                <span class="sidebar__logo">✓</span>
                <span class="sidebar__name">Tasklane</span>
            </div>
            <nav class="sidebar__nav" id="project-list"></nav>
            <div class="sidebar__footer">
                <button class="btn btn--ghost btn--full" id="add-project-btn">+ New Project</button>
            </div>
        </aside>
        <main class="main">
            <header class="main__header">
                <div class="main__title-row">
                    <h1 class="main__project-title" id="project-title">Loading...</h1>
                    <button class="btn btn--primary" id="add-todo-btn">+ New Task</button>
                </div>
            </header>
            <section class="todo-list" id="todo-list"></section>
        </main>
    `;
    root.appendChild(app);

    document.getElementById('add-project-btn').addEventListener('click', handleAppProject);
    document.getElementById('add-todo-btn').addEventListener(
        'click', () => openCreateTodoModal(refresh)
    );

    refresh();
} 

// ---- Refresh ----
export function refresh() {
  renderSidebar();
  renderTodoList();
}

// ---- Sidebar ----
function renderSidebar() {
  const nav = document.getElementById('project-list');
  if (!nav) return;
  const active = getActiveProjectId();
  nav.innerHTML = '';

  getProjects().forEach(project => {
    const item = document.createElement('div');
    item.className = `sidebar__project${project.id === active ? ' active' : ''}`;
    item.dataset.id = project.id;

    const completedCount = project.todos.filter(t => t.complete).length;
    const totalCount = project.todos.length;

    item.innerHTML = `
      <span class="sidebar__project-name">${escHtml(project.name)}</span>
      <span class="sidebar__project-count">${totalCount}</span>
      ${project.id !== 'default' ? `<button class="sidebar__delete-project" aria-label="Delete project" data-id="${project.id}">&times;</button>` : ''}
    `;

    item.addEventListener('click', (e) => {
      if (e.target.closest('.sidebar__delete-project')) return;
      setActiveProject(project.id);
      refresh();
    });

    const delBtn = item.querySelector('.sidebar__delete-project');
    if (delBtn) {
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`Delete project "${project.name}"? All its tasks will be lost.`)) {
          deleteProject(project.id);
          refresh();
        }
      });
    }

    nav.appendChild(item);
  });
}

// ---- Todo List ----
function renderTodoList() {
  const list = document.getElementById('todo-list');
  const titleEl = document.getElementById('project-title');
  if (!list || !titleEl) return;

  const activeId = getActiveProjectId();
  const project = getProject(activeId);
  if (!project) return;

  titleEl.textContent = project.name;
  list.innerHTML = '';

  const todos = getTodosForProject(activeId);

  if (todos.length === 0) {
    renderBlankProject(list, project.name, () => openCreateTodoModal(refresh));
    return;
  }

  // Sort: incomplete first, then by due date
  const sorted = [...todos].sort((a, b) => {
    if (a.complete !== b.complete) return a.complete ? 1 : -1;
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  sorted.forEach(todo => {
    list.appendChild(buildTodoCard(todo));
  });
}

// ---- Todo Card ----
function buildTodoCard(todo) {
  const card = document.createElement('div');
  card.className = `todo-card todo-card--${todo.priority}${todo.complete ? ' todo-card--done' : ''}`;
  card.dataset.id = todo.id;

  const dueDateStr = todo.dueDate
    ? formatDate(todo.dueDate)
    : '<span class="no-date">No due date</span>';

  const isOverdue = todo.dueDate && !todo.complete && new Date(todo.dueDate) < new Date(new Date().toDateString());

  card.innerHTML = `
    <div class="todo-card__main" tabindex="0">
      <button class="todo-card__check ${todo.complete ? 'checked' : ''}" aria-label="Toggle complete" data-action="toggle"></button>
      <div class="todo-card__content">
        <div class="todo-card__title-row">
          <span class="todo-card__title">${escHtml(todo.title)}</span>
          <span class="priority-badge priority-badge--${todo.priority}">${todo.priority}</span>
        </div>
        <div class="todo-card__meta">
          <span class="todo-card__due ${isOverdue ? 'overdue' : ''}">${isOverdue ? '⚠ ' : ''}${dueDateStr}</span>
          ${todo.checklist.length > 0 ? `<span class="todo-card__checklist-count">☑ ${todo.checklist.filter(c=>c.done).length}/${todo.checklist.length}</span>` : ''}
        </div>
      </div>
      <div class="todo-card__actions">
        <button class="icon-btn" aria-label="Edit" data-action="edit">✏</button>
        <button class="icon-btn icon-btn--danger" aria-label="Delete" data-action="delete">✕</button>
        <button class="icon-btn expand-btn" aria-label="Expand" data-action="expand">▾</button>
      </div>
    </div>
    <div class="todo-card__details" hidden>
      ${todo.description ? `<p class="detail-desc">${escHtml(todo.description)}</p>` : ''}
      ${todo.notes ? `<div class="detail-notes"><strong>Notes:</strong> ${escHtml(todo.notes)}</div>` : ''}
      ${todo.checklist.length > 0 ? renderChecklistView(todo) : ''}
    </div>
  `;

  // Events
  card.querySelector('[data-action="toggle"]').addEventListener('click', (e) => {
    e.stopPropagation();
    toggleTodoComplete(todo.id);
    refresh();
  });

  card.querySelector('[data-action="edit"]').addEventListener('click', (e) => {
    e.stopPropagation();
    // re-fetch fresh todo
    const fresh = getTodosForProject(getActiveProjectId()).find(t => t.id === todo.id)
      || (() => { for (const p of getProjects()) { const t = p.todos.find(x => x.id === todo.id); if (t) return t; } })();
    openEditTodoModal(fresh, refresh);
  });

  card.querySelector('[data-action="delete"]').addEventListener('click', (e) => {
    e.stopPropagation();
    if (confirm(`Delete "${todo.title}"?`)) {
      deleteTodo(todo.id);
      refresh();
    }
  });

  const expandBtn = card.querySelector('[data-action="expand"]');
  const details = card.querySelector('.todo-card__details');
  expandBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = !details.hidden;
    details.hidden = isOpen;
    expandBtn.textContent = isOpen ? '▾' : '▴';
    card.classList.toggle('expanded', !isOpen);
  });

  // Checklist toggles in details
  details.addEventListener('click', (e) => {
    const item = e.target.closest('.checklist-view-item');
    if (item) {
      toggleChecklistItem(todo.id, item.dataset.id);
      refresh();
    }
  });

  return card;
}

function renderChecklistView(todo) {
  const items = todo.checklist.map(item => `
    <li class="checklist-view-item ${item.done ? 'done' : ''}" data-id="${item.id}">
      <span class="checklist-view-check">${item.done ? '✓' : ''}</span>
      <span class="checklist-view-text">${escHtml(item.text)}</span>
    </li>
  `).join('');
  return `<ul class="checklist-view">${items}</ul>`;
}

function handleAddProject() {
  const name = prompt('New project name:');
  if (name && name.trim()) {
    const p = addProject(name.trim());
    setActiveProject(p.id);
    refresh();
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(m)-1]} ${parseInt(d)}, ${y}`;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}