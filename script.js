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

  try {
    const response = await fetch("https://script.google.com/macros/s/AKfycbxv2MnHBY_a1lBmqw4wQ0TEtQ1sZwbYVCZV1pGd6w2cvjzrcN9O8CwTt41PJGtd8magEw/exec", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      alert('Donation submitted successfully!');
      form.reset();
      resetForm(); // Reinitialize dropdowns
    } else {
      alert('Failed to submit donation. Please try again.');
    }
  } catch (error) {
    console.error('Error submitting donation:', error);
    alert('An error occurred while submitting your donation.');
  }
}

// Existing functions (resetForm, addMaterialRow, addProcessedRow, removeRow, etc.) remain unchanged.
