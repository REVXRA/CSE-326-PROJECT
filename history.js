/* ==========================================================
   LabBook - history.js (Usage History page)
   What this file does:
   - Filters the Past Bookings table by equipment, outcome and dates
   - Updates the Summary numbers to match the visible rows
   ========================================================== */

"use strict";

/* ---------- Page elements ---------- */
const historyForm = document.getElementById("history-form");
const equipmentSelect = document.getElementById("history-equipment");
const outcomeSelect = document.getElementById("outcome");
const fromInput = document.getElementById("from-date");
const toInput = document.getElementById("to-date");
const messageBox = document.getElementById("form-message");
const tableRows = document.querySelectorAll("#history-body tr");

const summary = {
  total: document.getElementById("sum-total"),
  completed: document.getElementById("sum-completed"),
  cancelled: document.getElementById("sum-cancelled"),
  missed: document.getElementById("sum-missed")
};

/* ---------- Helpers ---------- */
function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = "form-message " + type;
  messageBox.hidden = false;
}

// Text of the chosen option (e.g. "Oscilloscope C"), or "" if nothing is chosen
function getChosenText(select) {
  if (select.value === "") {
    return "";
  }
  return select.options[select.selectedIndex].text;
}

// Table columns: 0 ID, 1 Equipment, 2 Lab, 3 Date, 4 Time, 5 Outcome
// Dates look like 2026-09-15, so plain text comparison works for ranges
function rowMatches(row, filters) {
  const equipment = row.cells[1].textContent.trim();
  const date = row.cells[3].textContent.trim();
  const outcome = row.cells[5].textContent.trim().toLowerCase();

  const equipmentOk = filters.equipment === "" || equipment === filters.equipment;
  const outcomeOk = filters.outcome === "" || outcome === filters.outcome;
  const fromOk = filters.from === "" || date >= filters.from;
  const toOk = filters.to === "" || date <= filters.to;

  return equipmentOk && outcomeOk && fromOk && toOk;
}

/* ---------- Main function: filter rows and update the summary ---------- */
function showHistory() {
  const filters = {
    equipment: getChosenText(equipmentSelect),
    outcome: outcomeSelect.value,
    from: fromInput.value,
    to: toInput.value
  };

  // Check the date range before filtering
  if (filters.from !== "" && filters.to !== "" && filters.from > filters.to) {
    showMessage("The 'From' date cannot be after the 'To' date.", "error");
    return;
  }
  messageBox.hidden = true;

  const counts = { total: 0, completed: 0, cancelled: 0, missed: 0 };

  tableRows.forEach(function (row) {
    const show = rowMatches(row, filters);
    row.hidden = !show;

    if (show) {
      counts.total++;
      counts[row.cells[5].textContent.trim().toLowerCase()]++;
    }
  });

  summary.total.textContent = "Total bookings: " + counts.total;
  summary.completed.textContent = "Completed: " + counts.completed;
  summary.cancelled.textContent = "Cancelled: " + counts.cancelled;
  summary.missed.textContent = "Missed: " + counts.missed;

  if (counts.total === 0) {
    showMessage("No bookings match these filters.", "error");
  }
}

/* ---------- Events ---------- */
historyForm.addEventListener("submit", function (event) {
  event.preventDefault();
  showHistory();
});

// Reset fires before the fields are cleared, so wait a moment
historyForm.addEventListener("reset", function () {
  setTimeout(showHistory, 0);
});
