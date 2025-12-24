document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const dueDateInput = document.getElementById('due-date-input');
    const addBtn = document.getElementById('add-btn');
    const taskList = document.getElementById('task-list');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const themeToggle = document.getElementById('theme-toggle');
    const totalCount = document.getElementById('total-count');
    const pendingCount = document.getElementById('pending-count');
    const completedCount = document.getElementById('completed-count');

    let currentFilter = 'all';

    // Load theme and tasks
    loadTheme();
    loadTasks();

    // Event listeners
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
    themeToggle.addEventListener('click', toggleTheme);
    filterBtns.forEach(btn => btn.addEventListener('click', (e) => {
        setFilter(e.target.dataset.filter);
    }));

    function addTask() {
        const taskText = taskInput.value.trim();
        const dueDate = dueDateInput.value;
        if (taskText === '') {
            alert('Please enter a task!');
            return;
        }

        const li = createTaskElement(taskText, false, dueDate);
        taskList.appendChild(li);
        saveTasks();
        updateStats();
        taskInput.value = '';
        dueDateInput.value = '';
    }

    function createTaskElement(text, completed, dueDate) {
        const li = document.createElement('li');
        if (completed) li.classList.add('completed');

        const taskSpan = document.createElement('span');
        taskSpan.classList.add('task-text');
        taskSpan.textContent = text;

        const dueSpan = document.createElement('span');
        dueSpan.classList.add('due-date');
        dueSpan.textContent = dueDate ? `Due: ${new Date(dueDate).toLocaleDateString()}` : '';

        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('task-actions');

        const editBtn = document.createElement('button');
        editBtn.classList.add('edit-btn');
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.addEventListener('click', () => editTask(taskSpan, editBtn));

        const completeBtn = document.createElement('button');
        completeBtn.classList.add('complete-btn');
        completeBtn.innerHTML = '<i class="fas fa-check"></i>';
        completeBtn.addEventListener('click', () => toggleComplete(li));

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn');
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.addEventListener('click', () => {
            li.remove();
            saveTasks();
            updateStats();
        });

        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(completeBtn);
        actionsDiv.appendChild(deleteBtn);

        li.appendChild(taskSpan);
        li.appendChild(dueSpan);
        li.appendChild(actionsDiv);

        return li;
    }

    function editTask(taskSpan, editBtn) {
        const currentText = taskSpan.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.classList.add('edit-input');
        taskSpan.replaceWith(input);
        input.focus();

        const saveEdit = () => {
            const newText = input.value.trim();
            if (newText) {
                taskSpan.textContent = newText;
                input.replaceWith(taskSpan);
                saveTasks();
            } else {
                alert('Task cannot be empty!');
                input.focus();
            }
        };

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') saveEdit();
        });
        input.addEventListener('blur', saveEdit);
    }

    function toggleComplete(li) {
        li.classList.toggle('completed');
        saveTasks();
        updateStats();
        filterTasks();
    }

    function setFilter(filter) {
        currentFilter = filter;
        filterBtns.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        filterTasks();
    }

    function filterTasks() {
        const tasks = taskList.querySelectorAll('li');
        tasks.forEach(task => {
            const isCompleted = task.classList.contains('completed');
            if (currentFilter === 'all' || (currentFilter === 'pending' && !isCompleted) || (currentFilter === 'completed' && isCompleted)) {
                task.style.display = 'flex';
            } else {
                task.style.display = 'none';
            }
        });
    }

    function saveTasks() {
        const tasks = [];
        taskList.querySelectorAll('li').forEach(li => {
            tasks.push({
                text: li.querySelector('.task-text').textContent,
                completed: li.classList.contains('completed'),
                dueDate: li.querySelector('.due-date').textContent.replace('Due: ', '') || ''
            });
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(task => {
            const li = createTaskElement(task.text, task.completed, task.dueDate);
            taskList.appendChild(li);
        });
        updateStats();
        filterTasks();
    }

    function updateStats() {
        const tasks = taskList.querySelectorAll('li');
        const total = tasks.length;
        const completed = taskList.querySelectorAll('li.completed').length;
        const pending = total - completed;

        totalCount.textContent = `Total: ${total}`;
        pendingCount.textContent = `Pending: ${pending}`;
        completedCount.textContent = `Completed: ${completed}`;
    }

    function toggleTheme() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }

    function loadTheme() {
        const theme = localStorage.getItem('theme');
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }
});