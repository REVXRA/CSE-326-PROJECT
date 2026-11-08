/* ==========================================================
   LabBook - availability.js (Availability page)
   What this file does:
   - Shows the time slots for the chosen equipment and date
   - Blocks past dates and Sundays (labs are closed)
   - "Book this slot" links open the booking form pre-filled

   NOTE: The slot data below is sample data (no database).
   Keep it in step with the BUSY_SLOTS list in book.js.
   ========================================================== */

"use strict";

/* ---------- Page elements ---------- */
const availabilityForm = document.getElementById("availability-form");
const equipmentSelect = document.getElementById("equipment");
const dateInput = document.getElementById("date");
const messageBox = document.getElementById("form-message");
const slotCaption = document.getElementById("slot-caption");
const slotBody = document.getElementById("slot-body");

/* ---------- Sample data: the slots of each equipment every day ---------- */
const SLOTS = {
  EQ03: [
    { start: "09:00", end: "11:00", status: "free" },
    { start: "11:00", end: "13:00", status: "booked" },
    { start: "14:00", end: "16:00", status: "free" },
    { start: "16:00", end: "18:00", status: "pending" }
  ],
  EQ04: [
    { start: "09:00", end: "11:00", status: "booked" },
    { start: "11:00", end: "13:00", status: "free" },
    { start: "14:00", end: "16:00", status: "free" },
    { start: "16:00", end: "18:00", status: "free" }
  ],
  EQ05: [
    { start: "09:00", end: "11:00", status: "free" },
    { start: "11:00", end: "13:00", status: "free" },
    { start: "14:00", end: "16:00", status: "pending" },
    { start: "16:00", end: "18:00", status: "booked" }
  ],
  EQ06: [
    { start: "09:00", end: "11:00", status: "free" },
    { start: "11:00", end: "13:00", status: "booked" },
    { start: "14:00", end: "16:00", status: "free" },
    { start: "16:00", end: "18:00", status: "free" }
  ]
};

// Label and colour class (from the CSS file) for each status
const STATUS_INFO = {
  free: { label: "Free", cssClass: "status-good" },
  booked: { label: "Booked", cssClass: "status-booked" },
  pending: { label: "Pending Approval", cssClass: "status-wait" }
};

/* ---------- Helpers ---------- */

// Today as yyyy-mm-dd (the format used by <input type="date">)
function getTodayString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return now.getFullYear() + "-" + month + "-" + day;
}

function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = "form-message " + type;
  messageBox.hidden = false;
}

// Builds one table row (Time Slot | Status | Action) for a slot
function createSlotRow(slot, equipmentId, date) {
  const row = document.createElement("tr");
  const info = STATUS_INFO[slot.status];

  const timeCell = document.createElement("td");
  timeCell.textContent = slot.start + " - " + slot.end;

  const statusCell = document.createElement("td");
  statusCell.className = "status-cell " + info.cssClass;
  statusCell.textContent = info.label;

  const actionCell = document.createElement("td");
  if (slot.status === "free") {
    const link = document.createElement("a");
    link.textContent = "Book this slot";
    link.href = "book.html?equipment=" + equipmentId + "&date=" + date +
                "&start=" + slot.start + "&end=" + slot.end;
    actionCell.appendChild(link);
  } else {
    actionCell.textContent = "Not available";
  }

  row.append(timeCell, statusCell, actionCell);
  return row;
}

/* ---------- Main function: show the slots ---------- */
function showSlots(equipmentId, date) {
  const equipmentName = equipmentSelect.options[equipmentSelect.selectedIndex].text;

  slotCaption.textContent = "Result: " + equipmentName + " on " + date;
  slotBody.replaceChildren();                    // remove the old rows

  SLOTS[equipmentId].forEach(function (slot) {
    slotBody.appendChild(createSlotRow(slot, equipmentId, date));
  });
}

/* ---------- Events ---------- */
availabilityForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const equipmentId = equipmentSelect.value;
  const date = dateInput.value;

  if (equipmentId === "" || date === "") {
    showMessage("Please choose an equipment and a date.", "error");
    return;
  }
  if (date < getTodayString()) {
    showMessage("That date is in the past. Please choose today or a later date.", "error");
    return;
  }

  // getDay() returns 0 for Sunday
  if (new Date(date + "T00:00:00").getDay() === 0) {
    showMessage("Labs are closed on Sundays. Please choose another date.", "error");
    return;
  }

  showSlots(equipmentId, date);
  showMessage("Showing the time slots below.", "success");
});

availabilityForm.addEventListener("reset", function () {
  messageBox.hidden = true;
});

/* ---------- On page load ---------- */
dateInput.min = getTodayString();   // the date picker cannot go before today
