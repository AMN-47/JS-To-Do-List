//todo list logic
let _idCounter = 1;
const genId = () => `id_${_idCounter++}`;

export function createTodo({
    title,
    description = '';
    
    dueDate = 'medium';
    
}) {}