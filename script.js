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
  const fileInput = document.getElementById('file');
  const file = fileInput.files[0];

  let imgUrl = '';
  if (file) {
    imgUrl = await uploadImage(file);
    if (!imgUrl) return; // Stop submission if image upload fails
  }

  const body = {
    sheet1: {
      username,
      imgUrl, // Include the image URL
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
document.getElementById('file').addEventListener('change', (event) => {
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
