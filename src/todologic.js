function createTodo(title, description, dueDate, priority, notes) {
    return {
        title: title || "Untitled",
        description: description || "",
        dueDate: dueDate || "",
        priority: priority || "medium",
        notes: notes || "",
        completed: false, //standard for all todos to start as incomplete
    };
}

