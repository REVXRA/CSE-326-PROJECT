/* ==========================================================
   LabBook - maintenance.js (Maintenance page)
   What this file does:
   1. Counts the equipment under maintenance and shows a summary
   2. Adds a button that shows / hides the Maintenance Schedule table
   ========================================================== */

"use strict";

const summaryText = document.getElementById("maintenance-summary");
const scheduleTable = document.getElementById("schedule-table");
const toggleButton = document.getElementById("toggle-schedule");

/* ---------- 1. Summary line ---------- */
function showSummary() {
  // The first table on the page lists the blocked equipment
  const firstTable = document.querySelector(".data-table");
  const count = firstTable.querySelectorAll("tbody tr").length;

  if (count === 0) {
    summaryText.textContent = "No equipment is under maintenance right now.";
  } else if (count === 1) {
    summaryText.textContent = "1 item is currently blocked for booking.";
  } else {
    summaryText.textContent = count + " items are currently blocked for booking.";
  }
}

/* ---------- 2. Show / hide the schedule ---------- */
function toggleSchedule() {
  scheduleTable.hidden = !scheduleTable.hidden;

  if (scheduleTable.hidden) {
    toggleButton.textContent = "Show Schedule";
  } else {
    toggleButton.textContent = "Hide Schedule";
  }
}

showSummary();
toggleButton.addEventListener("click", toggleSchedule);
