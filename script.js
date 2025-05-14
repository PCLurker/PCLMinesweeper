function multiply(a, b) {
    return a * b;
}
function buttonClicked() {
    // Get the input elements, checking if they exist and are input elements
    const widthInput = document.getElementById("width");
    const heightInput = document.getElementById("height");
    const displayElement = document.getElementById("display");
    // Check if all required elements exist and are of the expected type
    if (widthInput instanceof HTMLInputElement &&
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
        }
        else {
            // Handle the case where one or both inputs are not valid numbers
            displayElement.innerHTML = "Please enter valid numbers for width and height.";
        }
    }
    else {
        // Handle the case where one or more required elements were not found
        console.error("Error: Required HTML elements not found.");
        // Optionally update the display element to indicate an internal error
        if (displayElement !== null) {
            displayElement.innerHTML = "An internal error occurred.";
        }
    }
}
