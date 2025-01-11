// const apiServer = "http://localhost:8080";

// List of verses to fetch
const verses = [
    { chapter: 20, verse: 46 }, // Surah Taha, verse 46
    { chapter: 40, verse: 60 }, // Surah Ghafir, verse 60
    { chapter: 3, verse: 139 }, // Surah Ali-'Imran, verse 139
    { chapter: 14, verse: 7 },  // Surah Ibrahim, verse 7
];

// Fetch a random verse
const getRandomVerse = async () => {
    const randomIndex = Math.floor(Math.random() * verses.length); // Get random index

    // Debug: log the random index to ensure randomness
    console.log("Random Index Selected:", randomIndex);

    const { chapter, verse } = verses[randomIndex];

    try {
        // Remove the Cache-Control header for simplicity (to avoid CORS issue)
        const response = await fetch(`${apiServer}/`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                action: "getVerseDetails",
                chapter,
                verse,
                edition_id: 20,
            }),
        });

        const result = await response.json();

        // Debug: log the result to ensure different verses are being fetched
        console.log("Fetched Verse:", result);

        if (result.status === "success") {
            return {
                text: result.data.verse_text,
                chapterName: result.data.chapter_name,
                verseNumber: result.data.verse_number,
            };
        } else {
            console.error("Failed to fetch verse:", result);
        }
    } catch (error) {
        console.error("Error fetching verse:", error);
    }
    return null;
};

// Update the paragraph with a random verse
const updateContent = async () => {
    const verseData = await getRandomVerse();
    if (verseData) {
        // Update the 'verse-text' element
        const verseTextElement = document.querySelector("#verse-text");
        verseTextElement.innerHTML = verseData.text;

        // Update the 'verse-details' element
        const verseDetailsElement = document.querySelector("#verse-details");
        verseDetailsElement.innerHTML = `${verseData.chapterName}: ${verseData.verseNumber}`;
    } else {
        console.error("No verse data available.");
    }
};

// Call the function to update content when the page loads
document.addEventListener("DOMContentLoaded", updateContent);
