/* ==========================================================
   LabBook - equipment.js (Equipment Catalogue page)
   What this file does:
   - Filters the equipment table by name, lab, category and status
   - Shows how many items match
   The table updates instantly while the user types or picks an option.
   ========================================================== */

"use strict";

/* ---------- Page elements ---------- */
const filterForm = document.getElementById("filter-form");
const searchInput = document.getElementById("search");
const labSelect = document.getElementById("lab");
const categorySelect = document.getElementById("category");
const statusSelect = document.getElementById("status");
const resultCount = document.getElementById("result-count");
const tableRows = document.querySelectorAll("#equipment-table tbody tr");

/* ---------- Helpers ---------- */

// Text of the chosen option (e.g. "Biology Lab"), or "" if nothing is chosen.
// It matches the text written inside the table cells.
function getChosenText(select) {
  if (select.value === "") {
    return "";
  }
  return select.options[select.selectedIndex].text;
}

// Table columns: 0 ID, 1 Name, 2 Lab, 3 Category, 4 Quantity, 5 Status, 6 Action
function rowMatches(row, filters) {
  const name = row.cells[1].textContent.toLowerCase();
  const lab = row.cells[2].textContent.trim();
  const category = row.cells[3].textContent.trim();
  const status = row.cells[5].textContent.trim();

  const nameOk = name.includes(filters.name);
  const labOk = filters.lab === "" || lab === filters.lab;
  const categoryOk = filters.category === "" || category === filters.category;
  const statusOk = filters.status === "" || status === filters.status;

  return nameOk && labOk && categoryOk && statusOk;
}

/* ---------- Main function: show only the matching rows ---------- */
function filterTable() {
  const filters = {
    name: searchInput.value.trim().toLowerCase(),
    lab: getChosenText(labSelect),
    category: getChosenText(categorySelect),
    status: getChosenText(statusSelect)
  };

  let visibleCount = 0;

  tableRows.forEach(function (row) {
    const show = rowMatches(row, filters);
    row.hidden = !show;
    if (show) {
      visibleCount++;
    }
  });

  if (visibleCount === 0) {
    resultCount.textContent = "No equipment matches your search.";
  } else {
    resultCount.textContent = "Showing " + visibleCount + " of " + tableRows.length + " items.";
  }
}

/* ---------- Events ---------- */
searchInput.addEventListener("input", filterTable);
labSelect.addEventListener("change", filterTable);
categorySelect.addEventListener("change", filterTable);
statusSelect.addEventListener("change", filterTable);

// The Search button should filter, not reload the page
filterForm.addEventListener("submit", function (event) {
  event.preventDefault();
  filterTable();
});

// Reset fires before the fields are cleared, so wait a moment
filterForm.addEventListener("reset", function () {
  setTimeout(filterTable, 0);
});

filterTable();   // show the count when the page first loads
