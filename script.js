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

// Submit form
async function submitDonationForm(event) {
  event.preventDefault(); // Prevent default form submission

  const form = document.getElementById('donationForm');
  const formData = new FormData(form);

  const data = {
    username: formData.get('username'),
    "material-item[]": formData.getAll('material-item[]'),
    "material-rarity[]": formData.getAll('material-rarity[]'),
    "material-quantity[]": formData.getAll('material-quantity[]'),
    "processed-item[]": formData.getAll('processed-item[]'),
    "processed-rarity[]": formData.getAll('processed-rarity[]'),
    "processed-quantity[]": formData.getAll('processed-quantity[]'),
  };

  console.log("Submitting data to:", "https://script.google.com/macros/s/AKfycbwEjB3GM5EC8UMzkaPnmew7WZpaMsois8eIYbBuYAUk29uf9blT4jvYZqv8WJl65iyZfg/exec");
  console.log("Data being sent:", JSON.stringify(data));

  try {
    const response = await fetch("https://script.google.com/macros/s/AKfycbwEjB3GM5EC8UMzkaPnmew7WZpaMsois8eIYbBuYAUk29uf9blT4jvYZqv8WJl65iyZfg/exec", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const result = await response.json();
      console.log("Server Response:", result);
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

// Load initial rows on page load
document.addEventListener("DOMContentLoaded", populateInitialRows);
