// Replace this with your actual Imgur Client ID if you use image upload
const IMGUR_CLIENT_ID = '8d85a8d7fae7127';

/**
 * Upload an image to Imgur (if provided).
 */
async function uploadImage(file) {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
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
 * Submit the donation form.
 */
async function submitDonationForm(event) {
  event.preventDefault();

  const form = document.getElementById('donationForm');
  const formData = new FormData(form);

  // Grab form values
  const username = formData.get('username') || '';

  // Materials
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

  // Processed
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

  // Currency
  const gold = formData.get('gold') || '0';
  const silver = formData.get('silver') || '0';
  const copper = formData.get('copper') || '0';

  // Handle image upload if any
  let imgUrl = '';
  const fileInput = document.getElementById('image');
  const file = fileInput.files[0];
  if (file) {
    imgUrl = await uploadImage(file);
    if (!imgUrl) return; // Stop if the upload fails
  }

  // Sheety body: top-level key must match your sheet tab "Sheet1"
  const body = {
    Sheet1: {
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
    // POST to your Sheety endpoint (replace with your real URL if different)
    const response = await fetch(
      'https://api.sheety.co/b72bc2aee16edaafda655ebd98b49585/donationData/Sheet1',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (response.ok) {
      form.reset();
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
 * Load the items from a local JSON file and populate the <select> with grouped options.
 */
async function loadItemsForDropdown(file, dropdown) {
  try {
    const response = await fetch(file);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const items = await response.json();

    // Clear existing options
    dropdown.innerHTML = '';

    // Placeholder
    const placeholderOption = document.createElement('option');
    placeholderOption.value = '';
    placeholderOption.textContent = '-- Select an option --';
    dropdown.appendChild(placeholderOption);

    // Group items by 'type'
    const groups = {};
    items.forEach((item) => {
      const group = item.type || 'Other';
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(item.name);
    });

    // Populate grouped options
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
  } catch (error) {
    console.error(`Error loading ${file}:`, error);
  }
}

/**
 * Initialize the default rows (material & processed) on page load.
 * Then activate Select2 on them.
 */
async function populateInitialRows() {
  // The default Material and Processed dropdowns:
  const materialDropdown = document.querySelector('.material-dropdown');
  const processedDropdown = document.querySelector('.processed-dropdown');

  // Load items from local JSON for each
  await loadItemsForDropdown('raw-items.json', materialDropdown);
  await loadItemsForDropdown('processed-items.json', processedDropdown);

  // Now initialize them with Select2
  $(materialDropdown).select2();
  $(processedDropdown).select2();

  // Also initialize the rarity dropdowns in the default row
  $('.material-rarity-dropdown, .processed-rarity-dropdown').select2();
}

/**
 * Add a new Material row (with new dropdowns).
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

  // Populate and initialize the new row's material dropdown
  const materialDropdown = newRow.querySelector('.material-dropdown');
  loadItemsForDropdown('raw-items.json', materialDropdown).then(() => {
    $(materialDropdown).select2();
  });

  // Initialize rarity dropdown
  const rarityDropdown = newRow.querySelector('.material-rarity-dropdown');
  $(rarityDropdown).select2();
}

/**
 * Add a new Processed row (with new dropdowns).
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

  // Populate and initialize the new row's processed dropdown
  const processedDropdown = newRow.querySelector('.processed-dropdown');
  loadItemsForDropdown('processed-items.json', processedDropdown).then(() => {
    $(processedDropdown).select2();
  });

  // Initialize rarity dropdown
  const rarityDropdown = newRow.querySelector('.processed-rarity-dropdown');
  $(rarityDropdown).select2();
}

/**
 * Reset the form completely.
 */
function resetForm() {
  document.getElementById('donationForm').reset();
  document.getElementById('imagePreview').innerHTML = '';
}

// Wait until the DOM is ready, then populate the initial rows
$(document).ready(() => {
  populateInitialRows();
});
