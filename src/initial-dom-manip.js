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