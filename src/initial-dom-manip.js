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
}