// Function to load raw materials and processed items
async function loadItems(file, dropdownClass) {
  try {
    const response = await fetch(file);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const items = await response.json();
    const dropdowns = document.querySelectorAll(dropdownClass);
    dropdowns.forEach(dropdown => {
      populateDropdownWithGroups(dropdown, items);
      initializeSelect2(dropdown); // Initialize Select2 for searchability
    });
  } catch (error) {
    console.error(`Error loading ${file}:`, error);
  }
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

// Function to initialize Select2 for searchability
function initializeSelect2(dropdown) {
  $(dropdown).select2({
    placeholder: 'Select an item',
    allowClear: true,
    width: '100%' // Adjust to fit the dropdown container
  });
}

// Function to add a new row for Materials
async function addMaterialRow() {
  const materialRows = document.getElementById('materialRows');
  const newRow = document.createElement('div');
  newRow.classList.add('donation-row');
  newRow.innerHTML = `
    <label for="material-item">Raw Material:</label>
    <select name="material-item[]" class="material-dropdown select2" required></select>

    <label for="material-rarity">Rarity:</label>
    <select name="material-rarity[]" required>
      <option value="Common">Common</option>
      <option value="Uncommon">Uncommon</option>
      <option value="Rare">Rare</option>
      <option value="Epic">Epic</option>
      <option value="Legendary">Legendary</option>
    </select>

    <label for="material-quantity">Quantity:</label>
    <input type="number" name="material-quantity[]" min="1" required />

    <button type="button" onclick="removeRow(this)">Remove</button>
  `;
  materialRows.appendChild(newRow);

  const dropdown = newRow.querySelector('.material-dropdown');
  await loadItems('raw-items.json', '.material-dropdown');
}

// Function to add a new row for Processed Items
async function addProcessedRow() {
  const processedRows = document.getElementById('processedRows');
  const newRow = document.createElement('div');
  newRow.classList.add('donation-row');
  newRow.innerHTML = `
    <label for="processed-item">Processed Item:</label>
    <select name="processed-item[]" class="processed-dropdown select2" required></select>

    <label for="processed-rarity">Rarity:</label>
    <select name="processed-rarity[]" required>
      <option value="Common">Common</option>
      <option value="Uncommon">Uncommon</option>
      <option value="Rare">Rare</option>
      <option value="Epic">Epic</option>
      <option value="Legendary">Legendary</option>
    </select>

    <label for="processed-quantity">Quantity:</label>
    <input type="number" name="processed-quantity[]" min="1" required />

    <button type="button" onclick="removeRow(this)">Remove</button>
  `;
  processedRows.appendChild(newRow);

  const dropdown = newRow.querySelector('.processed-dropdown');
  await loadItems('processed-items.json', '.processed-dropdown');
}

// Function to remove a donation row
function removeRow(button) {
  button.parentElement.remove();
}

// Function to reset the form
async function resetForm() {
  document.getElementById('donationForm').reset();
  document.getElementById('materialRows').innerHTML = `
    <div class="donation-row">
      <label for="material-item">Raw Material:</label>
      <select name="material-item[]" class="material-dropdown select2" required></select>

      <label for="material-rarity">Rarity:</label>
      <select name="material-rarity[]" required>
        <option value="Common">Common</option>
        <option value="Uncommon">Uncommon</option>
        <option value="Rare">Rare</option>
        <option value="Epic">Epic</option>
        <option value="Legendary">Legendary</option>
      </select>

      <label for="material-quantity">Quantity:</label>
      <input type="number" name="material-quantity[]" min="1" required />

      <button type="button" onclick="removeRow(this)">Remove</button>
    </div>
  `;
  document.getElementById('processedRows').innerHTML = `
    <div class="donation-row">
      <label for="processed-item">Processed Item:</label>
      <select name="processed-item[]" class="processed-dropdown select2" required></select>

      <label for="processed-rarity">Rarity:</label>
      <select name="processed-rarity[]" required>
        <option value="Common">Common</option>
        <option value="Uncommon">Uncommon</option>
        <option value="Rare">Rare</option>
        <option value="Epic">Epic</option>
        <option value="Legendary">Legendary</option>
      </select>

      <label for="processed-quantity">Quantity
