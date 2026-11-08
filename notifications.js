/* ==========================================================
   LabBook - notifications.js (Notifications page)
   What this file does:
   1. Adds new alerts saved by the Approvals page to the top of the list
   2. Filters the alerts by type (Approval, Rejection, ...)
   3. Shows the number of unread alerts
   4. "Mark All as Read" dims every alert

   NOTE: Front-end demo only. No server or database is used.
   ========================================================== */

"use strict";

/* ---------- Page elements ---------- */
const filterForm = document.getElementById("filter-form");
const typeSelect = document.getElementById("type");
const readForm = document.getElementById("read-form");
const alertList = document.getElementById("alert-list");
const unreadText = document.getElementById("unread-count");

const ALERTS_KEY = "labbook_alerts";   // written by approvals.js

/* ---------- Helpers ---------- */

// The alert type is the bold text at the start of each <li>
function getAlertType(item) {
  return item.querySelector("strong").textContent.trim().toLowerCase();
}

// Builds <li><strong>Type</strong> (date) - text</li>
function createAlertItem(alert) {
  const item = document.createElement("li");

  const type = document.createElement("strong");
  type.textContent = alert.type;

  item.append(type, " (" + alert.date + ") - " + alert.text);
  return item;
}

function loadSavedAlerts() {
  try {
    return JSON.parse(localStorage.getItem(ALERTS_KEY)) || [];
  } catch (error) {
    return [];
  }
}

/* ---------- Unread counter ---------- */
function updateUnreadCount() {
  const unread = alertList.querySelectorAll("li:not(.is-read)").length;

  if (unread === 0) {
    unreadText.textContent = "You have no unread alerts.";
  } else if (unread === 1) {
    unreadText.textContent = "You have 1 unread alert.";
  } else {
    unreadText.textContent = "You have " + unread + " unread alerts.";
  }
}

/* ---------- Filter by type ---------- */
function filterAlerts() {
  const chosenType = typeSelect.value;          // "" means all alerts

  alertList.querySelectorAll("li").forEach(function (item) {
    item.hidden = chosenType !== "" && getAlertType(item) !== chosenType;
  });
}

/* ---------- Events ---------- */
typeSelect.addEventListener("change", filterAlerts);

filterForm.addEventListener("submit", function (event) {
  event.preventDefault();
  filterAlerts();
});

readForm.addEventListener("submit", function (event) {
  event.preventDefault();

  alertList.querySelectorAll("li").forEach(function (item) {
    item.classList.add("is-read");
  });
  updateUnreadCount();
});

/* ---------- On page load ---------- */

// Newest saved alert goes first (the newest was saved last)
loadSavedAlerts().forEach(function (alert) {
  alertList.prepend(createAlertItem(alert));
});

updateUnreadCount();
