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
const searchInput = document.querySelector("#searchInput");
const filterButtons = document.querySelectorAll("[data-filter]");
const clearCompletedButton = document.querySelector("#clearCompletedButton");
const totalCount = document.querySelector("#totalCount");
const activeCount = document.querySelector("#activeCount");
const completedCount = document.querySelector("#completedCount");

let tasks = [];
let currentFilter = "all";
let searchTerm = "";

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

function getVisibleTasks() {
  return tasks.filter((task) => {
    const matchesStatus =
      currentFilter === "all" ||
      (currentFilter === "active" && !task.completed) ||
      (currentFilter === "completed" && task.completed);

    const normalizedTitle = task.title.toLocaleLowerCase("hu-HU");
    const matchesSearch = normalizedTitle.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });
}

function updateStatistics() {
  const completed = tasks.filter((task) => task.completed).length;
  totalCount.textContent = String(tasks.length);
  activeCount.textContent = String(tasks.length - completed);
  completedCount.textContent = String(completed);
}

function renderTasks() {
  const visibleTasks = getVisibleTasks();
  taskList.replaceChildren(...visibleTasks.map(createTaskElement));
  emptyState.classList.toggle("is-hidden", visibleTasks.length > 0);
  updateStatistics();
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

filterButtons.forEach((button) => {
  button.addEventListener("click", function () {
    currentFilter = button.dataset.filter;

    filterButtons.forEach((item) => {
      const selected = item === button;
      item.classList.toggle("is-active", selected);
      item.setAttribute("aria-pressed", String(selected));
    });

    renderTasks();
  });
});

searchInput.addEventListener("input", function () {
  searchTerm = searchInput.value.trim().toLocaleLowerCase("hu-HU");
  renderTasks();
});

clearCompletedButton.addEventListener("click", function () {
  const completedBeforeDelete = tasks.filter((task) => task.completed).length;

  if (completedBeforeDelete === 0) {
    showStatus("Nincs törölhető, kész feladat.");
    return;
  }

  tasks = tasks.filter((task) => !task.completed);
  showStatus(`${completedBeforeDelete} kész feladat törölve.`);
  renderTasks();
});

renderTasks();
