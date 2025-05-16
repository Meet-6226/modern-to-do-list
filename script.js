document.addEventListener('DOMContentLoaded', function() {
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const tasksLeft = document.getElementById('tasksLeft');
    const clearCompletedBtn = document.getElementById('clearCompleted');
    const themeToggle = document.getElementById('themeToggle');
    
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';
    let currentTheme = localStorage.getItem('theme') || 'dark';
    
    function init() {
        setTheme(currentTheme);
        renderTasks();
        updateTaskCounter();
        
        addTaskBtn.addEventListener('click', addTask);
        taskInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') addTask();
        });
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentFilter = this.dataset.filter;
                renderTasks();
            });
        });
        
        clearCompletedBtn.addEventListener('click', clearCompletedTasks);
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText) {
            const newTask = {
                id: Date.now(),
                text: taskText,
                completed: false,
                createdAt: new Date().toISOString()
            };
            tasks.unshift(newTask);
            saveTasks();
            taskInput.value = '';
            renderTasks();
            updateTaskCounter();
            animateTaskAddition(newTask.id);
        }
    }
    
    function renderTasks() {
        taskList.innerHTML = '';
        
        let filteredTasks = [...tasks];
        if (currentFilter === 'active') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }
        
        if (filteredTasks.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.textContent = getEmptyMessage();
            emptyMessage.classList.add('empty-message');
            taskList.appendChild(emptyMessage);
        } else {
            filteredTasks.forEach(task => {
                const taskItem = createTaskElement(task);
                taskList.appendChild(taskItem);
            });
        }
    }
    
    function createTaskElement(task) {
        const taskItem = document.createElement('li');
        taskItem.classList.add('task-item');
        taskItem.dataset.id = task.id;
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('task-checkbox');
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', toggleTaskComplete);
        
        const taskText = document.createElement('span');
        taskText.classList.add('task-text');
        if (task.completed) taskText.classList.add('completed');
        taskText.textContent = task.text;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn');
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.addEventListener('click', deleteTask);
        
        taskItem.appendChild(checkbox);
        taskItem.appendChild(taskText);
        taskItem.appendChild(deleteBtn);
        
        return taskItem;
    }
    
    function getEmptyMessage() {
        switch(currentFilter) {
            case 'all': return 'No tasks yet. Add one above!';
            case 'active': return 'No active tasks. Great job!';
            case 'completed': return 'No completed tasks yet.';
            default: return 'No tasks';
        }
    }
    
    function toggleTaskComplete(e) {
        const taskId = parseInt(e.target.parentElement.dataset.id);
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        
        if (taskIndex !== -1) {
            tasks[taskIndex].completed = e.target.checked;
            saveTasks();
            
            if (currentFilter === 'all') {
                const task = tasks.splice(taskIndex, 1)[0];
                if (task.completed) {
                    tasks.push(task);
                } else {
                    tasks.unshift(task);
                }
                saveTasks();
            }
            
            renderTasks();
            updateTaskCounter();
        }
    }
    
    function deleteTask(e) {
        const taskItem = e.target.closest('.task-item');
        taskItem.classList.add('deleting');
        
        setTimeout(() => {
            const taskId = parseInt(taskItem.dataset.id);
            tasks = tasks.filter(task => task.id !== taskId);
            saveTasks();
            renderTasks();
            updateTaskCounter();
        }, 300);
    }
    
    function clearCompletedTasks() {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
        updateTaskCounter();
    }
    
    function updateTaskCounter() {
        const activeTasks = tasks.filter(task => !task.completed).length;
        tasksLeft.textContent = `${activeTasks} ${activeTasks === 1 ? 'task' : 'tasks'} remaining`;
    }
    
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    function setTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        if (theme === 'dark') {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }
    
    function toggleTheme() {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(currentTheme);
    }
    
    function animateTaskAddition(taskId) {
        const taskItem = document.querySelector(`.task-item[data-id="${taskId}"]`);
        if (taskItem) {
            taskItem.style.opacity = '0';
            taskItem.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                taskItem.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                taskItem.style.opacity = '1';
                taskItem.style.transform = 'translateY(0)';
            }, 10);
        }
    }
    
    init();
});