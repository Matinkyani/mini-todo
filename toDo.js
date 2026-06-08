const taskListElement = document.getElementById("taskList");
const taskModal = document.getElementById("taskModal");
const modalTitle = document.getElementById("modalTitle");
const taskTitleInput = document.getElementById("taskTitle");
const subTasksContainer = document.getElementById("subTasksContainer");
const saveBtn = document.getElementById("saveBtn");
const addTaskBtn = document.getElementById("addTask");

let editIndex = null;

// --- Task Manager ---
const taskManager = (function () {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    function saveTasks() {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    return {
        getTasks: () => tasks,
        addTask: (task) => {
            tasks.push(task);
            saveTasks();
        },
        updateTask: (index, updatedTask) => {
            tasks[index] = updatedTask;
            saveTasks();
        },
        removeTask: (index) => {
            tasks.splice(index, 1);
            saveTasks();
        },
        updateSubTaskStatus: (taskIndex, subTaskIndex, status) => {
            if (
                tasks[taskIndex] &&
                tasks[taskIndex].subTasks &&
                tasks[taskIndex].subTasks[subTaskIndex]
            ) {
                tasks[taskIndex].subTasks[subTaskIndex].status = status;
                saveTasks();
            }
        }
    };
})();

// --- SubTask Input ---
function addSubTaskInput(initialValue = "") {
    const inputDiv = document.createElement("div");
    inputDiv.classList.add("subTaskInputWrapper");
    inputDiv.innerHTML = `
        <input type="text" class="subTaskInput" placeholder="توضیح" value="${initialValue}">
        <button type="button" class="removeSubTaskBtn" onclick="removeSubTaskInput(this)">❌</button>
    `;
    subTasksContainer.appendChild(inputDiv);
}

function removeSubTaskInput(buttonElement) {
    buttonElement.closest(".subTaskInputWrapper").remove();
}

// --- Render ---
function renderTasks() {
    taskListElement.innerHTML = "";
    const tasks = taskManager.getTasks();

    if (!tasks.length) {
        taskListElement.innerHTML = "<p class='empty-message'>هنوز هیچ تسکی ثبت نشده است.</p>";
        return;
    }

    tasks.forEach((task, tIndex) => {
        const subTasks = task.subTasks || [];

        const subTasksHtml = subTasks.map((sub, sIndex) => {
            let statusClass = "status-normal";
            if (sub.status === 1) statusClass = "status-done";
            if (sub.status === 2) statusClass = "status-undone";

            return `
                <div class="sub-task ${statusClass}">
                    <span class="sub-task-text">${sub.text}</span>
                    <div class="sub-task-actions">
                        <button class="btn-done" onclick="setSubTaskStatus(${tIndex}, ${sIndex}, 1)">انجام شد ✅</button>
                        <button class="btn-undone" onclick="setSubTaskStatus(${tIndex}, ${sIndex}, 2)">انجام نشد ❌</button>
                        <button class="btn-reset" onclick="setSubTaskStatus(${tIndex}, ${sIndex}, 0)">عادی</button>
                    </div>
                </div>
            `;
        }).join("");

        const li = document.createElement("li");
        li.classList.add("task-item");
        li.innerHTML = `
            <div class="task-header">
                <h3>${task.title}</h3>
                <div class="task-actions">
                    <button class="edit-btn" onclick="editTask(${tIndex})">✏️</button>
                    <button class="delete-btn" onclick="deleteTask(${tIndex})">🗑️</button>
                </div>
            </div>
            <div class="sub-tasks-list">
                ${subTasksHtml}
            </div>
            <div class="task-date">${task.date || ""}</div>
        `;
        taskListElement.appendChild(li);
    });
}

// --- Status Change ---
window.setSubTaskStatus = (taskIndex, subTaskIndex, status) => {
    taskManager.updateSubTaskStatus(taskIndex, subTaskIndex, status);
    renderTasks();
};

// --- Delete Task ---
window.deleteTask = (index) => {
    if (confirm("آیا از حذف این تسک مطمئن هستید؟")) {
        taskManager.removeTask(index);
        renderTasks();
    }
};

// --- Edit Task ---
window.editTask = (index) => {
    editIndex = index;
    const task = taskManager.getTasks()[index];

    modalTitle.textContent = "ویرایش تسک";
    taskTitleInput.value = task.title;
    subTasksContainer.innerHTML = "";

    (task.subTasks || []).forEach(sub => addSubTaskInput(sub.text));

    taskModal.showModal();
};

// --- Add New Task ---
addTaskBtn.onclick = () => {
    editIndex = null;
    modalTitle.textContent = "تسک جدید";
    taskTitleInput.value = "";
    subTasksContainer.innerHTML = "";
    addSubTaskInput();
    taskModal.showModal();
};

// --- Save ---
saveBtn.onclick = (e) => {
    e.preventDefault();

    const title = taskTitleInput.value.trim();
    const subTaskInputs = subTasksContainer.querySelectorAll(".subTaskInput");

    const subTasksData = [];
    subTaskInputs.forEach(input => {
        const text = input.value.trim();
        if (text) {
            subTasksData.push({
                text: text,
                status: 0
            });
        }
    });

    if (!title || subTasksData.length === 0) {
        alert("لطفاً عنوان و حداقل یک توضیح وارد کنید.");
        return;
    }

    const newTask = {
        title,
        subTasks: subTasksData,
        date: new Date().toLocaleString("fa-IR")
    };

    if (editIndex !== null) {
        taskManager.updateTask(editIndex, newTask);
    } else {
        taskManager.addTask(newTask);
    }

    taskModal.close();
    renderTasks();
};

document.addEventListener("DOMContentLoaded", renderTasks);
