const apiServer = "http://localhost:8080";

// Chapter details with their names and verse counts
const chapters = {
    1: { name: "Al-Fatihah", verses: 7 },
    2: { name: "Al-Baqarah", verses: 286 },
    3: { name: "Aal-E-Imran", verses: 200 },
    4: { name: "An-Nisa", verses: 176 },
    // Add more chapters as needed...
};

// Populate chapter dropdowns
const populateChapterDropdown = (dropdownId) => {
    const dropdown = document.getElementById(dropdownId);
    for (const chapterNumber in chapters) {
        const option = document.createElement("option");
        option.value = chapterNumber;
        option.textContent = `${chapterNumber}. ${chapters[chapterNumber].name}`;
        dropdown.appendChild(option);
    }
};
populateChapterDropdown("ayahChapter");
populateChapterDropdown("surahChapter");

// Populate the "Ayah Verse" dropdown based on the selected chapter
const populateVerseDropdown = () => {
    const chapterSelect = document.getElementById("ayahChapter");
    const verseDropdown = document.getElementById("ayahVerse");

    chapterSelect.addEventListener("change", () => {
        const selectedChapter = chapterSelect.value;

        // Clear existing options in the verse dropdown
        verseDropdown.innerHTML = "";

        if (selectedChapter) {
            const verseCount = chapters[selectedChapter].verses;

            for (let i = 1; i <= verseCount; i++) {
                const option = document.createElement("option");
                option.value = i;
                option.textContent = i;
                verseDropdown.appendChild(option);
            }
        }
    });

    // Trigger initial population if a default chapter is preselected
    chapterSelect.dispatchEvent(new Event("change"));
};
populateVerseDropdown();

// Populate editions dropdown
const editionSelectIds = ["ayahEdition", "surahEdition"];
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
            editionSelectIds.forEach((selectId) => {
                const dropdown = document.getElementById(selectId);
                result.data.forEach((edition) => {
                    const option = document.createElement("option");
                    option.value = edition.id;
                    option.textContent = edition.englishName;
                    dropdown.appendChild(option);
                });
            });
        } else {
            console.error("Failed to load editions:", result.message);
        }
    } catch (error) {
        console.error("Error fetching editions:", error);
    }
};
populateEditions();

// Handle Ayah form submission
document.getElementById("ayahForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const chapter = document.getElementById("ayahChapter").value;
    const verse = document.getElementById("ayahVerse").value;
    const edition = document.getElementById("ayahEdition").value || 20;

    const payload = {
        action: "getVerseDetails",
        chapter: parseInt(chapter),
        verse: parseInt(verse),
        edition_id: parseInt(edition),
    };

    try {
        const response = await fetch(apiServer, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const result = await response.json();
        if (result.status === "success") {
            const verseText = result.data.verse_text;
            const reference = `${chapter}:${verse}`;
            document.getElementById("ayahText").textContent = verseText;
            document.getElementById("ayahReference").textContent = reference;

            document.getElementById("ayahCopyButton").onclick = () => {
                const textToCopy = `${verseText} (${reference})`;
                navigator.clipboard.writeText(textToCopy).then(() => {
                    alert("Copied to clipboard!");
                });
            };
        } else {
            document.getElementById("ayahText").textContent = "Error: " + result.message;
        }
        document.getElementById("ayahResult").style.display = "block";
    } catch (error) {
        console.error("Error fetching API:", error);
    }
});

// Handle Surah form submission
document.getElementById("surahForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const chapter = document.getElementById("surahChapter").value;
    const edition = document.getElementById("surahEdition").value || 20;

    const payload = {
        action: "getChapterDetails",
        chapter: parseInt(chapter),
        edition_id: parseInt(edition),
    };

    try {
        const response = await fetch(apiServer, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const result = await response.json();
        if (result.status === "success") {
            const versesContainer = document.getElementById("surahVerses");
            versesContainer.innerHTML = ""; // Clear previous results

            result.data.forEach((verse) => {
                const verseElement = document.createElement("p");
                verseElement.textContent = `${verse.verse_text}\n${chapter}:${verse.verse_number}`;
                versesContainer.appendChild(verseElement);
            });
        } else {
            document.getElementById("surahVerses").textContent = "Error: " + result.message;
        }
        document.getElementById("surahResult").style.display = "block";
    } catch (error) {
        console.error("Error fetching API:", error);
    }
});
