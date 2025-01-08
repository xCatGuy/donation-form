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
  await loadItemsForDropdown('raw-items.json', materialDropdown);
  await loadItemsForDropdown('processed-items.json', processedDropdown);

  // Initialize Select2 after populating items
  $(document).ready(() => {
    $('.material-dropdown, .processed-dropdown').select2();
  });
}

// Submit form using Sheety API
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

  // Add material entries
  for (let i = 0; i < materials.length; i++) {
    rows.push({
      username,
      "material-item": materials[i],
      "material-rarity": raritiesMaterial[i],
      "material-quantity": quantitiesMaterial[i],
      "processed-item": "",
      "processed-rarity": "",
      "processed-quantity": "",
      "timestamp": new Date().toISOString() // Adding timestamp
    });
  }

  // Add processed item entries
  for (let i = 0; i < processedItems.length; i++) {
    rows.push({
      username,
      "material-item": "",
      "material-rarity": "",
      "material-quantity": "",
      "processed-item": processedItems[i],
      "processed-rarity": raritiesProcessed[i],
      "processed-quantity": quantitiesProcessed[i],
      "timestamp": new Date().toISOString() // Adding timestamp
    });
  }

  const data = {
    sheet1: rows
  };

  console.log("Submitting data to:", "https://api.sheety.co/b72bc2aee16edaafda655ebd98b49585/donationData/sheet1");
  console.log("Data being sent:", JSON.stringify(data));

  try {
    const response = await fetch("https://api.sheety.co/b72bc2aee16edaafda655ebd98b49585/donationData/sheet1", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
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
function addProcessedRow()
