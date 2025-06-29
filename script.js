// --- Configuration ---
const GITHUB_USERNAME = 'Drnaywinaung';
const GITHUB_REPO = 'drnay-medi-search';

// --- Get DOM Elements ---
const searchInput = document.getElementById('searchInput');
const resultsContainer = document.getElementById('resultsContainer');

// --- Event Listener ---
// Listen for input in the search box
searchInput.addEventListener('input', handleSearch);


async function handleSearch(event) {
    const query = event.target.value.toLowerCase().trim();

    // If the search box is empty, clear results and return
    if (query.length === 0) {
        resultsContainer.innerHTML = '<p>Enter a drug name to begin your search.</p>';
        return;
    }

    // Determine which JSON file to load based on the first letter
    const firstLetter = query.charAt(0);

    // Construct the correct URL for the JSON file using jsDelivr
    const url = `https://cdn.jsdelivr.net/gh/${GITHUB_USERNAME}/${GITHUB_REPO}@main/${firstLetter}.json`;

    try {
        // Fetch the data from the URL
        const response = await fetch(url);
        
        // Handle cases where the file doesn't exist (e.g., for 'x.json')
        if (!response.ok) {
            if (response.status === 404) {
                 displayNoResults();
            } else {
                 resultsContainer.innerHTML = '<p>Error loading data. Please try again later.</p>';
            }
            return;
        }

        const data = await response.json();

        // Filter the data from the loaded file to find matches based on the 'name' field
        const matches = data.filter(drug => {
            // Ensure drug.name exists and is a string before calling toLowerCase()
            return drug.name && drug.name.toLowerCase().includes(query);
        });

        // Display the results
        displayResults(matches);

    } catch (error) {
        console.error("Failed to fetch or process data:", error);
        resultsContainer.innerHTML = '<p>An error occurred. Check the console for details.</p>';
    }
}

function displayResults(matches) {
    // Clear previous results
    resultsContainer.innerHTML = '';

    if (matches.length === 0) {
        displayNoResults();
        return;
    }

    // Create and append a result item for each match
    matches.forEach(drug => {
        const resultElement = document.createElement('div');
        resultElement.classList.add('result-item');

        // --- THIS IS THE UPDATED PART ---
        // Combine composition fields, handling if the second one is missing. Trim whitespace.
        let composition = drug.short_composition1 ? drug.short_composition1.trim() : 'N/A';
        if (drug.short_composition2 && drug.short_composition2.trim() !== "") {
            composition += ` + ${drug.short_composition2.trim()}`;
        }

        // Build the HTML for the result item using the new data structure
        // We use checks like (drug.manufacturer_name ? ... : '') to only show a line if the data exists
        resultElement.innerHTML = `
            <h3>${drug.name || 'Name not available'}</h3>
            <p><strong>Composition:</strong> ${composition}</p>
            ${drug.manufacturer_name ? `<p><strong>Manufacturer:</strong> ${drug.manufacturer_name}</p>` : ''}
            ${drug.pack_size_label ? `<p><strong>Pack Size:</strong> ${drug.pack_size_label}</p>` : ''}
        `;
        resultsContainer.appendChild(resultElement);
    });
}

function displayNoResults() {
     resultsContainer.innerHTML = '<p>No matching drugs found.</p>';
}