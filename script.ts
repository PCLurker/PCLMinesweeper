function multiply(a: number, b: number): number {
    return a*b;
}

function buttonClicked(): void { // Return type changed to void as it doesn't return a value
  // Get the input elements, checking if they exist and are input elements
  const widthInput = document.getElementById("width");
  const heightInput = document.getElementById("height");
  const displayElement = document.getElementById("display");

  // Check if all required elements exist and are of the expected type
  if (
    widthInput instanceof HTMLInputElement &&
    heightInput instanceof HTMLInputElement &&
    displayElement !== null // displayElement is an HTMLElement, not necessarily an input
  ) {
    // Attempt to convert input values to numbers
    const w = Number(widthInput.value);
    const h = Number(heightInput.value);

    // Check if both conversions resulted in valid numbers (not NaN)
    if (!isNaN(w) && !isNaN(h)) {
      // Perform the multiplication and display the result
      displayElement.innerHTML = String(multiply(w, h));
    } else {
      // Handle the case where one or both inputs are not valid numbers
      displayElement.innerHTML = "Please enter valid numbers for width and height.";
    }
  } else {
    // Handle the case where one or more required elements were not found
    console.error("Error: Required HTML elements not found.");
    // Optionally update the display element to indicate an internal error
    if (displayElement !== null) {
        displayElement.innerHTML = "An internal error occurred.";
    }
  }
}

/**
 * Attempts to convert a string to a number.
 * Returns the number if the string is a valid number representation, otherwise returns null.
 * @param input The string to convert.
 * @returns The number or null if conversion fails.
 */
function safeStringToNumber(input: string): number | null {
  // Use the Number constructor or unary plus (+) for conversion.
  // Both return NaN if the entire string is not a valid number.
  const num = Number(input);

  // Check if the result is NaN. isNaN() is necessary because NaN != NaN.
  if (isNaN(num)) {
    return null; // Indicate failure by returning null
  }

  return num; // Return the successfully converted number
}

/**
 * Generates the Minesweeper game board grid dynamically.
 * @param width The number of columns.
 * @param height The number of rows.
 */
function generateGameBoard(width: number, height: number): void {
    const gameboardElement = document.getElementById("gameboard");

    if (!gameboardElement) {
        console.error("Error: Gameboard container element not found.");
        return; // Cannot proceed if the container is missing
    }

    // Set CSS Custom Properties on the gameboard element to control grid dimensions
    gameboardElement.style.setProperty('--grid-columns', String(width));
    gameboardElement.style.setProperty('--grid-rows', String(height));

    // Clear any existing content in the gameboard
    gameboardElement.innerHTML = '';

    // Loop through rows and columns to create cell elements
    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            const cell = document.createElement("div");

            // Set the cell's ID and data attributes
            cell.id = `cell_${row}_${col}`; // Using 0-based index for ID
            cell.dataset.row = String(row); // Store 0-based row index
            cell.dataset.col = String(col); // Store 0-based col index

            // Add a class for styling (e.g., using CSS Grid or Flexbox)
            cell.classList.add("cell");

            // Optional: Add initial content or attributes (like onclick) here
            // cell.onclick = () => cellClicked(row, col);

            // Append the cell to the gameboard container
            gameboardElement.appendChild(cell);
        }
    }

    // Note: Displaying these divs as a grid requires CSS styling
    // For example, using CSS Grid on the #gameboard container:
    // #gameboard {
    //     display: grid;
    //     grid-template-columns: repeat(var(--grid-width), 30px); /* Example: 30px wide columns */
    //     grid-template-rows: repeat(var(--grid-height), 30px);  /* Example: 30px tall rows */
    //     gap: 1px; /* Optional gap between cells */
    // }
    // .cell {
    //     width: 30px; /* Example cell size */
    //     height: 30px;
    //     border: 1px solid gray; /* Example border */
    // }
    // You would set CSS variables --grid-width and --grid-height on #gameboard dynamically
    // gameboardElement.style.setProperty('--grid-width', String(width));
    // gameboardElement.style.setProperty('--grid-height', String(height));
}

function NewGameClicked(): void {
    const widthInput = document.getElementById("width");
    const heightInput = document.getElementById("height");
    const mineInput = document.getElementById("n_mine");
    const displayElement = document.getElementById("display");

    if (
        widthInput instanceof HTMLInputElement &&
        heightInput instanceof HTMLInputElement &&
        mineInput instanceof HTMLInputElement &&
        displayElement !== null
    ) {
        const width = safeStringToNumber(widthInput.value);
        const height = safeStringToNumber(heightInput.value);
        const nMine = safeStringToNumber(mineInput.value);

        if (width !== null && height !== null && nMine !== null && width > 0 && height > 0 && nMine >= 0) { // Added checks for positive dimensions and non-negative mines
            // Input is valid, generate the game board
            generateGameBoard(width, height);

            // Optionally, you can now use the width, height, and nMine values
            // to initialize your game logic (placing mines, etc.)

            if (displayElement) { // Added check in case displayElement was null, though checked above
              displayElement.innerHTML = `New game board generated: <span class="math-inline">\{width\}x</span>{height} with ${nMine} mines.`;
            }

        } else {
            // Handle invalid input
            if (displayElement) { // Added check
              displayElement.innerHTML = "Please enter valid positive numbers for width, height, and a non-negative number for mines.";
            }
        }
    } else {
        // Handle missing elements
        console.error("Error: One or more required HTML input or display elements not found.");
        if (displayElement) { // Added check
          displayElement.innerHTML = "An internal error occurred: Required page elements are missing.";
        }
    }
}