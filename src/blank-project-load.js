export function renderBlankProject(container, projectName, onAddTodo) {
    container.innerHTML = '';  const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = `
    <div class="empty-state__icon">
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="14" y="10" width="52" height="60" rx="6" stroke="currentColor" stroke-width="2.5" fill="none" opacity="0.3"/>
        <line x1="26" y1="28" x2="54" y2="28" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity="0.5"/>
        <line x1="26" y1="38" x2="54" y2="38" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity="0.5"/>
        <line x1="26" y1="48" x2="42" y2="48" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity="0.5"/>
        <circle cx="57" cy="57" r="14" fill="var(--accent)" opacity="0.15"/>
        <line x1="57" y1="51" x2="57" y2="63" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="51" y1="57" x2="63" y2="57" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
    </div>
    <h3 class="empty-state__title">No tasks yet</h3>
    <p class="empty-state__subtitle">
      <em>${projectName}</em> is clear. Add your first task to get started.
   </p>
   <button class="btn btn--primary empty-state__cta">+ Add First Task</button>
 `;

  empty.querySelector('.empty-state__cta').addEventListener('click', onAddTodo);
  container.appendChild(empty);
}