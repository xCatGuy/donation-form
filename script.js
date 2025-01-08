/********************************************************
  1) LOAD AND POPULATE ITEMS
********************************************************/

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

/********************************************************
  2) SUBMIT FORM (ONE ROW PER DONATION)
********************************************************/

// Submit form using Sheety — single row approach
async function submitDonationForm(event) {
  event.preventDefault(); // Prevent default form submission

  // Get all form data
  const form = document.getElementById('donationForm');
  const formData = new FormData(form);

  // Basic fields
  const username = formData.get('username');

  // Arrays
  const materials = formData.getAll('material-item[]');
  const raritiesMaterial = formData.getAll('material-rarity[]');
  const quantitiesMaterial = formData.getAll('material-quantity[]');
  const processedItems = formData.getAll('processed-item[]');
  const raritiesProcessed = formData.getAll('processed-rarity[]');
  const quantitiesProcessed = formData.getAll('processed-quantity[]');

  // Join each array into a single comma-separated string
  const materialItemsStr = materials.join(', ');
  const materialRaritiesStr = raritiesMaterial.join(', ');
  const materialQuantitiesStr = quantitiesMaterial.join(', ');
  const processedItemsStr = processedItems.join(', ');
  const processedRaritiesStr = raritiesProcessed.join(', ');
  const processedQuantitiesStr = quantitiesProcessed.join(', ');

  // Build one row with all data
  const singleRow = {
    username: username,
    "material-item": materialItemsStr,
    "material-rarity": materialRaritiesStr,
    "material-quantity": materialQuantitiesStr,
    "processed-item": processedItemsStr,
    "processed-rarity": processedRaritiesStr,
    "processed-quantity": processedQuantitiesStr,
    timestamp: new Date().toISOString()
  };

  // Sheety expects { sheet1: {...} } if your sheet is named "sheet1"
  const body = {
    sheet1: singleRow
  };

  // URL for your Sheety resource
  const sheetyUrl = "https://api.sheety.co/b72bc2aee16edaafda655ebd98b49585/donationData/sheet1";

  console.log("Submitting data to:", sheetyUrl);
  console.log("Data being sent:", JSON.stringify(body));

  try {
    const response = await fetch(sheetyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      const json = await response.json();
      console.log("Server Response:", json);
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
