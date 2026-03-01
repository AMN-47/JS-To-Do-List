
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
    addChecklistItem,
    createCheckListItem,
    removeCheckListItem,
} from './todo-logic';

let onSaveCallBack = null;

function buildModal (todo = null) {
    const isEdi = !!todo;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    overlay.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true">
      <div class="modal-header">
        <h2 class="modal-title">${isEdit ? 'Edit Task' : 'New Task'}</h2>
        <button class="modal-close" aria-label="Close">&times;</button>
      </div>
      <div class="modal-body">
        <div class="form-row">
          <label>Title <span class="required">*</span></label>
          <input type="text" id="m-title" placeholder="What needs to be done?" value="${isEdit ? escHtml(todo.title) : ''}" />
        </div>
        <div class="form-row">
          <label>Description</label>
          <textarea id="m-desc" rows="2" placeholder="Add some context...">${isEdit ? escHtml(todo.description) : ''}</textarea>
        </div>
        <div class="form-row form-row--split">
          <div>
            <label>Due Date</label>
            <input type="date" id="m-due" value="${isEdit ? todo.dueDate : ''}" />
          </div>
          <div>
            <label>Priority</label>
            <select id="m-priority">
              ${['low','medium','high'].map(p =>
                `<option value="${p}" ${isEdit && todo.priority === p ? 'selected' : !isEdit && p === 'medium' ? 'selected' : ''}>${p.charAt(0).toUpperCase() + p.slice(1)}</option>`
              ).join('')}
            </select>
          </div>
        </div>
        <div class="form-row">
          <label>Project</label>
          <select id="m-project">
            ${getProjects().map(p =>
              `<option value="${p.id}" ${(isEdit ? todo.projectId : getActiveProjectId()) === p.id ? 'selected' : ''}>${escHtml(p.name)}</option>`
            ).join('')}
          </select>
        </div>
        <div class="form-row">
          <label>Notes</label>
          <textarea id="m-notes" rows="3" placeholder="Additional notes...">${isEdit ? escHtml(todo.notes) : ''}</textarea>
        </div>
        <div class="form-row">
          <label>Checklist</label>
          <ul class="checklist-builder" id="m-checklist">
            ${isEdit ? todo.checklist.map(item => checklistItemHTML(item)).join('') : ''}
          </ul>
          <div class="checklist-add-row">
            <input type="text" id="m-checklist-input" placeholder="Add checklist item..." />
            <button type="button" id="m-checklist-add">Add</button>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn--ghost modal-cancel">Cancel</button>
        <button class="btn btn--primary modal-save">${isEdit ? 'Save Changes' : 'Create Task'}</button>
      </div>
    </div>
    `;

    //checklist add
    const checklistList = overlay.querySelector('#m-checklist');
    const checklistInput = overlay.querySelector('#m-checklist-input');
    const checklistAddBtn = overlay.querySelector('#m-checklist-add');

    function addTempItem() {
        const text = checklistInput.value.trim();
        if (!text) return;
        if (isEdit) {
            const item = addChecklistItem(todo.id, text);
            checklistList.insertAdjacentHTML('beforeend', checklistItemHTML(item));
        } else {
            const item = createCheckListItem(text);
            checklistList.insertAdjacentHTML('beforeend', checklistHTML(item, true));
        }
        checklistInput.value = '';
        checklistInput.focus();
    }

    checklistAddBtn.addEventListener('click', addTempItem);
    checklistInput.addEventListener('keydown', e => {if (e.key === 'Enter') {e.preventDefault(); addTempItem(); } });

    checklistList.addEventListener('click', e => {
        if (removeBtn) {
            const li = removeBtn.closest('li');
            const itemId = li.dataset.id;
            if (isEdit && itemId) removeCheckListItem(todo.id, itemId);
            li.remove();
        }
    });


    //close window
    
}