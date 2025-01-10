<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Donation Form</title>

  <!-- Include jQuery before Select2 -->
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  <link
    href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css"
    rel="stylesheet"
  />
  <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
  <script src="script.js" defer></script>

  <style>
    body {
      font-family: 'Roboto', sans-serif;
      margin: 0;
      padding: 0;
      background: linear-gradient(135deg, #1c1c1c, #121212);
      color: #e0e0e0;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    main {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
    }

    h1, h2 {
      text-align: center;
      margin: 20px;
    }

    form {
      max-width: 900px;
      width: 100%;
      background-color: #1e1e1e;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.6);
      margin-bottom: 20px;
    }

    label {
      font-weight: bold;
      display: block;
      margin-bottom: 5px;
    }

    input[type="text"],
    input[type="number"],
    input[type="file"],
    select {
      padding: 10px;
      border-radius: 5px;
      background-color: #2c2c2c;
      border: 1px solid #444;
      color: #fff;
      font-size: 1rem;
      width: 100%;
      box-sizing: border-box;
      transition: border-color 0.2s ease;
    }

    input:focus,
    select:focus {
      border-color: #777;
      outline: none;
    }

    .donation-row {
      display: flex;
      gap: 15px;
      margin-bottom: 15px;
    }

    .donation-row > div {
      flex: 1;
    }

    button {
      padding: 10px 20px;
      font-size: 1rem;
      border-radius: 5px;
      border: none;
      cursor: pointer;
      min-width: 150px;
      transition: background-color 0.2s ease, transform 0.2s ease;
    }

    button:hover {
      transform: translateY(-1px);
    }

    button[type="button"] {
      background-color: #007bff;
      color: #fff;
    }

    button[type="submit"] {
      background-color: #4caf50;
      color: #fff;
    }

    .button-container {
      text-align: center;
      margin-top: 20px;
      display: flex;
      justify-content: center;
      gap: 15px;
    }

    .success-message {
      display: none;
      text-align: center;
      background: #1e1e1e;
      padding: 20px;
      border-radius: 10px;
    }

    .footer-message {
      text-align: center;
      margin-top: 30px;
      font-size: 0.9rem;
      color: #aaaaaa;
      font-style: italic;
    }

    .image-preview {
      margin-top: 10px;
      text-align: center;
    }

    .image-preview img {
      max-width: 100px;
      max-height: 100px;
      border: 2px solid #444;
      border-radius: 5px;
    }

    @media (max-width: 768px) {
      form {
        padding: 20px;
      }

      .donation-row {
        flex-direction: column;
      }

      .button-container {
        flex-direction: column;
      }
    }

    /* Select2 Dark Mode */
    .select2-container .select2-selection--single {
      background-color: #2c2c2c !important;
      border: 1px solid #444 !important;
      color: #fff !important;
      border-radius: 5px;
      height: 42px !important;
    }
    .select2-container--default .select2-selection--single .select2-selection__arrow b {
      border-color: #fff transparent transparent transparent !important;
    }
    .select2-container--open .select2-selection--single .select2-selection__arrow b {
      border-color: transparent transparent #fff transparent !important;
    }
    .select2-selection__rendered {
      color: #fff !important;
      line-height: 40px !important;
    }
    .select2-container .select2-dropdown {
      background-color: #2c2c2c !important;
      border: 1px solid #444 !important;
      color: #fff !important;
    }
    .select2-results__option {
      padding: 10px !important;
    }
    .select2-results__option--highlighted {
      background-color: #444 !important;
    }
  </style>
</head>
<body>
  <main>
    <div id="form-container">
      <h1>Donation Form</h1>
      <form id="donationForm" onsubmit="submitDonationForm(event)">
        <label for="username">Username:</label>
        <input type="text" name="username" id="username" required />

        <h2>Materials</h2>
        <div id="materialRows">
          <div class="donation-row">
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
          </div>
        </div>
        <button type="button" onclick="addMaterialRow()">Add Material</button>

        <h2>Processed Items</h2>
        <div id="processedRows">
          <div class="donation-row">
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
          </div>
        </div>
        <button type="button" onclick="addProcessedRow()">Add Processed Item</button>

        <h2>Currency Donations</h2>
        <div class="donation-row">
          <div>
            <label for="gold">Gold:</label>
            <input type="number" name="gold" id="gold" min="0" value="0" />
          </div>
          <div>
            <label for="silver">Silver:</label>
            <input type="number" name="silver" id="silver" min="0" value="0" />
          </div>
          <div>
            <label for="copper">Copper:</label>
            <input type="number" name="copper" id="copper" min="0" value="0" />
          </div>
        </div>

        <h2>Image Upload</h2>
        <div class="donation-row">
          <div>
            <label for="image">Upload an Image:</label>
            <input type="file" id="image" name="image" accept="image/*" />
          </div>
        </div>
        <div class="image-preview" id="imagePreview"></div>

        <div class="separator"></div>
        <div class="button-container">
          <button type="button" onclick="resetForm()">Reset Form</button>
          <button type="submit">Submit Donations</button>
        </div>
      </form>

      <div class="footer-message">
        Created by xCatGuy for Kaos and Lace Cartel
      </div>
    </div>

    <div id="success-message" class="success-message">
      <h1>Thank You!</h1>
      <p>Your donation has been successfully submitted.</p>
    </div>
  </main>
</body>
</html>
