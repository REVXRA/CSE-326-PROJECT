/* ==========================================================
   LabBook - login.js (Login page)
   What this file does:
   1. Checks the Registration ID and password before "logging in"
   2. Lets the user show / hide the password
   3. Remembers the Registration ID when "Remember Me" is ticked
   4. Saves who is logged in so other pages (e.g. Home) can use it

   NOTE: This is a front-end demo. There is no server, so no real
   password check is done and the password is never stored.
   ========================================================== */

"use strict";

/* ---------- Page elements ---------- */
const loginForm = document.getElementById("login-form");
const regInput = document.getElementById("reg-no");
const passwordInput = document.getElementById("password");
const showPasswordBox = document.getElementById("show-password");
const rememberBox = document.getElementById("remember-me");
const messageBox = document.getElementById("form-message");

/* ---------- Settings ---------- */
const ID_PATTERN = /^[A-Za-z0-9]{4,12}$/;   // letters and digits, 4 to 12 long
const MIN_PASSWORD_LENGTH = 6;

const ROLE_LABELS = {
  "student": "Student",
  "faculty": "Faculty",
  "admin": "Admin",
  "lab-staff": "Lab Instructor / Technician"
};

/* ---------- Helpers ---------- */
function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = "form-message " + type;
  messageBox.hidden = false;
}

function getSelectedRole() {
  const chosen = loginForm.querySelector('input[name="usertype"]:checked');
  return chosen ? chosen.value : "";
}

/* Returns an error text, or "" when everything is fine */
function validateLogin(role, regId, password) {
  if (role === "") {
    return "Please choose how you want to log in.";
  }
  if (!ID_PATTERN.test(regId)) {
    return "Registration ID must be 4 to 12 letters or digits (no spaces).";
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return "Password must be at least " + MIN_PASSWORD_LENGTH + " characters long.";
  }
  return "";
}

/* ---------- Events ---------- */

// Show / hide the password
showPasswordBox.addEventListener("change", function () {
  passwordInput.type = showPasswordBox.checked ? "text" : "password";
});

// Submit the form
loginForm.addEventListener("submit", function (event) {
  event.preventDefault();                       // stop the page from reloading

  const role = getSelectedRole();
  const regId = regInput.value.trim();
  const password = passwordInput.value;

  const problem = validateLogin(role, regId, password);
  if (problem !== "") {
    showMessage(problem, "error");
    return;
  }

  // Save the login so other pages can greet the user
  const user = { id: regId, role: role, roleLabel: ROLE_LABELS[role] };
  localStorage.setItem("labbook_user", JSON.stringify(user));

  // "Remember Me" keeps only the Registration ID, never the password
  if (rememberBox.checked) {
    localStorage.setItem("labbook_remember_id", regId);
  } else {
    localStorage.removeItem("labbook_remember_id");
  }

  showMessage("Welcome, " + regId + "! You are logged in as " + user.roleLabel + ".", "success");
  passwordInput.value = "";
});

// Clear button also hides the old message
loginForm.addEventListener("reset", function () {
  messageBox.hidden = true;
});

/* ---------- On page load: fill in the remembered ID ---------- */
const rememberedId = localStorage.getItem("labbook_remember_id");
if (rememberedId) {
  regInput.value = rememberedId;
  rememberBox.checked = true;
}
