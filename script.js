// Load raw materials from raw-items.json and populate the existing dropdowns
async function loadRawMaterials() {
  try {
    const response = await fetch('raw-items.json'); 
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const items = await response.json(); 
    populateAllDropdowns(items);
  } catch (error) {
    console.error('Error loading raw materials:', error);
  }
}

// Populate all existing dropdowns with raw materials
function populateAllDropdowns(items) {
  const dropdowns = document.querySelectorAll('.raw-material-dropdown');
  dropdowns.forEach(dropdown => {
    populateDropdown(dropdown, items);
  });
}

// Populate a single dropdown with items
function populateDropdown(dropdown, items) {
  // Clear any existing options
  dropdown.innerHTML = '';
  
  // Add each raw material to the dropdown
  items.forEach(item => {
    const option = document.createElement('option');
    option.value = item.name;
    option.textContent = item.name;
    dropdown.appendChild(option);
  });
}

// Function to add a new donation row
async function addRow() {
  const donationRows = document.getElementById('donationRows');
  const newRow = document.createElement('div');
  newRow.classList.add('donation-row');
  newRow.innerHTML = `
    <label for="raw-material">Raw Material:</label>
    <select name="raw-material[]" class="raw-material-dropdown" required></select>

    <label for="rarity">Rarity:</label>
    <select name="rarity[]" required>
      <option value="Common">Common</option>
      <option value="Uncommon">Uncommon</option>
      <option value="Rare">Rare</option>
      <option value="Epic">Epic</option>
      <option value="Legendary">Legendary</option>
    </select>

    <label for="quantity">Quantity:</label>
    <input type="number" name="quantity[]" min="1" required />

    <button type="button" onclick="removeRow(this)">Remove</button>
  `;
  donationRows.appendChild(newRow);

  // Reload raw materials and populate the new dropdown
  try {
    const response = await fetch('raw-items.json'); 
    const items = await response.json();
    const dropdown = newRow.querySelector('.raw-material-dropdown');
    populateDropdown(dropdown, items);
  } catch (error) {
    console.error('Error populating new row dropdown:', error);
  }
}

// Function to remove a donation row
function removeRow(button) {
  button.parentElement.remove();
}

// Initial load of raw materials for the default row(s)
document.addEventListener('DOMContentLoaded', loadRawMaterials);
