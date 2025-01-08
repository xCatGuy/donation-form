// Function to load items into dropdowns
async function loadItemsForDropdown(file, dropdown) {
  try {
    const response = await fetch(file);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const items = await response.json();
    populateDropdown(dropdown, items);
  } catch (error) {
    console.error(`Error loading ${file}:`, error);
  }
}

// Function to populate dropdowns
function populateDropdown(dropdown, items) {
  dropdown.innerHTML = ''; // Clear existing options
  items.forEach(item => {
    const option = document.createElement('option');
    option.value = item.name;
    option.textContent = item.name;
    dropdown.appendChild(option);
  });
}

// Function to populate initial rows
async function populateInitialRows() {
  const materialDropdown = document.querySelector('.material-dropdown');
  const processedDropdown = document.querySelector('.processed-dropdown');

  // Load items for the first (initial) material & processed dropdowns
  await loadItemsForDropdown('raw-items.json', materialDropdown);
  await loadItemsForDropdown('processed-items.json', processedDropdown);

  // Initialize Select2 after populating items
  $(document).ready(() => {
    $('.material-dropdown, .processed-dropdown').select2();
  });
}

// Submit form using Sheety (loop approach)
async function submitDonationForm(event) {
  event.preventDefault(); // Prevent default form submission

  const form = document.getElementById('donationForm');
  const formData = new FormData(form);

  const username = formData.get('username');
  const materials = formData.getAll('material-item[]');
  const raritiesMaterial = formData.getAll('material-rarity[]');
  const quantitiesMaterial = formData.getAll('material-quantity[]');
  const processedItems = formData.getAll('processed-item[]');
  const raritiesProcessed = formData.getAll('processed-rarity[]');
  const quantitiesProcessed = formData.getAll('processed-quantity[]');

  // Construct an array of rows
  let rows = [];

  // Add rows for raw materials
  for (let i = 0; i < materials.length; i++) {
    rows.push({
      username: username,
      "material-item": materials[i],
      "material-rarity": raritiesMaterial[i],
      "material-quantity": quantitiesMaterial[i],
      "processed-item": "",
      "processed-rarity": "",
      "processed-quantity": "",
      timestamp: new Date().toISOString()
    });
  }

  // Add rows for processed items
  for (let i = 0; i < processedItems.length; i++) {
    rows.push({
      username: username,
      "material-item": "",
      "material-rarity": "",
      "material-quantity": "",
      "processed-item": processedItems[i],
      "processed-rarity": raritiesProcessed[i],
      "processed-quantity": quantitiesProcessed[i],
      timestamp: new Date().toISOString()
    });
  }

  // Sheety base URL
  // If your Sheety tab is actually named something else, replace "sheet1" below
  const sheetyUrl = "https://api.sheety.co/b72bc2aee16edaafda655ebd98b49585/donationData/sheet1";
  
  try {
    // 1) Insert each row individually in a loop
    for (let row of rows) {
      // Each POST must be a single object under "sheet1" (if the tab is called 'sheet1')
      let body = {
        sheet1: row
      };

      const response = await fetch(sheetyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response failed:", errorText);
        alert("Failed to submit donation. Server responded with: " + errorText);
        return; // Stop if any row fails
      }
    }

    // 2) If we get here, all rows have been inserted successfully
    document.getElementById('form-container').style.display = 'none';
    document.getElementById('success-message').style.display = 'block';

  } catch (error) {
    console.error("Error submitting donation:", error);
    alert("An error occurred while submitting your donation: " + error.message);
  }
}

// Add extra material row
function addMaterialRow() {
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
        <option value="Heroic">Heroic</option>
        <option value="Epic">Epic</option>
        <option value="Legendary">Legendary</option>
      </select>
    </div>
    <div>
      <label for="material-quantity">Quantity:</label>
      <input type="number" name="material-quantity[]" min="1" required />
    </div>
  `;

  materialRows.appendChild(newRow);

  // Re-initialize Select2 for the new row's dropdown
  $(newRow).find('.material-dropdown').select2();

  // Load items into the new material dropdown
  loadItemsForDropdown('raw-items.json', newRow.querySelector('.material-dropdown'));
}

// Add extra processed item row
function addProcessedRow() {
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
        <option value="Heroic">Heroic</option>
        <option value="Epic">Epic</option>
        <option value="Legendary">Legendary</option>
      </select>
    </div>
    <div>
      <label for="processed-quantity">Quantity:</label>
      <input type="number" name="processed-quantity[]" min="1" required />
    </div>
  `;

  processedRows.appendChild(newRow);

  // Re-initialize Select2 for the new row's dropdown
  $(newRow).find('.processed-dropdown').select2();

  // Load items into the new processed dropdown
  loadItemsForDropdown('processed-items.json', newRow.querySelector('.processed-dropdown'));
}

// Reset form
function resetForm() {
  document.getElementById('donationForm').reset();
}

// Load initial rows on page load
document.addEventListener("DOMContentLoaded", populateInitialRows);
