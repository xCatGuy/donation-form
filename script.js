// Replace with your actual Imgur Client ID
const IMGUR_CLIENT_ID = '8d85a8d7fae7127'; 

/**
 * Function to upload an image to Imgur.
 */
async function uploadImage(file) {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        // Correct use of backticks for template literal
        Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
      },
      body: formData,
    });

    const result = await response.json();
    if (result.success) {
      return result.data.link; // Return the Imgur URL
    } else {
      throw new Error('Image upload failed');
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    alert('Failed to upload image. Please try again.');
    return null;
  }
}

/**
 * Function to submit the donation form.
 */
async function submitDonationForm(event) {
  event.preventDefault();

  const form = document.getElementById('donationForm');
  const formData = new FormData(form);

  // Gather basic fields
  const username = formData.get('username');
  
  // Gather all Materials
  const materials = formData
    .getAll('material-item[]')
    .filter(Boolean)
    .join(', ');
  const materialRarities = formData
    .getAll('material-rarity[]')
    .filter(Boolean)
    .join(', ');
  const materialQuantities = formData
    .getAll('material-quantity[]')
    .filter(Boolean)
    .join(', ');

  // Gather all Processed Items
  const processedItems = formData
    .getAll('processed-item[]')
    .filter(Boolean)
    .join(', ');
  const processedRarities = formData
    .getAll('processed-rarity[]')
    .filter(Boolean)
    .join(', ');
  const processedQuantities = formData
    .getAll('processed-quantity[]')
    .filter(Boolean)
    .join(', ');

  // Gather Currency
  const gold = formData.get('gold') || 0;
  const silver = formData.get('silver') || 0;
  const copper = formData.get('copper') || 0;

  // Upload image (if any)
  let imgUrl = '';
  const fileInput = document.getElementById('image');
  const file = fileInput.files[0];
  if (file) {
    imgUrl = await uploadImage(file);
    if (!imgUrl) return; // Stop if image upload fails
  }

  // Build the body object to match the Sheety columns exactly
  const body = {
    sheet1: {
      username: username,
      materialItem: materials,
      materialRarity: materialRarities,
      materialQuantity: materialQuantities,
      processedItem: processedItems,
      processedRarity: processedRarities,
      processedQuantity: processedQuantities,
      gold: gold,
      silver: silver,
      copper: copper,
      timestamp: new Date().toISOString(),
      imgUrl: imgUrl,
    },
  };

  try {
    // Make sure this endpoint is correct for your Sheety project
    const response = await fetch(
      'https://api.sheety.co/b72bc2aee16edaafda655ebd98b49585/donationData/sheet1',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (response.ok) {
      // Reset the form
      document.getElementById('donationForm').reset();
      document.getElementById('imagePreview').innerHTML = '';
      document.getElementById('success-message').style.display = 'block';
      document.getElementById('form-container').style.display = 'none';
    } else {
      const errorText = await response.text();
      alert(`Failed to submit donation: ${errorText}`);
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    alert('An error occurred. Please try again.');
  }
}

/**
 * Function to load items into dropdowns.
 */
async function loadItemsForDropdown(file, dropdown) {
  try {
    const response = await fetch(file);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const items = await response.json();
    console.log(`Loaded items for ${dropdown.name}:`, items);
    populateDropdownWithGroups(dropdown, items);
  } catch (error) {
    console.error(`Error loading ${file}:`, error);
  }
}

/**
 * Populates dropdowns with grouped items.
 */
function populateDropdownWithGroups(dropdown, items) {
  dropdown.innerHTML = ''; // Clear existing options

  // Placeholder for no selection
  const placeholderOption = document.createElement('option');
  placeholderOption.value = '';
  placeholderOption.textContent = '-- Select an option --';
  dropdown.appendChild(placeholderOption);

  const groups = {};
  items.forEach((item) => {
    const group = item.type || 'Other';
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(item.name);
  });

  for (const [groupName, groupItems] of Object.entries(groups)) {
    const optgroup = document.createElement('optgroup');
    optgroup.label = groupName;

    groupItems.forEach((name) => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      optgroup.appendChild(option);
    });

    dropdown.appendChild(optgroup);
  }
}

/**
 * Populate initial dropdown rows on page load.
 */
async function populateInitialRows() {
  const materialDropdown = document.querySelector('.material-dropdown');
  const processedDropdown = document.querySelector('.processed-dropdown');

  await loadItemsForDropdown('raw-items.json', materialDropdown);
  await loadItemsForDropdown('processed-items.json', processedDropdown);

  // Initialize Select2 after content is loaded
  $(document).ready(() => {
    $('.material-dropdown, .processed-dropdown, .material-rarity-dropdown, .processed-rarity-dropdown').select2();
  });
}

/**
 * Add new Material row.
 */
function addMaterialRow() {
  const materialRows = document.getElementById('materialRows');
  const newRow = document.createElement('div');
  newRow.classList.add('donation-row');

  newRow.innerHTML = `
    <div>
      <label for="material-item">Raw Material:</label>
      <select name="material-item[]" class="material-dropdown"></select>
    </div>
    <div>
      <label for="material-rarity">Rarity:</label>
      <select name="material-rarity[]" class="material-rarity-dropdown">
        <option value="">-- Select an option --</option>
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
      <input type="number" name="material-quantity[]" min="1" />
    </div>
  `;

  materialRows.appendChild(newRow);

  // Re-initialize Select2 for the new row
  $(newRow).find('.material-dropdown, .material-rarity-dropdown').select2();
  loadItemsForDropdown('raw-items.json', newRow.querySelector('.material-dropdown'));
}

/**
 * Add new Processed Item row.
 */
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
        <option value="">-- Select an option --</option>
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
      <input type="number" name="processed-quantity[]" min="1" />
    </div>
  `;

  processedRows.appendChild(newRow);

  // Re-initialize Select2 for the new row
  $(newRow).find('.processed-dropdown, .processed-rarity-dropdown').select2();
  loadItemsForDropdown('processed-items.json', newRow.querySelector('.processed-dropdown'));
}

/**
 * Reset the form.
 */
function resetForm() {
  document.getElementById('donationForm').reset();
  document.getElementById('imagePreview').innerHTML = '';
}

document.addEventListener('DOMContentLoaded', populateInitialRows);
