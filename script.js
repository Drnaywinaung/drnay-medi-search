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
    const url = `https://cdn.jsdelivr.net/gh/${GITHUB_USERNAME}/${GITHUB_REPO}@main/${firstLetter}.json`;

    try {
        // Fetch the data from the URL
        const response = await fetch(url);
        
        // Handle cases where the file doesn't exist (e.g., for 'x.json')
        if (!response.ok) {
            displayNoResults();
            return;
        }

        const data = await response.json();

        // --- Search logic to check name, composition1, and composition2 ---
        const matches = data.filter(drug => {
            const nameMatch = drug.name && drug.name.toLowerCase().includes(query);
            const composition1Match = drug.short_composition1 && drug.short_composition1.toLowerCase().includes(query);
            const composition2Match = drug.short_composition2 && drug.short_composition2.toLowerCase().includes(query);

            return nameMatch || composition1Match || composition2Match; // Return true if ANY of the fields match
        });
        // --- End of search logic ---

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

        // Combine composition fields, handling if the second one is missing. Trim whitespace.
        let composition = drug.short_composition1 ? drug.short_composition1.trim() : 'N/A';
        if (drug.short_composition2 && drug.short_composition2.trim() !== "") {
            composition += ` + ${drug.short_composition2.trim()}`;
        }

        // Build the HTML for the result item
        resultElement.innerHTML = `
            <h3>${drug.name || 'Name not available'}</h3>
            <p><strong>Composition:</strong> ${composition}</p>
            ${drug.manufacturer_name ? `<p><strong>Manufacturer:</strong> ${drug.manufacturer_name}</p>` : ''}
            ${drug.pack_size_label ? `<p><strong>Pack Size:</strong> ${drug.pack_size_label}</p>` : ''}
            ${drug.medicine_desc ? `<p><strong>Description:</strong> ${drug.medicine_desc}</p>` : ''}
            ${drug.side_effects ? `<p><strong>Side Effects:</strong> ${drug.side_effects}</p>` : ''}
        `;
        resultsContainer.appendChild(resultElement);
    });
}

function displayNoResults() {
     resultsContainer.innerHTML = '<p>No matching drugs found.</p>';
}
