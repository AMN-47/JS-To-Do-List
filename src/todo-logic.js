import { instancePerContainerCachingFactory } from "tsyringe";

//todo list logic
let _idCounter = 1;
const genId = () => `id_${_idCounter++}`;

export function createTodo({
    title,
    description = '',
    dueDate = '',
    priority = 'medium',
    notes = '',
    checklist = [],
    projectId,    
}) {
    return {
        id: genId(),
        title,
        description,
        dueDate,
        priority,
        notes,
        checklist,
        projectId,
        complete: false,
        createdAt: new Date().toISOString(),
    };
} 

export function createCheckListItem(text) {
    return {id: genId(), text, done:false};
}

export function createProject({name, id = null}) {
    return {
        id: id || genId(),
        name, 
        todos: [],
    }
} 


const DEFAULT_PROJECT_ID = 'default';

const state = {
    projects: [createProject({name: 'My Tasks ', id: DEFAULT_PROJECT_ID})],
    activeProjectId: DEFAULT_PROJECT_ID,
};

export function getProjects() {
    return state.projects;
}

export function getActiveProjectId() {
    return state.activeProjectId;
}

export function setActiveProject(projectId) {
    state.activeProjectId = projectId;
}

export function addProject(name) {
    const p = createProject({ name });
    state.projects.push(p);
    saveState();
    return p;
}

export function deleteProject(projectId) {
    if (projectID === DEFAULT_PROJECT_ID) return false;
    state.projects = state.projects.filter(p => p.id !== projectId);
    if (state.activeProjectId === projectId) {
        state.activeProjectId = DEFAULT_PROJECT_ID;
    }
    saveState();
    return true;
}

export function getProject(projectId) {
    return state.projects.find(p => p.id === projectId) || null;
}

//Todo Operations
export function getTodosForProject(projectId) {
    const p = getProject(projectId);
    return p ? p.todos: [];
}

export function addTodo(todoData) {
    const todo = createTodo({ ...todoData, projectId: state.activeProjectId});
    const project = getProject(state.activeProjectId);
    if (project) {
        project.todos.push(todo);
        saveState();
    }
    return todo;
}

export function deleteTodo(todoId) {
    for (const p of state.projects) {
        const idx = p.todos.findIndex(t => t.id === todoId);
        if (idx !== -1) {
            p.todos.splice(idx, 1);
            saveState();
            return true;
        }
    }
    return false;
}

export function updateTodo (todoId, updates) {
    for (const p of state.projects) {
        const todo = p.todos.find(t => t.id === todoId);
        if (todo) {
            Object.assign(todo, updates);
            saveState();
            return todo;
        }
    }
    return null;
}

export function toggleTodoComplete(todoId) {
    for (const p of state.projects) {
        const todo = p.todos.find(t=> t.id === todoId);
        if (todo) {
            const item = todo.checklist.find(c => c.id === todoId);
            if (todo) {
                todo.done = !todo.done;
                saveState();
                return todo;
            }   
        }
    }
    return null;
}

export function toggleCheckListItem (todoId, itemId) {
    for (const p of state.projects) {
        const todo = p.todos.find(t => t.id === todoId);
        if (todo) {
            const item = todo.checklist.find(c => c.id === itemId);
            if (item) {
                item.done = !item.done;
                saveState();
                return item;
            }
        }
    }
    return null;
}

export function addChecklistItem(todoId, text) {
 for (const p of state.projects) {
    const todo = p.todos.find(t => t.id === todoId);
    if (todo) {
     const item = createChecklistItem(text);
     todo.checklist.push(item);
     saveState();
      return item;
   }
  }
  return null;
}





export function removeCheckListItem (todoId, itemId) {
    for (const p of state.projects) {
        const todo = p.todos.find(t => t.id === todoId);
        if (todo) {
            todo.checklist = todo.checklist.filter(c => c.id !== itemId);
            saveState();
            return true;
        }
    }
    return false;
} 

export function saveState() {
    try {
        localStorage.setItem('todoAppState', JSON.stringify(state));
    } catch(e) {
        console.warn('Could not save state:', e);
    }
}

export function loadState() {
    try {
        const saved = localStorage.getItem('todoAppState');
        if (!saved) return;
        const parsed = JSON.parse(saved);
        state.projects = parsed.projects || state.projects;
        state.activeProjectId = parsed.activeProjectId || DEFAULT_PROJECT_ID;

        const allIds = state.projects.flatMap (p => 
        [p.id, ...p.todos.flatMap(t => [t.id, ...t.checklist.map(c => c.id)])]
        );
        const maxNum = allIds
            .map(id => parseInt(id.replace('id_', '')) || 0)
            .reduce((a, b) => Math.max(a,b), 0);
        _idCounter = maxNum + 1;
    } catch (e) {
        console.warn('Could not load state', e);
    }
}