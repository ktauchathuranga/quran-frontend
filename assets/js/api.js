const apiServer = "http://localhost:8080";

// ngrok static URL: https://badly-evident-chamois.ngrok-free.app
// ngrok command: ngrok http --url badly-evident-chamois.ngrok-free.app 8080

// Chapter details with their names and verse counts : VERIFIED!
const chapters = {
    1: { name: "Al-Fatihah", verses: 7 },
    2: { name: "Al-Baqarah", verses: 286 },
    3: { name: "Aal-E-Imran", verses: 200 },
    4: { name: "An-Nisa", verses: 176 },
    5: { name: "Al-Ma'idah", verses: 120 },
    6: { name: "Al-An'am", verses: 165 },
    7: { name: "Al-A'raf", verses: 206 },
    8: { name: "Al-Anfal", verses: 75 },
    9: { name: "At-Tawbah", verses: 129 },
    10: { name: "Yunus", verses: 109 },
    11: { name: "Hud", verses: 123 },
    12: { name: "Yusuf", verses: 111 },
    13: { name: "Ar-Ra'd", verses: 43 },
    14: { name: "Ibrahim", verses: 52 },
    15: { name: "Al-Hijr", verses: 99 },
    16: { name: "An-Nahl", verses: 128 },
    17: { name: "Al-Isra", verses: 111 },
    18: { name: "Al-Kahf", verses: 110 },
    19: { name: "Maryam", verses: 98 },
    20: { name: "Ta-Ha", verses: 135 },
    21: { name: "Al-Anbiya", verses: 112 },
    22: { name: "Al-Hajj", verses: 78 },
    23: { name: "Al-Mu'minun", verses: 118 },
    24: { name: "An-Nur", verses: 64 },
    25: { name: "Al-Furqan", verses: 77 },
    26: { name: "Ash-Shu'ara", verses: 227 },
    27: { name: "An-Naml", verses: 93 },
    28: { name: "Al-Qasas", verses: 88 },
    29: { name: "Al-Ankabut", verses: 69 },
    30: { name: "Ar-Rum", verses: 60 },
    31: { name: "Luqman", verses: 34 },
    32: { name: "As-Sajdah", verses: 30 },
    33: { name: "Al-Ahzab", verses: 73 },
    34: { name: "Saba", verses: 54 },
    35: { name: "Fatir", verses: 45 },
    36: { name: "Ya-Sin", verses: 83 },
    37: { name: "As-Saffat", verses: 182 },
    38: { name: "Sad", verses: 88 },
    39: { name: "Az-Zumar", verses: 75 },
    40: { name: "Ghafir", verses: 85 },
    41: { name: "Fussilat", verses: 54 },
    42: { name: "Ash-Shura", verses: 53 },
    43: { name: "Az-Zukhruf", verses: 89 },
    44: { name: "Ad-Dukhan", verses: 59 },
    45: { name: "Al-Jathiya", verses: 37 },
    46: { name: "Al-Ahqaf", verses: 35 },
    47: { name: "Muhammad", verses: 38 },
    48: { name: "Al-Fath", verses: 29 },
    49: { name: "Al-Hujurat", verses: 18 },
    50: { name: "Qaf", verses: 45 },
    51: { name: "Adh-Dhariyat", verses: 60 },
    52: { name: "At-Tur", verses: 49 },
    53: { name: "An-Najm", verses: 62 },
    54: { name: "Al-Qamar", verses: 55 },
    55: { name: "Ar-Rahman", verses: 78 },
    56: { name: "Al-Waqia", verses: 96 },
    57: { name: "Al-Hadid", verses: 29 },
    58: { name: "Al-Mujadila", verses: 22 },
    59: { name: "Al-Hashr", verses: 24 },
    60: { name: "Al-Mumtahina", verses: 13 },
    61: { name: "As-Saff", verses: 14 },
    62: { name: "Al-Jumu'a", verses: 11 },
    63: { name: "Al-Munafiqun", verses: 11 },
    64: { name: "At-Taghabun", verses: 18 },
    65: { name: "At-Talaq", verses: 12 },
    66: { name: "At-Tahrim", verses: 12 },
    67: { name: "Al-Mulk", verses: 30 },
    68: { name: "Al-Qalam", verses: 52 },
    69: { name: "Al-Haqqa", verses: 52 },
    70: { name: "Al-Ma'arij", verses: 44 },
    71: { name: "Nuh", verses: 28 },
    72: { name: "Al-Jinn", verses: 28 },
    73: { name: "Al-Muzzammil", verses: 20 },
    74: { name: "Al-Muddathir", verses: 56 },
    75: { name: "Al-Qiyama", verses: 40 },
    76: { name: "Al-Insan", verses: 31 },
    77: { name: "Al-Mursalat", verses: 50 },
    78: { name: "An-Naba", verses: 40 },
    79: { name: "An-Nazi'at", verses: 46 },
    80: { name: "Abasa", verses: 42 },
    81: { name: "At-Takwir", verses: 29 },
    82: { name: "Al-Infitar", verses: 19 },
    83: { name: "Al-Mutaffifin", verses: 36 },
    84: { name: "Al-Inshiqaq", verses: 25 },
    85: { name: "Al-Burooj", verses: 22 },
    86: { name: "At-Tariq", verses: 17 },
    87: { name: "Al-A'la", verses: 19 },
    88: { name: "Al-Ghashiya", verses: 26 },
    89: { name: "Al-Fajr", verses: 30 },
    90: { name: "Al-Balad", verses: 20 },
    91: { name: "Ash-Shams", verses: 15 },
    92: { name: "Al-Lail", verses: 21 },
    93: { name: "Ad-Duhaa", verses: 11 },
    94: { name: "Ash-Sharh", verses: 8 },
    95: { name: "At-Tin", verses: 8 },
    96: { name: "Al-Alaq", verses: 19 },
    97: { name: "Al-Qadr", verses: 5 },
    98: { name: "Al-Bayyina", verses: 8 },
    99: { name: "Az-Zalzala", verses: 8 },
    100: { name: "Al-Adiyat", verses: 11 },
    101: { name: "Al-Qari'a", verses: 11 },
    102: { name: "At-Takathur", verses: 8 },
    103: { name: "Al-Asr", verses: 3 },
    104: { name: "Al-Humaza", verses: 9 },
    105: { name: "Al-Fil", verses: 5 },
    106: { name: "Quraish", verses: 4 },
    107: { name: "Al-Ma'un", verses: 7 },
    108: { name: "Al-Kawthar", verses: 3 },
    109: { name: "Al-Kafirun", verses: 6 },
    110: { name: "An-Nasr", verses: 3 },
    111: { name: "Al-Masad", verses: 5 },
    112: { name: "Al-Ikhlas", verses: 4 },
    113: { name: "Al-Falaq", verses: 5 },
    114: { name: "An-Nas", verses: 6 },
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

        // Clear existing options in the verse dropdown, but keep the placeholder
        verseDropdown.innerHTML = `<option value="" disabled selected>Choose a verse</option>`;

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
                // Create a container for each ayah
                const ayahContainer = document.createElement("div");
                ayahContainer.style.position = "relative";
                ayahContainer.style.marginBottom = "10px"; // Add some spacing between ayahs

                // Create ayah text
                const ayahText = document.createElement("p");
                ayahText.id = "ayahText";
                ayahText.textContent = verse.verse_text;

                // Create ayah reference
                const ayahReference = document.createElement("p");
                ayahReference.id = "ayahReference";
                ayahReference.style.position = "absolute";
                ayahReference.style.bottom = "-50px";
                ayahReference.style.left = "0";
                ayahReference.style.fontSize = "14px";
                ayahReference.style.color = "gray";
                ayahReference.textContent = `${chapter}:${verse.verse_number}`;

                // Append text and reference to the container
                ayahContainer.appendChild(ayahText);
                ayahContainer.appendChild(ayahReference);

                // Append the container to the verses container
                versesContainer.appendChild(ayahContainer);
            });
        } else {
            document.getElementById("surahVerses").textContent = "Error: " + result.message;
        }
        document.getElementById("surahResult").style.display = "block";
    } catch (error) {
        console.error("Error fetching API:", error);
    }
});
