"use strict";

/*
 * StudyFlow - tanulói kiinduló fájl
 *
 * A funkciók külön brancheken készülnek el:
 * 1. feature/feladatkezeles
 * 2. feature/szures-statisztika
 * 3. feature/adatmentes
 * 4. feature/bootstrap-felulet
 * 5. fix/ures-cim (választható)
 *
 * A pontos kódrészleteket a 03_TANULOI_UTMUTATO.md tartalmazza.
 */

// 1. DOM-elemek kiválasztása.
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

// 2. Alkalmazásállapot: feladatok, szűrő és keresőkifejezés.
function createId() {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readTaskFromForm() {
    return {
        id: createId(),
        title: titleInput.value,
        category: categoryInput.value,
        priority: priorityInput.value,
        dueDate: dueDateInput.value,
        completed: false
    };
}

// 3. Adatbeolvasó, ellenőrző, formázó és renderelő függvények.


// 4. Eseménykezelők.


// 5. localStorage-kezelés és Bootstrap-komponensek.
