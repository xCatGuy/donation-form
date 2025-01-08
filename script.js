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
}

// Add new Material row
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
    </div>`;
  materialRows.appendChild(newRow);
  const dropdown = newRow.querySelector('.material-dropdown');
  await loadItemsForDropdown('raw-items.json', dropdown);
}

// Add new Processed row
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
    </div>`;
  processedRows.appendChild(newRow);
  const dropdown = newRow.querySelector('.processed-dropdown');
  await loadItemsForDropdown('processed-items.json', dropdown);
}

// Reset form
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
    </div>`;
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
    </div>`;
  await populateInitialRows();
}

// Submit form
async function submitDonationForm(event) {
  event.preventDefault(); // Prevent default form submission

  const form = document.getElementById('donationForm');
  const formData = new FormData(form);

  // Prepare JSON object
  const data = {
    username: formData.get('username'),
    "material-item[]": formData.getAll('material-item[]'),
    "material-rarity[]": formData.getAll('material-rarity[]'),
    "material-quantity[]": formData.getAll('material-quantity[]'),
    "processed-item[]": formData.getAll('processed-item[]'),
    "processed-rarity[]": formData.getAll('processed-rarity[]'),
    "processed-quantity[]": formData.getAll('processed-quantity[]'),
  };

  console.log("Form Data Sent to Server:", data); // Debugging log

  try {
    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbyHTbkuVE1z6Hhdp6ucbvJrDmRSE5VjQGeN6jycgWWW7cEnpy9HJJpR1Xv63__1G0qf_Q/exec",
      {
        method: 'POST', // Ensure POST is used
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );

    if (response.ok) {
      const result = await response.json();
      console.log("Server Response:", result); // Debugging log
      document.getElementById('form-container').style.display = 'none';
      document.getElementById('success-message').style.display = 'block';
    } else {
      console.error('Server response failed:', await response.text());
      alert('Failed to submit donation. Please try again.');
    }
  } catch (error) {
    console.error('Error submitting donation:', error);
    alert('An error occurred while submitting your donation.');
  }
}

// Load initial rows on page load
document.addEventListener('DOMContentLoaded', populateInitialRows);
