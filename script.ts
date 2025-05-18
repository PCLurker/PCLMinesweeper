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

  // Add methods for handling cell clicks, reveals, flags, win/loss conditions, etc.
  // public handleCellClick(row: number, col: number, isRightClick: boolean): void { ... }
  // public revealCell(row: number, col: number): number { ... } // Return mine count or -1 if mine

  /**
   * Handles the left-click event on a cell.
   * @param row The row index of the clicked cell (0-based).
   * @param col The column index of the clicked cell (0-based).
   */
  public static handleLeftClick(row: number, col: number): void {
    console.log(`Left clicked cell at row ${row}, col ${col}`);
    // Implement your game logic for left-clicking a cell (e.g., revealing the cell)
    const cellElement = document.getElementById(`cell_${row}_${col}`);
    if (cellElement && !cellElement.classList.contains('revealed') && !cellElement.classList.contains('flagged')) {
      cellElement.classList.add('revealed');
      // Add logic to check for mines, count neighbors, etc.
    }
  }

  /**
   * Handles the right-click (contextmenu) event on a cell.
   * @param row The row index of the clicked cell (0-based).
   * @param col The column index of the clicked cell (0-based).
   * @param event The MouseEvent object.
   */
  public static handleRightClick(row: number, col: number, event: MouseEvent): void {
    console.log(`Right clicked cell at row ${row}, col ${col}`);
    // Implement your game logic for right-clicking a cell (e.g., flagging the cell)
    const cellElement = document.getElementById(`cell_${row}_${col}`);
    if (cellElement && !cellElement.classList.contains('revealed')) {
      cellElement.classList.toggle('flagged'); // Toggle the 'flagged' class
    }

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
      cell.addEventListener('click', () => {
        // Retrieve row and col from data attributes within the handler
        const clickedRow = Number(cell.dataset.row);
        const clickedCol = Number(cell.dataset.col);
        // Ensure conversion is successful before calling handler
        if (!isNaN(clickedRow) && !isNaN(clickedCol)) {
          MinesweeperGame.handleLeftClick(clickedRow, clickedCol);
        }
      });

      // Right-click (contextmenu event)
      cell.addEventListener('contextmenu', (event) => {
        // Retrieve row and col from data attributes within the handler
        const clickedRow = Number(cell.dataset.row);
        const clickedCol = Number(cell.dataset.col);
        // Ensure conversion is successful before calling handler
        if (!isNaN(clickedRow) && !isNaN(clickedCol)) {
          MinesweeperGame.handleRightClick(clickedRow, clickedCol, event);
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