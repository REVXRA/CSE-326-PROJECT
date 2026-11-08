/* ==========================================================
   LabBook - approvals.js (Approvals page)
   What this file does:
   - Lets staff approve or reject a pending request
   - Asks for remarks when a request is rejected
   - Removes the decided request from the table and the drop-down
   - Saves an alert that the Notifications page will show

   NOTE: Front-end demo only. No server or database is used.
   ========================================================== */

"use strict";

/* ---------- Page elements ---------- */
const decisionForm = document.getElementById("decision-form");
const requestSelect = document.getElementById("request-id");
const remarksInput = document.getElementById("remarks");
const messageBox = document.getElementById("form-message");
const pendingBody = document.getElementById("pending-body");

const ALERTS_KEY = "labbook_alerts";   // read by notifications.js

/* ---------- Helpers ---------- */
function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = "form-message " + type;
  messageBox.hidden = false;
}

// Today as yyyy-mm-dd
function getTodayString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return now.getFullYear() + "-" + month + "-" + day;
}

// Finds the table row of a request, e.g. "REQ201" (column 0 is the ID)
function findRequestRow(requestId) {
  for (const row of pendingBody.rows) {
    if (row.cells[0].textContent.trim() === requestId) {
      return row;
    }
  }
  return null;
}

// Adds one alert to the saved list
function saveAlert(alert) {
  let alerts = [];
  try {
    alerts = JSON.parse(localStorage.getItem(ALERTS_KEY)) || [];
  } catch (error) {
    alerts = [];
  }
  alerts.push(alert);
  localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
}

// Shows a row saying there is nothing left to review
function showEmptyRow() {
  const row = document.createElement("tr");
  const cell = document.createElement("td");
  cell.colSpan = 7;
  cell.textContent = "No pending requests.";
  row.appendChild(cell);
  pendingBody.appendChild(row);
}

/* ---------- Events ---------- */
decisionForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const requestId = requestSelect.value;
  const chosen = decisionForm.querySelector('input[name="decision"]:checked');
  const remarks = remarksInput.value.trim();

  if (requestId === "" || !chosen) {
    showMessage("Please select a request and a decision.", "error");
    return;
  }

  const approved = chosen.value === "approve";

  // Rule: a rejection must explain why
  if (!approved && remarks === "") {
    showMessage("Please write remarks to explain the rejection.", "error");
    return;
  }

  // Equipment name is column 3 of the request row
  const row = findRequestRow(requestId);
  const equipment = row ? row.cells[3].textContent.trim() : "equipment";

  // 1. Save the alert for the student
  let alertText = "Your request " + requestId + " for " + equipment +
                  (approved ? " was approved." : " was rejected.");
  if (remarks !== "") {
    alertText += " Remarks: " + remarks;
  }
  saveAlert({
    type: approved ? "Approval" : "Rejection",
    date: getTodayString(),
    text: alertText
  });

  // 2. Remove the request from the table and the drop-down
  if (row) {
    row.remove();
  }
  requestSelect.querySelector('option[value="' + requestId + '"]').remove();
  if (pendingBody.rows.length === 0) {
    showEmptyRow();
  }

  // 3. Clear the form, then confirm (reset also hides old messages)
  decisionForm.reset();
  showMessage(requestId + " was " + (approved ? "approved" : "rejected") +
              ". The student will see an alert on the Notifications page.", "success");
});

decisionForm.addEventListener("reset", function () {
  messageBox.hidden = true;
});
