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

// Populate a dropdown with grouped items
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
