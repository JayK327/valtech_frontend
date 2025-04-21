import { saveTaskToDB, getAllTasks, updateTaskInDB, deleteTaskFromDB } from './db.js';

function saveTask() {
    const vehicleName = document.getElementById('vehicleName').value.trim();
    const model = document.getElementById('model').value.trim();
    const taskDetail = document.getElementById('taskDetail').value.trim();
    const dueDate = document.getElementById('dueDate').value;
    const editIndex = document.getElementById('editIndex').value;

    if (!vehicleName || !model || !taskDetail || !dueDate) {
        alert('Please fill out all fields.');
        return;
    }

    const task = {
        vehicleName,
        model,
        taskDetail,
        dueDate,
        completed: false
    };

    if (editIndex === "") {
        saveTaskToDB(task).then(() => {
            alert('Task saved successfully!');
            renderTasks();
        }).catch((error) => {
            alert(error);
        });
    } else {
        task.id = editIndex; 
        updateTaskInDB(task).then(() => {
            alert('Task updated successfully!');
            renderTasks();
        }).catch((error) => {
            alert(error);
        });
        document.getElementById('editIndex').value = ""; 
    }

    clearForm();
}

function renderTasks() {
    const filter = document.getElementById('filter').value;
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = "";

    getAllTasks().then((tasks) => {
        tasks.forEach((task) => {
            if (filter === 'completed' && !task.completed) return;
            if (filter === 'pending' && task.completed) return;

            const row = document.createElement('tr');
            if (task.completed) row.classList.add('completed');

            const nameCell = document.createElement('td');
            nameCell.textContent = `${task.vehicleName} (${task.model})`;
            row.appendChild(nameCell);

            const detailCell = document.createElement('td');
            detailCell.textContent = task.taskDetail;
            row.appendChild(detailCell);

            const dueDateCell = document.createElement('td');
            dueDateCell.textContent = task.dueDate;
            row.appendChild(dueDateCell);

            const statusCell = document.createElement('td');
            statusCell.textContent = task.completed ? "Completed" : "Pending";
            row.appendChild(statusCell);

            const editCell = document.createElement('td');
            const editBtn = document.createElement('button');
            editBtn.textContent = "Edit";
            editBtn.onclick = () => editTask(task.id); 
            editCell.appendChild(editBtn);
            row.appendChild(editCell);

            const completeCell = document.createElement('td');
            const completeCheckbox = document.createElement('input');
            completeCheckbox.type = "checkbox";
            completeCheckbox.checked = task.completed;
            completeCheckbox.onclick = () => toggleComplete(task.id); 
            completeCell.appendChild(completeCheckbox);
            row.appendChild(completeCell);

            const deleteCell = document.createElement('td');
            const deleteCheckbox = document.createElement('input');
            deleteCheckbox.type = "checkbox";
            deleteCheckbox.onclick = () => handleDeleteTask(task.id); 
            deleteCell.appendChild(deleteCheckbox);
            row.appendChild(deleteCell);

            taskList.appendChild(row);
        });
    }).catch((error) => {
        alert(error);
    });
}

function toggleComplete(id) {
    getAllTasks().then((tasks) => {
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            updateTaskInDB(task).then(() => {
                renderTasks();
            }).catch((error) => {
                alert(error);
            });
        }
    });
}

function editTask(id) {
    getAllTasks().then((tasks) => {
        const task = tasks.find(t => t.id === id);
        if (task) {
            document.getElementById('vehicleName').value = task.vehicleName;
            document.getElementById('model').value = task.model;
            document.getElementById('taskDetail').value = task.taskDetail;
            document.getElementById('dueDate').value = task.dueDate;
            document.getElementById('editIndex').value = task.id; 
        }
    }).catch((error) => {
        alert(error);
    });
}

function handleDeleteTask(id) {
    if (confirm("Are you sure you want to delete this task?")) {
        deleteTaskFromDB(id).then(() => {
            alert('Task deleted successfully!');
            renderTasks();
        }).catch((error) => {
            alert(error);
        });
    }
}

function clearForm() {
    document.getElementById('vehicleName').value = "";
    document.getElementById('model').value = "";
    document.getElementById('taskDetail').value = "";
    document.getElementById('dueDate').value = "";
}

document.addEventListener("DOMContentLoaded", function () {
    renderTasks(); 
});

window.saveTask = saveTask;
window.resetForm = clearForm;
window.renderTasks = renderTasks;
