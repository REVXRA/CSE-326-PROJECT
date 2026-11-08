/* ==========================================================
   LabBook - book.js (Book Equipment page)
   What this file does:
   1. Checks the booking form using the "Conflict Rules" of the page
        - date must be today or later
        - start time must be earlier than end time
        - slot must not overlap another approved / pending booking
   2. Saves a valid request in the browser (localStorage) so it
      appears on the My Bookings page with status "Pending"
   3. Pre-fills the form when opened from the Availability page

   NOTE: Front-end demo only. No server or database is used.
   ========================================================== */

"use strict";

/* ---------- Page elements ---------- */
const bookingForm = document.getElementById("booking-form");
const regInput = document.getElementById("reg-no");
const supervisorInput = document.getElementById("supervisor");
const equipmentSelect = document.getElementById("equipment");
const dateInput = document.getElementById("date");
const startInput = document.getElementById("start-time");
const endInput = document.getElementById("end-time");
const purposeInput = document.getElementById("purpose");
const messageBox = document.getElementById("form-message");

/* ---------- Sample data: slots already taken every day ---------- */
// Keep in step with the SLOTS list in availability.js
const BUSY_SLOTS = {
  EQ03: [
    { start: "11:00", end: "13:00", status: "Booked" },
    { start: "16:00", end: "18:00", status: "Pending" }
  ],
  EQ04: [
    { start: "09:00", end: "11:00", status: "Booked" }
  ],
  EQ05: [
    { start: "14:00", end: "16:00", status: "Pending" },
    { start: "16:00", end: "18:00", status: "Booked" }
  ],
  EQ06: [
    { start: "11:00", end: "13:00", status: "Booked" }
  ]
};

const STORAGE_KEY = "labbook_bookings";
const FIRST_NEW_BOOKING_NUMBER = 104;   // BK101 to BK103 already exist

/* ---------- Helpers ---------- */

function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = "form-message " + type;
  messageBox.hidden = false;
}

// Today as yyyy-mm-dd (the format used by <input type="date">)
function getTodayString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return now.getFullYear() + "-" + month + "-" + day;
}

// "09:30" -> 570 (minutes since midnight), so times can be compared
function toMinutes(timeText) {
  const parts = timeText.split(":");
  return Number(parts[0]) * 60 + Number(parts[1]);
}

// Two time ranges overlap when each one starts before the other ends
function overlaps(startA, endA, startB, endB) {
  return toMinutes(startA) < toMinutes(endB) && toMinutes(startB) < toMinutes(endA);
}

function loadBookings() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (error) {
    return [];
  }
}

function saveBookings(bookings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}

/* ---------- Validation ---------- */

// Returns the clashing slot (or booking) text, or "" if there is no clash
function findConflict(equipmentId, date, start, end) {
  // 1. Slots that are already taken (sample data)
  const busyList = BUSY_SLOTS[equipmentId] || [];
  for (const slot of busyList) {
    if (overlaps(start, end, slot.start, slot.end)) {
      return slot.start + " - " + slot.end + " is already " + slot.status.toLowerCase() + ".";
    }
  }

  // 2. Requests the user already sent from this browser
  for (const booking of loadBookings()) {
    const sameSlot = booking.equipmentId === equipmentId && booking.date === date;
    if (sameSlot && overlaps(start, end, booking.start, booking.end)) {
      return "you already requested this equipment at " + booking.start + " - " + booking.end + " (" + booking.id + ").";
    }
  }
  return "";
}

// Returns an error text, or "" when the form is valid
function validateBooking(data) {
  if (data.date < getTodayString()) {
    return "The date must be today or a future date.";
  }
  if (toMinutes(data.start) >= toMinutes(data.end)) {
    return "The start time must be earlier than the end time.";
  }

  const conflict = findConflict(data.equipmentId, data.date, data.start, data.end);
  if (conflict !== "") {
    return "Time clash: " + conflict;
  }
  return "";
}

/* ---------- Saving a request ---------- */
function saveRequest(data) {
  const bookings = loadBookings();

  const booking = {
    id: "BK" + (FIRST_NEW_BOOKING_NUMBER + bookings.length),
    equipmentId: data.equipmentId,
    equipmentName: data.equipmentName,
    date: data.date,
    start: data.start,
    end: data.end,
    status: "Pending",
    remarks: "Waiting for approval"
  };

  bookings.push(booking);
  saveBookings(bookings);
  return booking;
}

/* ---------- Events ---------- */
bookingForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const data = {
    equipmentId: equipmentSelect.value,
    equipmentName: equipmentSelect.options[equipmentSelect.selectedIndex].text,
    date: dateInput.value,
    start: startInput.value,
    end: endInput.value
  };

  if (purposeInput.value.trim().length < 10) {
    showMessage("Please describe the purpose in at least 10 characters.", "error");
    return;
  }

  const problem = validateBooking(data);
  if (problem !== "") {
    showMessage(problem, "error");
    return;
  }

  const booking = saveRequest(data);
  bookingForm.reset();            // clear the form first (this also hides old messages)
  showMessage(
    "Request " + booking.id + " sent for " + booking.equipmentName + " on " + booking.date +
    " (" + booking.start + " - " + booking.end + "). Track it on the My Bookings page.",
    "success"
  );
});

bookingForm.addEventListener("reset", function () {
  messageBox.hidden = true;
});

/* ---------- On page load ---------- */

// The date picker cannot go before today
dateInput.min = getTodayString();

// Opened from "Book this slot"? Fill in the details from the link.
const params = new URLSearchParams(window.location.search);
if (params.get("equipment")) { equipmentSelect.value = params.get("equipment"); }
if (params.get("date")) { dateInput.value = params.get("date"); }
if (params.get("start")) { startInput.value = params.get("start"); }
if (params.get("end")) { endInput.value = params.get("end"); }
