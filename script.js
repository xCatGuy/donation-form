// Function to reset the form
async function resetForm() {
  const form = document.getElementById('donationForm');
  const donationRows = document.getElementById('donationRows');

  // Clear all rows except the first one
  donationRows.innerHTML = `
    <div class="donation-row">
      <label for="raw-material">Raw Material:</label>
      <select name="raw-material[]" class="raw-material-dropdown select2" required></select>

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
    </div>
  `;

  // Reset the username field
  form.querySelector('#username').value = '';

  // Reload raw materials for the first dropdown
  const dropdown = donationRows.querySelector('.raw-material-dropdown');
  try {
    const response = await fetch('raw-items.json');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const items = await response.json();
    populateDropdownWithGroups(dropdown, items);
    initializeSelect2(dropdown); // Reinitialize Select2 for the new dropdown
  } catch (error) {
    console.error('Error resetting the form:', error);
  }
}

// Function to add a new donation row
async function addRow() {
  const donationRows = document.getElementById('donationRows');
  const newRow = document.createElement('div');
  newRow.classList.add('donation-row');
  newRow.innerHTML = `
    <label for="raw-material">Raw Material:</label>
    <select name="raw-material[]" class="raw-material-dropdown select2" required></select>

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

  // Populate the new dropdown with raw materials and initialize it
  const dropdown = newRow.querySelector('.raw-material-dropdown');
  try {
    const response = await fetch('raw-items.json');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const items = await response.json();
    populateDropdownWithGroups(dropdown, items);
    initializeSelect2(dropdown); // Initialize Select2 for the new empty dropdown
  } catch (error) {
    console.error('Error populating new row dropdown:', error);
  }
}

// Function to remove a donation row
function removeRow(button) {
  button.parentElement.remove();
}

// Function to populate dropdown with grouped items
function populateDropdownWithGroups(dropdown, items) {
  dropdown.innerHTML = ''; // Clear any pre-existing options

  // Group items by type
  const groupedItems = items.reduce((groups, item) => {
    if (!groups[item.type]) {
      groups[item.type] = [];
    }
    groups[item.type].push(item.name);
    return groups;
  }, {});

  // Create <optgroup> for each type
  for (const [type, itemList] of Object.entries(groupedItems)) {
    const optgroup = document.createElement('optgroup');
    optgroup.label = type;

    itemList.forEach(itemName => {
      const option = document.createElement('option');
      option.value = itemName;
      option.textContent = itemName;
      optgroup.appendChild(option);
    });

    dropdown.appendChild(optgroup);
  }
}

// Initialize Select2 for searchability
function initializeSelect2(dropdown) {
  $(dropdown).select2({
    placeholder: 'Select a raw material',
    allowClear: true,
    width: '100%' // Adjust to fit the dropdown container
  });
}

// Initial load of raw materials for the default row(s)
document.addEventListener('DOMContentLoaded', loadRawMaterials);

// Function to load raw materials and populate dropdowns
async function loadRawMaterials() {
  try {
    const response = await fetch('raw-items.json');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const items = await response.json();
    const dropdowns = document.querySelectorAll('.raw-material-dropdown');
    dropdowns.forEach(dropdown => {
      populateDropdownWithGroups(dropdown, items);
      initializeSelect2(dropdown); // Initialize Select2 for searchability
    });
  } catch (error) {
    console.error('Error loading raw materials:', error);
  }
}
