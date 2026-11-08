/* ==========================================================
   LabBook - admin.js (Admin Dashboard page)
   What this file does:
   1. Add Equipment form: checks the input and adds a new table row
   2. Edit button: changes the quantity of an equipment
   3. Remove button: deletes an equipment row (asks first)
   4. Activate / Deactivate button: changes a user's status
   5. Keeps the Overview numbers up to date

   NOTE: Front-end demo only. Changes are lost when the page reloads.
   ========================================================== */

"use strict";

/* ---------- Page elements ---------- */
const equipmentForm = document.getElementById("equipment-form");
const nameInput = document.getElementById("eq-name");
const labInput = document.getElementById("eq-lab");
const categoryInput = document.getElementById("eq-category");
const quantityInput = document.getElementById("eq-quantity");
const statusSelect = document.getElementById("eq-status");
const messageBox = document.getElementById("form-message");

const equipmentBody = document.querySelector("#equipment-table tbody");
const usersBody = document.querySelector("#users-table tbody");

const stats = {
  total: document.getElementById("stat-total"),
  maintenance: document.getElementById("stat-maintenance")
};

// Colour class (from the CSS file) for each status text
const STATUS_CLASSES = {
  "Available": "status-good",
  "Under Maintenance": "status-blocked",
  "Active": "status-good",
  "Inactive": "status-muted"
};

/* ---------- Helpers ---------- */
function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = "form-message " + type;
  messageBox.hidden = false;
}

// Add (or subtract) from an Overview number, e.g. changeStat(stats.total, 1)
function changeStat(statElement, amount) {
  statElement.textContent = Number(statElement.textContent) + amount;
}

function setStatus(cell, statusText) {
  cell.textContent = statusText;
  cell.className = "status-cell " + STATUS_CLASSES[statusText];
}

// Creates a <button> with a data-action the click handlers look for
function createButton(label, action) {
  const button = document.createElement("button");
  button.type = "button";
  button.dataset.action = action;
  button.textContent = label;
  return button;
}

// Next ID: the highest number in the table or 6 (the catalogue has EQ01-EQ06)
function getNextEquipmentId() {
  let highest = 6;
  for (const row of equipmentBody.rows) {
    const number = Number(row.cells[0].textContent.replace("EQ", ""));
    if (number > highest) {
      highest = number;
    }
  }
  return "EQ" + String(highest + 1).padStart(2, "0");
}

/* ---------- 1. Add equipment ---------- */

// Row columns: 0 ID, 1 Name, 2 Lab, 3 Quantity, 4 Status, 5 Action
function createEquipmentRow(data) {
  const row = document.createElement("tr");

  [data.id, data.name, data.lab, data.quantity].forEach(function (text) {
    const cell = document.createElement("td");
    cell.textContent = text;
    row.appendChild(cell);
  });

  const statusCell = document.createElement("td");
  setStatus(statusCell, data.status);

  const actionCell = document.createElement("td");
  actionCell.append(createButton("Edit", "edit"), " ", createButton("Remove", "remove"));

  row.append(statusCell, actionCell);
  return row;
}

equipmentForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const name = nameInput.value.trim();
  const lab = labInput.value.trim();
  const category = categoryInput.value.trim();
  const quantity = Number(quantityInput.value);

  if (name.length < 3 || lab === "" || category === "") {
    showMessage("Please fill in a name (at least 3 letters), lab and category.", "error");
    return;
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    showMessage("Quantity must be a whole number of 1 or more.", "error");
    return;
  }

  const statusText = statusSelect.value === "maintenance" ? "Under Maintenance" : "Available";
  const newItem = {
    id: getNextEquipmentId(),
    name: name,
    lab: lab,
    quantity: quantity,
    status: statusText
  };

  equipmentBody.appendChild(createEquipmentRow(newItem));
  changeStat(stats.total, 1);
  if (statusText === "Under Maintenance") {
    changeStat(stats.maintenance, 1);
  }

  equipmentForm.reset();          // clear the form (this also hides old messages)
  showMessage(name + " was added as " + newItem.id + ".", "success");
});

equipmentForm.addEventListener("reset", function () {
  messageBox.hidden = true;
});

/* ---------- 2 and 3. Edit and Remove buttons ---------- */
function handleEquipmentClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const row = button.closest("tr");
  const name = row.cells[1].textContent;

  if (button.dataset.action === "edit") {
    const answer = prompt("New quantity for " + name + ":", row.cells[3].textContent);
    if (answer === null) {
      return;                     // user pressed Cancel
    }
    const newQuantity = Number(answer);
    if (answer.trim() === "" || !Number.isInteger(newQuantity) || newQuantity < 1) {
      alert("Quantity must be a whole number of 1 or more.");
      return;
    }
    row.cells[3].textContent = newQuantity;
  }

  if (button.dataset.action === "remove") {
    if (!confirm("Remove " + name + " from the equipment list?")) {
      return;
    }
    changeStat(stats.total, -1);
    if (row.cells[4].textContent === "Under Maintenance") {
      changeStat(stats.maintenance, -1);
    }
    row.remove();
  }
}

/* ---------- 4. Activate / Deactivate users ---------- */
// Row columns: 0 Reg ID, 1 Name, 2 Role, 3 Status, 4 Action
function handleUserClick(event) {
  const button = event.target.closest('button[data-action="toggle-user"]');
  if (!button) {
    return;
  }

  const statusCell = button.closest("tr").cells[3];

  if (statusCell.textContent === "Active") {
    setStatus(statusCell, "Inactive");
    button.textContent = "Activate";
  } else {
    setStatus(statusCell, "Active");
    button.textContent = "Deactivate";
  }
}

/* ---------- Connect the click handlers ---------- */
equipmentBody.addEventListener("click", handleEquipmentClick);
usersBody.addEventListener("click", handleUserClick);
