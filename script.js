const IMGUR_CLIENT_ID = '8d85a8d7fae7127'; // Replace with your Imgur Client ID

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

async function submitDonationForm(event) {
  event.preventDefault();

  const form = document.getElementById('donationForm');
  const formData = new FormData(form);

  const username = formData.get('username');
  const fileInput = document.getElementById('image');
  const file = fileInput.files[0];

  let imgUrl = '';
  if (file) {
    imgUrl = await uploadImage(file);
    if (!imgUrl) return; // Stop submission if image upload fails
  }

  // Gather data from optional dropdowns (filter empty values)
  const materials = formData.getAll('material-item[]').filter(Boolean).join(', ');
  const materialRarities = formData.getAll('material-rarity[]').filter(Boolean).join(', ');
  const materialQuantities = formData.getAll('material-quantity[]').filter(Boolean).join(', ');
  const processedItems = formData.getAll('processed-item[]').filter(Boolean).join(', ');
  const processedRarities = formData.getAll('processed-rarity[]').filter(Boolean).join(', ');
  const processedQuantities = formData.getAll('processed-quantity[]').filter(Boolean).join(', ');

  const body = {
    sheet1: {
      username,
      materialItem: materials,
      materialRarity: materialRarities,
      materialQuantity: materialQuantities,
      processedItem: processedItems,
      processedRarity: processedRarities,
      processedQuantity: processedQuantities,
      imgUrl, // Include the uploaded image URL
      timestamp: new Date().toISOString(),
    },
  };

  try {
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
      document.getElementById('donationForm').reset();
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

// Preview the uploaded image
document.getElementById('image').addEventListener('change', (event) => {
  const file = event.target.files[0];
  const preview = document.getElementById('imagePreview');
  preview.innerHTML = '';

  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      const img = document.createElement('img');
      img.src = reader.result;
      preview.appendChild(img);
    };
    reader.readAsDataURL(file);
  }
});

// Ensure dropdowns use Select2 styling and function properly
document.addEventListener('DOMContentLoaded', () => {
  $('.material-dropdown, .processed-dropdown, .material-rarity-dropdown, .processed-rarity-dropdown').select2();
});

// Add new Material row
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
      <input type="number" name="material-quantity[]" min="1" />
    </div>
  `;

  materialRows.appendChild(newRow);
  $(newRow).find('.material-dropdown, .material-rarity-dropdown').select2();
}

// Add new Processed Item row
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
      <input type="number" name="processed-quantity[]" min="1" />
    </div>
  `;

  processedRows.appendChild(newRow);
  $(newRow).find('.processed-dropdown, .processed-rarity-dropdown').select2();
}

// Reset the form
function resetForm() {
  document.getElementById('donationForm').reset();
  document.getElementById('imagePreview').innerHTML = '';
}
