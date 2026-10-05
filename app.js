"use strict";

// ---- DOM-hivatkozások ------------------------------------------------------
const taskForm = document.querySelector("#taskForm");
const titleInput = document.querySelector("#taskTitle");
const categoryInput = document.querySelector("#taskCategory");
const priorityInput = document.querySelector("#taskPriority");
const dueDateInput = document.querySelector("#taskDueDate");
const formMessage = document.querySelector("#formMessage");
const searchInput = document.querySelector("#searchInput");
const filterButtons = document.querySelectorAll("[data-filter]");
const clearCompletedButton = document.querySelector("#clearCompletedButton");
const taskList = document.querySelector("#taskList");
const emptyState = document.querySelector("#emptyState");
const totalCount = document.querySelector("#totalCount");
const activeCount = document.querySelector("#activeCount");
const completedCount = document.querySelector("#completedCount");
const statusMessage = document.querySelector("#statusMessage");
const deleteModalElement = document.querySelector("#deleteModal");
const deleteTaskName = document.querySelector("#deleteTaskName");
const confirmDeleteButton = document.querySelector("#confirmDeleteButton");
const toastElement = document.querySelector("#actionToast");
const toastBody = document.querySelector("#toastBody");

// ---- Alkalmazásállapot -----------------------------------------------------
const STORAGE_KEY = "studyflow.tasks.v1";

const sampleTasks = [
  {
    id: "sample-dom",
    title: "DOM eseménykezelés gyakorlása",
    category: "JavaScript",
    priority: "high",
    dueDate: "",
    completed: false
  },
  {
    id: "sample-git",
    title: "Feature branch és Pull Request elkészítése",
    category: "Git",
    priority: "medium",
    dueDate: "",
    completed: true
  }
];

let tasks = loadTasks();
let currentFilter = "all";
let searchTerm = "";
let pendingDeleteId = null;

const prioritySettings = {
  low: { label: "Alacsony", className: "text-bg-success" },
  medium: { label: "Közepes", className: "text-bg-warning" },
  high: { label: "Magas", className: "text-bg-danger" }
};

// ---- Adatkezelő függvények ------------------------------------------------
function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readTaskFromForm() {
  return {
    id: createId(),
    // Ismert hiba: a csak szóközökből álló cím még átjut az ellenőrzésen.
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

function loadTasks() {
  try {
    const storedValue = localStorage.getItem(STORAGE_KEY);

    if (storedValue === null) {
      return sampleTasks.map((task) => ({ ...task }));
    }

    const parsedValue = JSON.parse(storedValue);
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch (error) {
    console.warn("A mentett feladatok nem olvashatók:", error);
    return sampleTasks.map((task) => ({ ...task }));
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.warn("A feladatok mentése sikertelen:", error);
    showFormMessage("A böngésző nem tudta elmenteni a feladatokat.", true);
  }
}

function persistAndRender() {
  saveTasks();
  renderTasks();
}

// ---- Szűrés és formázás ---------------------------------------------------
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

function formatDueDate(dateValue) {
  if (dateValue === "") {
    return "Nincs határidő";
  }

  const date = new Date(`${dateValue}T00:00:00`);
  return `Határidő: ${date.toLocaleDateString("hu-HU")}`;
}

function updateStatistics() {
  const completed = tasks.filter((task) => task.completed).length;
  totalCount.textContent = String(tasks.length);
  activeCount.textContent = String(tasks.length - completed);
  completedCount.textContent = String(completed);
}

// ---- DOM-előállítás -------------------------------------------------------
function createBadge(text, className) {
  const badge = document.createElement("span");
  badge.className = `badge ${className}`;
  badge.textContent = text;
  return badge;
}

function createActionButton(task, action, label, className) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `btn btn-sm ${className}`;
  button.dataset.action = action;
  button.dataset.id = task.id;
  button.textContent = label;
  button.setAttribute("aria-label", `${label}: ${task.title}`);
  return button;
}

function createTaskElement(task) {
  const item = document.createElement("li");
  item.className = "list-group-item task-item py-3";
  item.classList.toggle("task-item--completed", task.completed);

  const layout = document.createElement("div");
  layout.className = "d-flex flex-column flex-md-row justify-content-between gap-3";

  const content = document.createElement("div");
  content.className = "flex-grow-1";

  const title = document.createElement("h3");
  title.className = "task-title h6 mb-2";
  title.textContent = task.title;

  const meta = document.createElement("div");
  meta.className = "task-meta small text-body-secondary";
  meta.append(
    createBadge(task.category, "text-bg-primary"),
    createBadge(prioritySettings[task.priority].label, prioritySettings[task.priority].className)
  );

  const dueDate = document.createElement("span");
  dueDate.textContent = formatDueDate(task.dueDate);
  meta.append(dueDate);

  const actions = document.createElement("div");
  actions.className = "btn-group align-self-md-center";
  actions.setAttribute("role", "group");
  actions.setAttribute("aria-label", `${task.title} műveletei`);

  actions.append(
    createActionButton(
      task,
      "toggle",
      task.completed ? "Visszanyitás" : "Kész",
      task.completed ? "btn-outline-secondary" : "btn-outline-success"
    ),
    createActionButton(task, "delete", "Törlés", "btn-outline-danger")
  );

  content.append(title, meta);
  layout.append(content, actions);
  item.append(layout);
  return item;
}

function renderTasks() {
  const visibleTasks = getVisibleTasks();
  taskList.replaceChildren(...visibleTasks.map(createTaskElement));
  emptyState.classList.toggle("d-none", visibleTasks.length > 0);
  updateStatistics();
}

// ---- Visszajelzések és Bootstrap-komponensek -----------------------------
function showFormMessage(message, isError) {
  formMessage.textContent = message;
  formMessage.className = `alert mb-0 ${isError ? "alert-danger" : "alert-success"}`;
}

function clearFormMessage() {
  formMessage.textContent = "";
  formMessage.className = "alert d-none mb-0";
}

function showToast(message) {
  statusMessage.textContent = message;
  toastBody.textContent = message;

  if (window.bootstrap !== undefined) {
    const toast = window.bootstrap.Toast.getOrCreateInstance(toastElement, { delay: 3000 });
    toast.show();
  }
}

function deleteTask(taskId) {
  tasks = tasks.filter((task) => task.id !== taskId);
  pendingDeleteId = null;
  persistAndRender();
  showToast("A feladat törölve.");
}

function requestDelete(taskId) {
  const task = tasks.find((item) => item.id === taskId);

  if (task === undefined) {
    return;
  }

  pendingDeleteId = taskId;
  deleteTaskName.textContent = task.title;

  if (window.bootstrap !== undefined) {
    const modal = window.bootstrap.Modal.getOrCreateInstance(deleteModalElement);
    modal.show();
  } else if (window.confirm(`Biztosan törlöd ezt a feladatot: ${task.title}?`)) {
    deleteTask(taskId);
  }
}

// ---- Eseménykezelők -------------------------------------------------------
taskForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const newTask = readTaskFromForm();

  if (!isTaskValid(newTask)) {
    showFormMessage("A feladat címének kitöltése kötelező.", true);
    titleInput.focus();
    return;
  }

  tasks.push(newTask);
  persistAndRender();
  taskForm.reset();
  showFormMessage("A feladat sikeresen hozzáadva.", false);
  showToast("Új feladat hozzáadva.");
  titleInput.focus();
});

taskForm.addEventListener("reset", function () {
  window.setTimeout(clearFormMessage, 0);
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
    persistAndRender();
    showToast("A feladat állapota frissült.");
  }

  if (actionButton.dataset.action === "delete") {
    requestDelete(taskId);
  }
});

filterButtons.forEach((button) => {
  button.addEventListener("click", function () {
    currentFilter = button.dataset.filter;

    filterButtons.forEach((item) => {
      const selected = item === button;
      item.classList.toggle("btn-primary", selected);
      item.classList.toggle("btn-outline-primary", !selected);
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
    showToast("Nincs törölhető, kész feladat.");
    return;
  }

  tasks = tasks.filter((task) => !task.completed);
  persistAndRender();
  showToast(`${completedBeforeDelete} kész feladat törölve.`);
});

confirmDeleteButton.addEventListener("click", function () {
  if (pendingDeleteId === null) {
    return;
  }

  const modal = window.bootstrap?.Modal.getInstance(deleteModalElement);
  modal?.hide();
  deleteTask(pendingDeleteId);
});

deleteModalElement.addEventListener("hidden.bs.modal", function () {
  pendingDeleteId = null;
});

// Első megjelenítés a mentett vagy mintaadatokból.
renderTasks();
