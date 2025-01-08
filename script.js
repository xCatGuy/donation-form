/********************************************************
  1) LOAD AND POPULATE ITEMS
********************************************************/

/**
 * Loads JSON from 'file' and populates the given dropdown
 * with items grouped by their 'type' field (if present).
 */
async function loadItemsForDropdown(file, dropdown) {
  try {
    const response = await fetch(file);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const items = await response.json();

    // If your items have a "type" field, group them
    populateDropdownWithGroups(dropdown, items);
  } catch (error) {
    console.error(`Error loading ${file}:`, error);
  }
}

/**
 * Populates a select dropdown with items, grouping by 'type'
 * if item.type exists. Otherwise, everything goes in "Other" group.
 */
function populateDropdownWithGroups(dropdown, items) {
  // Clear any existing
  dropdown.innerHTML = '';

  // We'll store items by type in an object like { typeName: [items...] }
  const groups = {};

  items.forEach(item => {
    const itemType = item.type || 'Other';
    if (!groups[itemType]) {
      groups[itemType] = [];
    }
    groups[itemType].push(item.name);
  });

  // For convenience, create a placeholder
  const placeholderOption = document.createElement('option');
  placeholderOption.value = '';
  placeholderOption.textContent = '-- Select an option --';
  dropdown.appendChild(placeholderOption);

  // Now build <optgroup> for each type
  for (let typeKey in groups) {
    const optgroup = document.createElement('optgroup');
    optgroup.label = typeKey;

    groups[typeKey].forEach(itemName => {
      const option = document.createElement('option');
      option.value = itemName;
      option.textContent = itemName;
      optgroup.appendChild(option);
    });

    dropdown.appendChild(optgroup);
  }
}

/**
 * Called on page load to populate the initial material and processed dropdowns.
 */
async function populateInitialRows() {
  const materialDropdown = document.querySelector('.material-dropdown');
  const processedDropdown = document.querySelector('.processed-dropdown');

  // Load items for the first (initial) material & processed dropdown
  await loadItemsForDropdown('raw-items.json', materialDropdown);
  await loadItemsForDropdown('processed-items.json', processedDropdown);

  // Initialize Select2 after populating items
  $(document).ready(() => {
    $('.material-dropdown, .processed-dropdown, .material-rarity-dropdown, .processed-rarity-dropdown').select2();
  });
}

/********************************************************
  2) SUBMIT FORM (ONE ROW PER DONATION)
********************************************************/

async function submitDonationForm(event) {
  event.preventDefault(); // Prevent default form submission

  const form = document.getElementById('donationForm');
  const formData = new FormData(form);

  // Basic field (the only required one)
  const userNameValue = formData.get('username');

  // Arrays from optional Material/Processed fields
  const materials = formData.getAll('material-item[]');
  const materialRarities = formData.getAll('material-rarity[]');
  const materialQuantities = formData.getAll('material-quantity[]');
  const processedItems = formData.getAll('processed-item[]');
  const processedRarities = formData.getAll('processed-rarity[]');
  const processedQuantities = formData.getAll('processed-quantity[]');

  // Filter empty and join for better display (avoid trailing commas if blank)
  const materialItemsStr = materials.filter(Boolean).join(', ');
  const materialRaritiesStr = materialRarities.filter(Boolean).join(', ');
  const materialQuantitiesStr = materialQuantities.filter(Boolean).join(', ');
  const processedItemsStr = processedItems.filter(Boolean).join(', ');
  const processedRaritiesStr = processedRarities.filter(Boolean).join(', ');
  const processedQuantitiesStr = processedQuantities.filter(Boolean).join(', ');

  // Build one row with all data
  // The keys must match your sheet columns EXACTLY
  const singleRow = {
    username: userNameValue,  // 'username' matches the column 'username'
    materialItem: materialItemsStr,
    materialRarity: materialRaritiesStr,
    materialQuantity: materialQuantitiesStr,
    processedItem: processedItemsStr,
    processedRarity: processedRaritiesStr,
    processedQuantity: processedQuantitiesStr,
    timestamp: new Date().toISOString()
  };

  // If your Sheety tab is called "sheet1"
  const body = {
    sheet1: singleRow
  };

  // Your Sheety endpoint
  const sheetyUrl = "https://api.sheety.co/b72bc2aee16edaafda655ebd98b49585/donationData/sheet1";

  console.log("Submitting data to:", sheetyUrl);
  console.log("Data being sent:", JSON.stringify(body));

  try {
    const response = await fetch(sheetyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      const json = await response.json();
      console.log("Server Response:", json);
      // Hide form, show success
      document.getElementById('form-container').style.display = 'none';
      document.getElementById('success-message').style.display = 'block';
    } else {
      const errorText = await response.text();
      console.error("Server response failed:", errorText);
      alert("Failed to submit donation. Server responded with: " + errorText);
    }
  } catch (error) {
    console.error("Error submitting donation:", error);
    alert("An error occurred while submitting your donation: " + error.message);
  }
}

/********************************************************
  3) ADD EXTRA MATERIAL ROW
********************************************************/
function addMaterialRow() {
  const materialRows = document.getElementById('materialRows');
  const newRow = document.createElement('div');
  newRow.classList.add('donation-row');

  // Just replicate the same HTML, but no 'required'
  newRow.innerHTML = `
    <div>
      <label for="material-item">Raw Material:</label>
      <select name="material-item[]" class="material-dropdown"></select>
    </div>
    <div>
      <label for="material-rarity">Rarity:</label>
      <select name="material-rarity[]" class="material-rarity-dropdown">
        <option value="">--Optional--</option>
        <option value="Common">Common</option>
        <option value="Uncommon">Uncommon</option>
        <option value="Rare">Rare</option>
        <option value="Heroic">Heroic</option>
        <option value="Epic">Epic</option>
        <option value="Legendary">Legendary</option>
      </select>
    </div>
    <div>
      <label for="material-quantity">Quantity:</label>
      <input type="number" name="material-quantity[]" min="1"/>
    </div>
  `;

  materialRows.appendChild(newRow);

  // Re-init Select2 after we add the new row
  $(newRow).find('.material-dropdown, .material-rarity-dropdown').select2();

  // Load items into the new material dropdown (with groups)
  loadItemsForDropdown('raw-items.json', newRow.querySelector('.material-dropdown'));
}

/********************************************************
  4) ADD EXTRA PROCESSED ITEM ROW
********************************************************/
function addProcessedRow() {
  const processedRows = document.getElementById('processedRows');
  const newRow = document.createElement('div');
  newRow.classList.add('donation-row');

  newRow.innerHTML = `
    <div>
      <label for="processed-item">Processed Item:</label>
      <select name="processed-item[]" class="processed-dropdown"></select>
    </div>
    <div>
      <label for="processed-rarity">Rarity:</label>
      <select name="processed-rarity[]" class="processed-rarity-dropdown">
        <option value="">--Optional--</option>
        <option value="Common">Common</option>
        <option value="Uncommon">Uncommon</option>
        <option value="Rare">Rare</option>
        <option value="Heroic">Heroic</option>
        <option value="Epic">Epic</option>
        <option value="Legendary">Legendary</option>
      </select>
    </div>
    <div>
      <label for="processed-quantity">Quantity:</label>
      <input type="number" name="processed-quantity[]" min="1"/>
    </div>
  `;

  processedRows.appendChild(newRow);

  // Re-init Select2 for the new row
  $(newRow).find('.processed-dropdown, .processed-rarity-dropdown').select2();

  // Load items into the new processed dropdown (with groups)
  loadItemsForDropdown('processed-items.json', newRow.querySelector('.processed-dropdown'));
}

/********************************************************
  5) RESET FORM
********************************************************/
function resetForm() {
  document.getElementById('donationForm').reset();
}

/********************************************************
  6) ON PAGE LOAD
********************************************************/
document.addEventListener("DOMContentLoaded", populateInitialRows);
