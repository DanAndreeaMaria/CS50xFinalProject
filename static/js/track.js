let input = document.querySelector("input");
let selectedItems = [];

// Listens the user input from the text box
input.addEventListener("input", async function () {
  if (!input.value.trim()) {
    document.getElementById("search-results").innerHTML = "";
    return;
  }

  // HTTP request from JavaScript to server
  let response = await fetch("/search?q=" + input.value);
  let food = await response.json();
  let html = "";

  if (food.length === 0) {
    html = `<li class='list-group-item text-muted'>No result found</li>`;
  }

  // Build list items with a data-index
  for (let i = 0; i < food.length; i++) {
    let item = food[i];
    html += `
      <li class="list-group-item d-flex justify-content-between align-items-center" style="max-width: 500px;">
        ${item.food_name}
        <button class="btn btn-sm btn-outline-success" data-index="${i}">
          Add
        </button>
      </li>
    `;
  }

  // Insert HTML into the search results container
  let container = document.getElementById("search-results");
  container.innerHTML = html;
  // document.getElementById("search-results").innerHTML = html;

  // Attach event listeners AFTER inserting HTML
  container.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      let index = button.getAttribute("data-index");
      addItem(food[index]); // Pass the actual item object
    });
  });
});

// Inject into search results only
// document.getElementById("search-results").innerHTML = html;

// Function to add a new food item to the user's selected items list
function addItem(item) {
  // Push a new object into the selectedItems array
  // Initialize with the food properties from the given item
  selectedItems.push({
    food_name: item.food_name, // Food name (string)
    category: item.category, // Food category (e.g., Fruit, Vegetable, etc.)
    quantity: 100, // Default quantity set to 100g
    fiber: Number(item.fiber), // Convert fiber value to number
    iron: Number(item.iron), // Convert iron value to number
    protein: Number(item.protein), // Convert protein value to number
    calcium: Number(item.calcium), // Convert calcium value to number
    magnesium: Number(item.magnesium), // Convert magnesium value to number
    omega3: Number(item.omega3), // Convert omega-3 value to number
    vitaminC: Number(item.vitaminC), // Convert vitamin C value to number
    zinc: Number(item.zinc), // Convert zinc value to number
  });

  // Re-render the UI to reflect the updated list of selected items
  renderSelectedItems();
}

// Function to display the list of currently selected food items in the UI
// I used AI by searching how to loop through items and modify the DOM
function renderSelectedItems() {
  let itemList = ""; // Initialize an empty string to build the HTML list

  // Loop through all items in the selectedItems array
  for (let i = 0; i < selectedItems.length; i++) {
    let item = selectedItems[i]; // Get the current item

    // Append an HTML list item for each food item
    itemList += `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <div>
          ${item.food_name}   <!-- Display food name -->
        </div>
        <div class="d-flex align-items-center">
          <!-- Input field for quantity (grams), prefilled with item's current quantity -->
          <input
            type="number"
            min="1"
            value="${item.quantity}"
            style="width: 70px; margin-right: 7px;"
            onchange="updateQuantity(${i}, this.value)"  
          /> g
          <!-- Button to remove the item from the list -->
          <button class="btn btn-sm btn-outline-danger ms-3" onclick="removeItem(${i})">Remove</button>
        </div>
      </li>`;
  }

  // Update the DOM by injecting the built list into the "selected-items" container
  document.getElementById("selected-items").innerHTML = itemList;
}

// Function to update the quantity
function updateQuantity(index, value) {
  let qty = parseInt(value);
  if (!isNaN(qty) && qty > 0) {
    selectedItems[index].quantity = qty;
  }
}

// Function to remove an item from the list
// I used AI to search how to remove an item from the list
function removeItem(index) {
  selectedItems.splice(index, 1); // Remove item at that index
  // Re-render the food items list
  renderSelectedItems();
}

// Function to save the selected food items into the database
// Used ChatGPT to find out how this function has to be implemented -
// -- how to save items into a database, how to send info to the backend
// -- how to modify the DOM to display the messages
function saveItems() {
  // Create a new array where each item's nutrients are scaled
  // based on the user-specified quantity (default is 100g).
  const scaledItems = selectedItems.map((item) => {
    // Scaling factor: e.g., if quantity = 50g → factor = 0.5
    const factor = (item.quantity || 100) / 100;

    // Return a new object with scaled nutrient values
    return {
      food_name: item.food_name, // Food name (string)
      category: item.category, // Food category (e.g., fruit, vegetable, etc.)
      quantity: item.quantity, // Quantity in grams (entered by user)
      fiber: item.fiber * factor, // Scaled fiber value
      iron: item.iron * factor, // Scaled iron value
      protein: item.protein * factor, // Scaled protein value
      calcium: item.calcium * factor, // Scaled calcium value
      magnesium: item.magnesium * factor, // Scaled magnesium value
      omega3: item.omega3 * factor, // Scaled omega-3 value
      vitaminC: item.vitaminC * factor, // Scaled vitamin C value
      zinc: item.zinc * factor, // Scaled zinc value
    };
  });

  // Send the scaled items to the backend (Flask route: /save_items)
  fetch("/save_items", {
    method: "POST", // HTTP POST request
    headers: {
      "Content-Type": "application/json", // Tell server we're sending JSON
    },
    body: JSON.stringify({ items: scaledItems }), // Send items as JSON
  }).then((response) => {
    // Create a temporary message element to display feedback
    let message = document.createElement("div");

    if (response.ok) {
      // Success case → show green confirmation message
      message.innerText = "Items saved!";
      message.className = "text-success mt-3 text-start";

      // Re-render the list of selected items (keeps UI in sync)
      renderSelectedItems();
    } else {
      // Error case → show red error message
      message.innerText = "Failed to save items.";
      message.className = "text-danger mt-3 text-start";
    }

    // Append the message to the container so the user sees it
    document.querySelector(".glass-container").appendChild(message);

    // After 3 seconds, start fading out the message
    setTimeout(() => {
      message.classList.add("fade-out");
    }, 3000);

    // After 4 seconds, completely remove the message from the DOM
    setTimeout(() => {
      message.remove();
    }, 4000);
  });
}

// Function to calculate the total amount of each nutrient value (e.g. fiber, iron etc.)
// Used AI to search how to calculate the nutrients
function calculateLocalTotals() {
  // Initialize each nutrient totals with 0 before calculations
  let totals = {
    total_fiber: 0,
    total_iron: 0,
    total_protein: 0,
    total_calcium: 0,
    total_magnesium: 0,
    total_omega3: 0,
    total_vitaminC: 0,
    total_zinc: 0,
  };

  // Initialize counters to track unique food portions per category
  let portionCounts = {
    Vegetable: 0,
    Fruit: 0,
    Legume: 0,
    "Whole Grain": 0,
    Seed: 0,
    Nut: 0,
  };

  // Use sets to ensure each food item is only counted once per category
  let countedItems = {
    Vegetable: new Set(),
    Fruit: new Set(),
    Legume: new Set(),
    "Whole Grain": new Set(),
    Seed: new Set(),
    Nut: new Set(),
  };

  // Iterate through each selected item the user has chosen, calculate nutrient totals and update portion counts
  for (let item of selectedItems) {
    // The factor is calculated  according to the input value provided by the user (e.g. 50g -> 0.5)
    const factor = (item.quantity || 100) / 100;

    // Add scaled nutrient values to the totals
    totals.total_fiber += item.fiber * factor;
    totals.total_iron += item.iron * factor;
    totals.total_protein += item.protein * factor;
    totals.total_calcium += item.calcium * factor;
    totals.total_magnesium += item.magnesium * factor;
    totals.total_omega3 += item.omega3 * factor;
    totals.total_vitaminC += item.vitaminC * factor;
    totals.total_zinc += item.zinc * factor;

    // If the item belongs to a category, it should be considered it only once per food name
    if (item.category && portionCounts[item.category] !== undefined) {
      // This is to only count food once per category, prevent double-counting for the same category
      if (!countedItems[item.category].has(item.food_name)) {
        countedItems[item.category].add(item.food_name);
        portionCounts[item.category] += 1;
      }
    }
  }

  // Arrow function - pluralPortion - with a (count) parameter and a condition for singular and plural values on portion/portions of food
  // Helper function to format portion counts with correct singular/plural
  // I used AI to search how to implement an arrow function and how to update the DOM with the calculated values
  const pluralPortion = (count) =>
    `${count} ${count <= 1 ? "portion" : "portions"}`;

  // Updating the DOM by adding the UI, each nutrient has a different color and will be updated with the results provided above
  let html = `
              <h4 class="text-center">Nutrient Totals</h4>
                <span class="border border-4 rounded-pill p-3 m-3 row vivid-red">${totals.total_fiber.toFixed(
                  1
                )} g of Fiber</span>
                <span class="border border-4 rounded-pill p-3 m-3 row electric-blue">${totals.total_iron.toFixed(
                  1
                )} g of Iron</span>
                <span class="border border-4 rounded-pill p-3 m-3 row lime-green">${totals.total_protein.toFixed(
                  1
                )} g of Protein</span>
                <span class="border border-4 rounded-pill p-3 m-3 row bright-orange">${totals.total_calcium.toFixed(
                  1
                )} mg of Calcium</span>
                <span class="border border-4 rounded-pill p-3 m-3 row hot-pink">${totals.total_magnesium.toFixed(
                  1
                )} mg of Magnesium</span>
                <span class="border border-4 rounded-pill p-3 m-3 row purple-punch">${totals.total_omega3.toFixed(
                  1
                )} mg of Omega-3</span>
                <span class="border border-4 rounded-pill p-3 m-3 row lemon-yellow">${totals.total_vitaminC.toFixed(
                  1
                )} mg of Vitamin C</span>
                <span class="border border-4 rounded-pill p-3 m-3 row aqua-mint">${totals.total_zinc.toFixed(
                  1
                )} mg of Zinc</span>

                <!-- In this section are represented the portion counts, every portion has different colors as the nutrient values have it too -->
                <h4 class="text-center mt-4">Portion Counts</h4>
                    <span class="border border-4 rounded-pill p-3 m-3 row pastel-coral">Veggies: ${pluralPortion(
                      portionCounts.Vegetable
                    )}</span>
                    <span class="border border-4 rounded-pill p-3 m-3 row pastel-mint">Fruit: ${pluralPortion(
                      portionCounts.Fruit
                    )}</span>
                    <span class="border border-4 rounded-pill p-3 m-3 row pastel-sky">Legume: ${pluralPortion(
                      portionCounts.Legume
                    )}</span>
                    <span class="border border-4 rounded-pill p-3 m-3 row pastel-lavender">Whole Grain: ${pluralPortion(
                      portionCounts["Whole Grain"]
                    )}</span>
                    <span class="border border-4 rounded-pill p-3 m-3 row pastel-peach">Seeds: ${pluralPortion(
                      portionCounts.Seed
                    )}</span>
                    <span class="border border-4 rounded-pill p-3 m-3 row pastel-lemon">Nuts: ${pluralPortion(
                      portionCounts.Nut
                    )}</span>
              `;

  document.getElementById("totals").innerHTML = html;
}

// Track history function - listens for date selection and displays nutrient history
// I used AI to find out how to create a history section by searching in the calendar by the user-input date
document
  .getElementById("historyDate")
  .addEventListener("change", async function () {
    const selectedDate = this.value;
    if (!selectedDate) return; // Exit early if no date is chosen

    try {
      // Fetch nutrient history for the selected date from backend API
      const response = await fetch(
        `/api/nutrient-history?date=${selectedDate}`
      );
      const historyData = await response.json();
      const historyResultDiv = document.getElementById("historyResult");

      if (historyData) {
        // Daily nutrient target values (recommended intake)
        const targets = {
          fiber: 28,
          iron: 18,
          protein: 50,
          calcium: 1300,
          magnesium: 420,
          omega3: 1100,
          vitaminC: 90,
          zinc: 11,
        };

        // Human-readable nutrient names for display messages
        const nutrientNames = {
          fiber: "Fiber",
          iron: "Iron",
          protein: "Protein",
          calcium: "Calcium",
          magnesium: "Magnesium",
          omega3: "Omega 3",
          vitaminC: "Vitamin C",
          zinc: "Zinc",
        };

        // Build HTML list showing consumed nutrient amounts
        let nutrientList = "<ul>";
        for (const nutrient of Object.keys(targets)) {
          const value = historyData[nutrient] || 0;
          nutrientList += `<li class="list-spacing">${value.toFixed(1)} ${
            ["calcium", "magnesium", "omega3"].includes(nutrient) ? "mg" : "g"
          } of ${nutrient}</li>`;
        }
        nutrientList += "</ul>";

        // Generate feedback messages comparing intake with targets
        let feedback = "";
        for (const [nutrient, target] of Object.entries(targets)) {
          const value = historyData[nutrient] || 0;
          if (value >= target) {
            feedback += `<p><i class="bi bi-check-circle-fill"></i> <strong class="bold-style">${nutrientNames[nutrient]}</strong> goal reached, good job!</p>`;
          } else {
            feedback += `<p><i class="bi bi-exclamation-triangle-fill"></i> A bit more <strong class="bold-style">${nutrientNames[nutrient]}</strong> would help!</p>`;
          }
        }

        // Insert nutrient list and feedback into the DOM
        historyResultDiv.innerHTML = `
        <p><strong>On ${new Date(
          selectedDate
        ).toLocaleDateString()}, you consumed:</strong></p>
        ${nutrientList}
        <p>${feedback}</p>
        `;
      } else {
        // Fallback if no history data is found for that date
        historyResultDiv.textContent = `No data found for ${new Date(
          selectedDate
        ).toLocaleDateString()}.`;
      }
    } catch (error) {
      // Handle network or parsing errors gracefully
      console.error(error);
    }
  });
