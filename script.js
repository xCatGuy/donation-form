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
      "processed-quantity": ""
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
      "processed-quantity": quantitiesProcessed[i]
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
