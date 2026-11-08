/* ==========================================================
   LabBook - index.js (Home page)
   What this file does:
   1. Shows a greeting that depends on the time of day
   2. Shows today's date
   3. Welcomes the user back if they logged in earlier
   ========================================================== */

"use strict";

/* ---------- 1. Work out the greeting ---------- */
function getGreeting(hour) {
  if (hour < 12) {
    return "Good morning";
  }
  if (hour < 17) {
    return "Good afternoon";
  }
  return "Good evening";
}

/* ---------- 2. Read the saved login (set by login.js) ---------- */
function getSavedUser() {
  try {
    return JSON.parse(localStorage.getItem("labbook_user"));
  } catch (error) {
    return null;
  }
}

/* ---------- 3. Build the message and show it ---------- */
function showGreeting() {
  const now = new Date();
  const greetingBox = document.getElementById("greeting");

  const dateText = now.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  let message = getGreeting(now.getHours()) + "! Today is " + dateText + ".";

  const user = getSavedUser();
  if (user) {
    message += " Welcome back, " + user.id + " (" + user.roleLabel + ").";
  }

  greetingBox.textContent = message;
}

showGreeting();
