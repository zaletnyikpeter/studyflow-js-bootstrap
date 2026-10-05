"use strict";

const taskForm = document.querySelector("#taskForm");
const titleInput = document.querySelector("#taskTitle");
const categoryInput = document.querySelector("#taskCategory");
const priorityInput = document.querySelector("#taskPriority");
const dueDateInput = document.querySelector("#taskDueDate");
const formMessage = document.querySelector("#formMessage");
const taskList = document.querySelector("#taskList");
const emptyState = document.querySelector("#emptyState");
const statusMessage = document.querySelector("#statusMessage");

let tasks = [];

const priorityLabels = {
  low: "Alacsony",
  medium: "Közepes",
  high: "Magas"
};

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readTaskFromForm() {
  return {
    id: createId(),
    // A szóközök levágása egy későbbi hibajavító branch feladata lesz.
    title: titleInput.value,
    category: categoryInput.value,
    priority: priorityInput.value,
    dueDate: dueDateInput.value,
    completed: false
  };
}

function isTaskValid(task) {
  return task.title !== "" && task.category !== "" && task.priority !== "";
}

function formatDueDate(dateValue) {
  if (dateValue === "") {
    return "Nincs határidő";
  }

  const date = new Date(`${dateValue}T00:00:00`);
  return `Határidő: ${date.toLocaleDateString("hu-HU")}`;
}

function createActionButton(task, action, label) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "button button--secondary";
  button.dataset.action = action;
  button.dataset.id = task.id;
  button.textContent = label;
  button.setAttribute("aria-label", `${label}: ${task.title}`);
  return button;
}

function createTaskElement(task) {
  const item = document.createElement("li");
  item.className = "task-item";
  item.classList.toggle("task-item--completed", task.completed);

  const content = document.createElement("div");
  const title = document.createElement("h3");
  title.className = "task-title";
  title.textContent = task.title;

  const meta = document.createElement("p");
  meta.className = "task-meta";
  meta.textContent = `${task.category} • ${priorityLabels[task.priority]} • ${formatDueDate(task.dueDate)}`;

  const actions = document.createElement("div");
  actions.className = "task-actions";
  actions.append(
    createActionButton(task, "toggle", task.completed ? "Visszanyitás" : "Kész"),
    createActionButton(task, "delete", "Törlés")
  );

  content.append(title, meta);
  item.append(content, actions);
  return item;
}

function renderTasks() {
  taskList.replaceChildren(...tasks.map(createTaskElement));
  emptyState.classList.toggle("is-hidden", tasks.length > 0);
}

function showFormMessage(message) {
  formMessage.textContent = message;
}

function showStatus(message) {
  statusMessage.textContent = message;
}

taskForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const newTask = readTaskFromForm();

  if (!isTaskValid(newTask)) {
    showFormMessage("A feladat címének kitöltése kötelező.");
    titleInput.focus();
    return;
  }

  tasks.push(newTask);
  renderTasks();
  taskForm.reset();
  showFormMessage("");
  showStatus("Új feladat hozzáadva.");
  titleInput.focus();
});

taskList.addEventListener("click", function (event) {
  const actionButton = event.target.closest("button[data-action]");

  if (actionButton === null) {
    return;
  }

  const taskId = actionButton.dataset.id;

  if (actionButton.dataset.action === "toggle") {
    tasks = tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    showStatus("A feladat állapota frissült.");
  }

  if (actionButton.dataset.action === "delete") {
    tasks = tasks.filter((task) => task.id !== taskId);
    showStatus("A feladat törölve.");
  }

  renderTasks();
});

renderTasks();
