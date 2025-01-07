// Function to load items into a specific dropdown
async function loadItemsForDropdown(file, dropdown) {
  try {
    const response = await fetch(file);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const items = await response.json();
    populateDropdownWithGroups(dropdown, items);

    // Initialize Select2 AFTER populating the dropdown
    $(dropdown).select2({
      placeholder: 'Select an item',
      allowClear: true,
      width: '100%', // Adjust to fit the dropdown container
    });
  } catch (error) {
    console.error(`Error loading items from ${file}:`, error);
  }
}

// Function to populate a dropdown with grouped items
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

// Function to initialize the first rows on page load
async function populateInitialRows() {
  const materialDropdown = document.querySelector('.material-dropdown');
  const processedDropdown = document.querySelector('.processed-dropdown');

  if (materialDropdown) {
    await loadItemsForDropdown('raw-items.json', materialDropdown);
  }

  if (processedDropdown) {
    await loadItemsForDropdown('processed-items.json', processedDropdown);
  }
}

// Function to add a new row for Materials
async function addMaterialRow() {
  const materialRows = document.getElementById('materialRows');
  const newRow = document.createElement('div');
  newRow.classList.add('donation-row');
  newRow.innerHTML = `
    <div>
      <label for="material-item">Raw Material:</label>
      <select name="material-item[]" class="material-dropdown" required></select>
    </div>
    <div>
      <label for="material-rarity">Rarity:</label>
      <select name="material-rarity[]" required>
        <option value="Common">Common</option>
        <option value="Uncommon">Uncommon</option>
        <option value="Rare">Rare</option>
        <option value="Epic">Epic</option>
        <option value="Legendary">Legendary</option>
      </select>
    </div>
    <div>
      <label for="material-quantity">Quantity:</label>
      <input type="number" name="material-quantity[]" min="1" required />
    </div>
    <button type="button" onclick="removeRow(this)">Remove</button>
  `;
  materialRows.appendChild(newRow);

  const newDropdown = newRow.querySelector('.material-dropdown');
  await loadItemsForDropdown('raw-items.json', newDropdown);
}

// Function to add a new row for Processed Items
async function addProcessedRow() {
  const processedRows = document.getElementById('processedRows');
  const newRow = document.createElement('div');
  newRow.classList.add('donation-row');
  newRow.innerHTML = `
    <div>
      <label for="processed-item">Processed Item:</label>
      <select name="processed-item[]" class="processed-dropdown" required></select>
    </div>
    <div>
      <label for="processed-rarity">Rarity:</label>
      <select name="processed-rarity[]" required>
        <option value="Common">Common</option>
        <option value="Uncommon">Uncommon</option>
        <option value="Rare">Rare</option>
        <option value="Epic">Epic</option>
        <option value="Legendary">Legendary</option>
      </select>
    </div>
    <div>
      <label for="processed-quantity">Quantity:</label>
      <input type="number" name="processed-quantity[]" min="1" required />
    </div>
    <button type="button" onclick="removeRow(this)">Remove</button>
  `;
  processedRows.appendChild(newRow);

  const newDropdown = newRow.querySelector('.processed-dropdown');
  await loadItemsForDropdown('processed-items.json', newDropdown);
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
      <div>
        <label for="material-item">Raw Material:</label>
        <select name="material-item[]" class="material-dropdown" required></select>
      </div>
      <div>
        <label for="material-rarity">Rarity:</label>
        <select name="material-rarity[]" required>
          <option value="Common">Common</option>
          <option value="Uncommon">Uncommon</option>
          <option value="Rare">Rare</option>
          <option value="Epic">Epic</option>
          <option value="Legendary">Legendary</option>
        </select>
      </div>
      <div>
        <label for="material-quantity">Quantity:</label>
        <input type="number" name="material-quantity[]" min="1" required />
      </div>
      <button type="button" onclick="removeRow(this)">Remove</button>
    </div>
  `;
  document.getElementById('processedRows').innerHTML = `
    <div class="donation-row">
      <div>
        <label for="processed-item">Processed Item:</label>
        <select name="processed-item[]" class="processed-dropdown" required></select>
      </div>
      <div>
        <label for="processed-rarity">Rarity:</label>
        <select name="processed-rarity[]" required>
          <option value="Common">Common</option>
          <option value="Uncommon">Uncommon</option>
          <option value="Rare">Rare</option>
          <option value="Epic">Epic</option>
          <option value="Legendary">Legendary</option>
        </select>
      </div>
      <div>
        <label for="processed-quantity">Quantity:</label>
        <input type="number" name="processed-quantity[]" min="1" required />
      </div>
      <button type="button" onclick="removeRow(this)">Remove</button>
    </div>
  `;
  await populateInitialRows();
}

// Initialize rows on page load
document.addEventListener('DOMContentLoaded', populateInitialRows);
