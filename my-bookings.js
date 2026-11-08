/* ==========================================================
   LabBook - my-bookings.js (My Bookings page)
   What this file does:
   1. Adds the requests saved by the Book Equipment page to the table
   2. Lets the user cancel a booking (asks for confirmation first)
   3. Remembers cancelled bookings in the browser

   NOTE: Front-end demo only. No server or database is used.
   ========================================================== */

"use strict";

/* ---------- Page elements and settings ---------- */
const bookingsBody = document.getElementById("bookings-body");

const BOOKINGS_KEY = "labbook_bookings";    // written by book.js
const CANCELLED_KEY = "labbook_cancelled";  // list of cancelled booking IDs

// Colour class (from the CSS file) for each status
const STATUS_CLASSES = {
  "Approved": "status-good",
  "Pending": "status-wait",
  "Rejected": "status-bad",
  "Cancelled": "status-muted"
};

/* ---------- Helpers: reading and saving ---------- */
function loadList(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (error) {
    return [];
  }
}

function saveList(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
}

/* ---------- Helpers: changing a row ---------- */

// Row columns: 0 ID, 1 Equipment, 2 Date, 3 Time, 4 Status, 5 Remarks, 6 Action
function markRowCancelled(row) {
  const statusCell = row.cells[4];
  statusCell.textContent = "Cancelled";
  statusCell.className = "status-cell " + STATUS_CLASSES["Cancelled"];

  row.cells[5].textContent = "Cancelled by you";
  row.cells[6].textContent = "-";
}

// Builds a table row for a booking saved by book.js
function createBookingRow(booking) {
  const row = document.createElement("tr");

  const values = [
    booking.id,
    booking.equipmentName,
    booking.date,
    booking.start + " - " + booking.end
  ];
  values.forEach(function (text) {
    const cell = document.createElement("td");
    cell.textContent = text;
    row.appendChild(cell);
  });

  const statusCell = document.createElement("td");
  statusCell.className = "status-cell " + STATUS_CLASSES[booking.status];
  statusCell.textContent = booking.status;

  const remarksCell = document.createElement("td");
  remarksCell.textContent = booking.remarks;

  const actionCell = document.createElement("td");
  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.dataset.action = "cancel";
  cancelButton.textContent = "Cancel";
  actionCell.appendChild(cancelButton);

  row.append(statusCell, remarksCell, actionCell);
  return row;
}

/* ---------- Cancel button ---------- */
function handleCancelClick(event) {
  const button = event.target.closest('button[data-action="cancel"]');
  if (!button) {
    return;                       // the click was not on a Cancel button
  }

  const row = button.closest("tr");
  const bookingId = row.cells[0].textContent;

  if (!confirm("Cancel booking " + bookingId + "?")) {
    return;
  }

  markRowCancelled(row);

  const cancelled = loadList(CANCELLED_KEY);
  cancelled.push(bookingId);
  saveList(CANCELLED_KEY, cancelled);
}

/* ---------- On page load ---------- */

// 1. Add the saved requests to the table
loadList(BOOKINGS_KEY).forEach(function (booking) {
  bookingsBody.appendChild(createBookingRow(booking));
});

// 2. Show earlier cancellations again
const cancelledIds = loadList(CANCELLED_KEY);
bookingsBody.querySelectorAll("tr").forEach(function (row) {
  if (cancelledIds.includes(row.cells[0].textContent)) {
    markRowCancelled(row);
  }
});

// 3. One listener handles every Cancel button in the table
bookingsBody.addEventListener("click", handleCancelClick);
