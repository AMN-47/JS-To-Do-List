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
}

