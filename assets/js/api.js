const apiServer = "http://localhost:8080";

// Chapter details with their names and verse counts
const chapters = {
    1: { name: "Al-Fatihah", verses: 7 },
    2: { name: "Al-Baqarah", verses: 286 },
    3: { name: "Aal-E-Imran", verses: 200 },
    4: { name: "An-Nisa", verses: 176 },
    // Add more chapters as needed...
};

// Populate chapter dropdown
const chapterSelect = document.getElementById("chapter");
for (const chapterNumber in chapters) {
    const option = document.createElement("option");
    option.value = chapterNumber;
    option.textContent = `${chapterNumber}. ${chapters[chapterNumber].name}`;
    chapterSelect.appendChild(option);
}

// Adjust verses dropdown based on selected chapter
const verseSelect = document.getElementById("verse");
chapterSelect.addEventListener("change", () => {
    const selectedChapter = chapterSelect.value;
    const verseCount = chapters[selectedChapter].verses;

    // Clear existing verses
    verseSelect.innerHTML = '<option value="" disabled selected>Choose a verse</option>';

    // Populate verses based on chapter selection
    for (let i = 1; i <= verseCount; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = `Verse ${i}`;
        verseSelect.appendChild(option);
    }
});

// Populate editions dropdown
const editionSelect = document.getElementById("edition");
const populateEditions = async () => {
    try {
        const payload = { action: "getEditionsList" };
        const response = await fetch(apiServer, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const result = await response.json();

        if (result.status === "success") {
            // Add editions to the dropdown
            result.data.forEach((edition) => {
                const option = document.createElement("option");
                option.value = edition.id;
                option.textContent = edition.englishName;
                editionSelect.appendChild(option);
            });
        } else {
            console.error("Failed to load editions:", result.message);
        }
    } catch (error) {
        console.error("Error fetching editions:", error);
    }
};
populateEditions();

// Handle form submission
document.getElementById("ayahForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    // Get form values
    const chapter = chapterSelect.value;
    const verse = verseSelect.value;
    const edition = editionSelect.value || 20; // Default edition is 20 if not selected

    // Prepare request payload
    const payload = {
        action: "getVerseDetails",
        chapter: parseInt(chapter),
        verse: parseInt(verse),
        edition_id: parseInt(edition),
    };

    try {
        // Fetch data from API
        const response = await fetch(apiServer, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        // Show result or error
        const resultDiv = document.getElementById("result");
        const referenceText = document.getElementById("reference");
        if (result.status === "success") {
            const verseText = result.data.verse_text;
            const reference = `${chapter}:${verse}`;

            // Set verse and reference
            document.getElementById("verseText").textContent = verseText;
            referenceText.textContent = reference;

            // Handle copy button functionality
            document.getElementById("copyButton").addEventListener("click", () => {
                const textToCopy = `${verseText} (${reference})`;
                navigator.clipboard.writeText(textToCopy).then(() => {
                    alert("Copied to clipboard!");
                }).catch((err) => {
                    console.error("Failed to copy:", err);
                });
            });
        } else {
            document.getElementById("verseText").textContent = result.message || "Error retrieving verse.";
            referenceText.textContent = "";
        }
        resultDiv.style.display = "block";
    } catch (error) {
        console.error("Error fetching API:", error);
        document.getElementById("verseText").textContent = "An error occurred. Please try again.";
        document.getElementById("result").style.display = "block";
    }
});