var GameInstance: MinesweeperGame = null;

class MinesweeperGame {
  public width: number;
  public height: number;
  public nMine: number;
  public mineArray: number[]; // Renamed for clarity and consistency
  // Add other game state arrays/variables here, e.g.:
  // private revealedArray: boolean[][];
  // private flaggedArray: boolean[][];

  constructor(width: number, height: number, nMine: number) {
    if (width <= 0 || height <= 0 || nMine < 0 || nMine > width * height) {
      throw new Error("Invalid dimensions or mine count for the game board.");
    }
    this.width = width;
    this.height = height;
    this.nMine = nMine;
    this.mineArray = []; // Initialize the array
    // Initialize other state variables here
  }

  /**
   * Generates and shuffles the internal mine array.
   * This method is internal to the class as it manages class state.
   */
  private generateMineArray(): void {
    const arraySize = this.width * this.height;
    this.mineArray = new Array(arraySize);

    for (let i = 0; i < this.nMine; i++) {
      this.mineArray[i] = 1; // Mine
    }
    for (let i = this.nMine; i < arraySize; i++) {
      this.mineArray[i] = 0; // Empty
    }

    // Fisher-Yates (Knuth) Shuffle
    for (let i = arraySize - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = this.mineArray[i];
      this.mineArray[i] = this.mineArray[j];
      this.mineArray[j] = temp;
    }
  }

  /**
   * Initializes a new game board by generating the mine array and
   * setting up other initial game state.
   */
  public initializeBoard(): void {
    this.generateMineArray();
    // Initialize revealedArray, flaggedArray, etc.
    console.log(`Board initialized: ${this.width}x${this.height} with ${this.nMine} mines.`);
  }

  /**
   * Gets the value (mine or empty) at a specific cell index from the internal array.
   * @param index The 1D index of the cell in the flat mineArray.
   * @returns 1 if mine, 0 if empty.
   */
  private getMineValueAtIndex(index: number): number {
    if (index < 0 || index >= this.mineArray.length) {
      // Handle out of bounds access, though typically internal methods
      // should not receive invalid indices from other class methods.
      console.error(`Attempted to access out-of-bounds index: ${index}`);
      return -1; // Or throw an error
    }
    return this.mineArray[index];
  }

  /**
   * Calculates the 1D index in mineArray from 2D row and column.
   * @param row The row index (0-based).
   * @param col The column index (0-based).
   * @returns The 1D index.
   */
  private getIndex(row: number, col: number): number {
    if (row < 0 || row >= this.height || col < 0 || col >= this.width) {
      console.error(`Attempted to get index for out-of-bounds cell: row ${row}, col ${col}`);
      return -1; // Indicate error
    }
    return row * this.width + col;
  }


  /**
   * Checks if a cell contains a mine.
   * @param row The row index (0-based).
   * @param col The column index (0-based).
   * @returns True if the cell contains a mine, false otherwise.
   */
  public isMine(row: number, col: number): boolean {
    const index = this.getIndex(row, col);
    if (index === -1) return false; // Handle out of bounds

    return this.getMineValueAtIndex(index) === 1;
  }

  /**
   * Counts the number of neighboring cells that contain mines.
   * @param row The row index of the cell (0-based).
   * @param col The column index of the cell (0-based).
   * @returns The number of neighboring mines.
   */
  public countNeighborMines(row: number, col: number): number {
    let mineCount = 0;
    // Define relative coordinates for 8 neighbors
    const neighbors = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];

    // count itself
    if (this.isMine(row, col)) mineCount++;

    for (const [dr, dc] of neighbors) {
      const neighborRow = row + dr;
      const neighborCol = col + dc;

      // Check if the neighbor is within the board bounds
      if (
        neighborRow >= 0 && neighborRow < this.height &&
        neighborCol >= 0 && neighborCol < this.width
      ) {
        // Check if the neighbor cell contains a mine
        if (this.isMine(neighborRow, neighborCol)) {
          mineCount++;
        }
      }
    }
    return mineCount;
  }

  /**
   * Handles a left-click on a cell.
   * Implements the specific left-click game logic for the variant.
   * @param row The row index.
   * @param col The column index.
   * @param game The MinesweeperGame instance.
   * @returns True if the game is over, false otherwise.
   */
  public static handleLeftClick(event: MouseEvent, row: number, col: number, game: MinesweeperGame): boolean {
    const cellElement = document.getElementById(`cell_${row}_${col}`);
    if (!cellElement) return false;

    const currentState = getCellStateFromElement(cellElement);
    let gameOver = false;

    // Only react to clicks on unopened cells that are marked
    if (currentState !== 'unopened-marked-safe' && currentState !== 'unopened-marked-mine') {
      console.log(`Left click ignored on cell ${row},${col} in state: ${currentState}`);
      return false; // Do nothing if not in a marked unopened state
    }

    // Remove unopened and marking classes, add revealed
    cellElement.classList.remove('unopened', 'marked-safe', 'marked-mine');
    cellElement.classList.add('revealed');

    const isCellMine = game.isMine(row, col); // Assuming isMine method exists on game instance

    if (currentState === 'unopened-marked-safe') {
      // User marked safe and left-clicked
      if (isCellMine) {
        // Incorrect guess: Marked safe, but it's a mine
        gameOver = true;
        cellElement.classList.add('mine'); // Visual indication it was a mine
        //cellElement.style.backgroundColor = 'red'; // Explicitly red background for revealed mine
        console.log("Game Over: Marked safe, but it was a mine!");
      } else {
        // Correct guess: Marked safe, and it's safe
        //cellElement.style.backgroundColor = 'lightgreen'; // Explicitly green background for revealed safe
        cellElement.classList.add('safe'); // Visual indication it was safe
        console.log(`Revealed safe cell at ${row},${col}`);
        // Display neighbor mine count including itself
        const mineCount = game.countNeighborMines(row, col); // Assuming this method exists
        cellElement.textContent = mineCount > 0 ? String(mineCount) : '';
      }
    } else if (currentState === 'unopened-marked-mine') {
      // User marked mine and left-clicked
      if (!isCellMine) {
        // Incorrect guess: Marked mine, but it's safe
        gameOver = true;
        cellElement.classList.add('safe'); // Visual indication it was safe
        //cellElement.style.backgroundColor = 'lightgreen'; // Show it was safe visually
        // Display neighbor mine count including itself (on the cell they thought was a mine)
        const mineCount = game.countNeighborMines(row, col);
        cellElement.textContent = mineCount > 0 ? String(mineCount) : '';
        console.log("Game Over: Marked mine, but it was safe!");
      } else {
        // Correct guess: Marked mine, and it's a mine
        cellElement.classList.add('mine'); // Visual indication it's a mine
        //cellElement.style.backgroundColor = 'red'; // Explicitly red background for revealed mine
        // Display neighbor mine count including itself (on the cell they correctly identified as a mine)
        const mineCount = game.countNeighborMines(row, col);
        cellElement.textContent = String(mineCount); // Display count as per user rule
        console.log(`Correctly identified mine at ${row},${col}`);
        // Note: According to your rule, this correct guess doesn't end the game immediately.
      }
    }

    // Disable further clicks on this cell (e.g., by removing event listeners or checking state at start)
    // For simplicity, the state check at the start of the function serves this purpose.

    // TODO: If gameOver is true, trigger global game over sequence.
    return gameOver;
  }

  /**
   * Handles a right-click (contextmenu) on a cell.
   * Implements the specific right-click game logic for the variant (toggling marks).
   * @param row The row index.
   * @param col The column index.
   * @param game The MinesweeperGame instance.
   */
  public static handleRightClick(event: MouseEvent, row: number, col: number, game: MinesweeperGame): void {
    const cellElement = document.getElementById(`cell_${row}_${col}`);
    if (!cellElement) return;

    const currentState = getCellStateFromElement(cellElement);

    // Only react to clicks on unopened cells
    if (currentState === 'revealed-mine' || currentState === 'revealed-safe') {
      console.log(`Right click ignored on revealed cell ${row},${col}`);
      return;
    }

    // Toggle between the unopened marked states
    if (currentState === 'unopened-nomark') {
      cellElement.classList.add('marked-safe');
      console.log(`Cell ${row},${col} marked as safe`);
    } else if (currentState === 'unopened-marked-safe') {
      cellElement.classList.remove('marked-safe');
      cellElement.classList.add('marked-mine');
      console.log(`Cell ${row},${col} marked as mine`);
    } else if (currentState === 'unopened-marked-mine') {
      cellElement.classList.remove('marked-mine');
      console.log(`Cell ${row},${col} mark removed`);
    }

    // The visual update (background images for marks) should be handled by your CSS
    // based on the presence of the 'marked-safe' or 'marked-mine' classes on an 'unopened' cell.
        // Prevent the default browser context menu from appearing
    event.preventDefault();
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
function generateGameBoardHTML(width: number, height: number, game: MinesweeperGame): void {
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

      // Attach event listeners for left-click and right-click

      // Left-click
      cell.addEventListener('click', (event) => {
        // Retrieve row and col from data attributes within the handler
        const clickedRow = Number(cell.dataset.row);
        const clickedCol = Number(cell.dataset.col);
        // Ensure conversion is successful before calling handler
        if (!isNaN(clickedRow) && !isNaN(clickedCol)) {
          MinesweeperGame.handleLeftClick(event, clickedRow, clickedCol, game);
        }
      });

      // Right-click (contextmenu event)
      cell.addEventListener('contextmenu', (event) => {
        // Retrieve row and col from data attributes within the handler
        const clickedRow = Number(cell.dataset.row);
        const clickedCol = Number(cell.dataset.col);
        // Ensure conversion is successful before calling handler
        if (!isNaN(clickedRow) && !isNaN(clickedCol)) {
          MinesweeperGame.handleRightClick(event, clickedRow, clickedCol, game);
        }
      });

      // Append the cell to the gameboard container
      gameboardElement.appendChild(cell);
    }
  }
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
    const width = Math.round(safeStringToNumber(widthInput.value));
    const height = Math.round(safeStringToNumber(heightInput.value));
    const nMine = Math.round(safeStringToNumber(mineInput.value));

    if (width !== null && height !== null && nMine !== null && width > 0 && height > 0 && nMine >= 0) { // Added checks for positive dimensions and non-negative mines
      // if (nMine > width * height) {
      //   console.log(`There is not enough cell for ${nMine} mines`);
      //   return;
      // }
      try {
        // Create a new game instance
        GameInstance = new MinesweeperGame(width, height, nMine);
        GameInstance.initializeBoard(); // Set up the internal state

        // Now, when generating the HTML cells, you can pass the 'game' instance
        // or store it globally if you absolutely must (though passing is better).
        // Alternatively, the cell click handlers can access the 'game' instance
        // if it's in a scope they can reach (e.g., if 'game' is declared outside
        // the NewGameClicked function but not globally, or if the event handlers
        // are created in a closure that captures the 'game' instance).

        // After generating HTML cells, attach event listeners that call
        // methods on the 'game' instance, e.g.:
        // cell.addEventListener('click', () => game.handleCellClick(row, col, false));
        // cell.addEventListener('contextmenu', (event) => {
        //    game.handleCellClick(row, col, true);
        //    event.preventDefault();
        // });

        // You would also need to visually update the HTML based on the game state (revealedArray, flaggedArray, etc.)
        // Methods like game.getCellValue(row, col) or game.getCellState(row, col) would be useful here.

        // For demonstration, let's generate the HTML board after initializing the game state
        generateGameBoardHTML(width, height, GameInstance); // Pass game instance

      } catch (error: any) {
        console.error("Failed to initialize game:", error.message);
        const displayElement = document.getElementById("display");
        if (displayElement) {
          displayElement.innerHTML = `Error: ${error.message}`;
        }
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

function ShowMineClicked(): void {
  if (GameInstance == null) return;

  for (let i = 0; i < GameInstance.height; i++) {
    for (let j = 0; j < GameInstance.width; j++) {
      if (GameInstance.isMine(i, j)) {
        const cellElement = document.getElementById(`cell_${i}_${j}`);
        if (cellElement) {
          cellElement.style.backgroundColor = '#ff7f7f';
        }
      }
    }
  }
}

function ShowCellClueClicked(): void {
  if (GameInstance == null) return;

  for (let i = 0; i < GameInstance.height; i++) {
    for (let j = 0; j < GameInstance.width; j++) {
      const c = GameInstance.countNeighborMines(i, j)
      const cellElement = document.getElementById(`cell_${i}_${j}`);
      if (cellElement) {
        cellElement.innerHTML = `<p>${String(c)}</p>`;
        if (c == 0) {
          cellElement.style.color = '#7f7f7f';
        }
      }
    }
  }
}

// Helper function to get the state from CSS classes
function getCellStateFromElement(cellElement: HTMLElement):
  'unopened-nomark' | 'unopened-marked-safe' | 'unopened-marked-mine' | 'revealed-mine' | 'revealed-safe' {

  if (cellElement.classList.contains('revealed')) {
    return cellElement.classList.contains('mine') ? 'revealed-mine' : 'revealed-safe';
  }
  if (cellElement.classList.contains('marked-safe')) {
    return 'unopened-marked-safe';
  }
  if (cellElement.classList.contains('marked-mine')) {
    return 'unopened-marked-mine';
  }
  return 'unopened-nomark'; // Default unopened state
}