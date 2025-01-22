var logo = document.querySelector('.logo svg');

// List of verses to fetch
const verses = [
    { chapter: 20, verse: 46 }, // Surah Taha, verse 46
    { chapter: 40, verse: 60 }, // Surah Ghafir, verse 60
    { chapter: 3, verse: 139 }, // Surah Ali-'Imran, verse 139
    { chapter: 14, verse: 7 },  // Surah Ibrahim, verse 7
    { chapter: 17, verse: 109 }, // Surah Al-Isra, verse 109
    { chapter: 94, verse: 5 }, // Surah Ash-Sharh, verse 5
    {chapter: 94, verse: 6}, // Surah Ash-Sharh, verse 6
    {chapter: 2, verse: 152}, // Surah Al-Baqarah, verse 152
    {chapter: 9, verse: 51}, // Surah At-Tawbah, verse 51
];

// Initialize the interval variable to keep track of the loop
let drawEraseInterval;

// Function to start the loop
function startDrawingLoop() {
  // Toggle the 'active' class on and off every 2 seconds
  drawEraseInterval = setInterval(() => {
    logo.classList.toggle('active');
  }, 2000); // 2000ms (2 seconds) for each cycle (drawing and erasing)
}

// Function to stop the loop and ensure we are in the 'draw' state
function stopDrawingLoop() {
  clearInterval(drawEraseInterval);  // Stop the loop
  logo.classList.add('active');   // Ensure we end in the 'draw' state
}

// Fetch a random verse
const getRandomVerse = async () => {
    const randomIndex = Math.floor(Math.random() * verses.length); // Get random index

    console.log("Random Index Selected:", randomIndex);

    const { chapter, verse } = verses[randomIndex];

    try {
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

// Update content once the verse is fetched
const updateContent = async () => {
    const verseData = await getRandomVerse();
    if (verseData) {
        const verseTextElement = document.querySelector("#verse-text");
        verseTextElement.innerHTML = verseData.text;

        const verseDetailsElement = document.querySelector("#verse-details");
        verseDetailsElement.innerHTML = `${verseData.chapterName}: ${verseData.verseNumber}`;

        // Stop the drawing loop and ensure it ends in the 'draw' state
        stopDrawingLoop();
    } else {
        console.error("No verse data available.");
    }
};

// Start the drawing loop when the page loads
document.addEventListener("DOMContentLoaded", () => {
    startDrawingLoop();  // Start the drawing loop

    // Fetch and update content once the API call is made
    updateContent(); // This can be modified if you want to trigger at a specific time/event
});
