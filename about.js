/* ==========================================================
   LabBook - about.js (About page)
   What this file does:
   - Adds a button that shows / hides the Site Map list
   ========================================================== */

"use strict";

const toggleButton = document.getElementById("toggle-sitemap");
const siteMapList = document.getElementById("sitemap-list");

/* Flip the list between hidden and visible, then update the button text */
function toggleSiteMap() {
  siteMapList.hidden = !siteMapList.hidden;

  if (siteMapList.hidden) {
    toggleButton.textContent = "Show Site Map";
  } else {
    toggleButton.textContent = "Hide Site Map";
  }
}

toggleButton.addEventListener("click", toggleSiteMap);
