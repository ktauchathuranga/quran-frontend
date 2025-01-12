// API endpoint
// const apiServer = 'http://localhost:8080';

// Mapping for each feeling and their corresponding verses
const versesMap = {
    happy: ['14:7', '16:8'],
    grateful: ['2:152', '76:9-10'],
    anger: ['42:37', '3:134'],
    sadness: ['9:51', '94:5-6'],
    loneliness: ['2:186', '93:3-4'], // Notice the range
    anxiousness: ['29:69', '13:28']
};

// Function to fetch and display a verse
function getVerse(feeling) {
    const verses = versesMap[feeling];
    
    if (!verses || verses.length === 0) {
        alert('No verses available for this feeling.');
        return;
    }

    // Retrieve the last shown verse index from localStorage
    const lastShownVerseIndex = localStorage.getItem('lastShownVerseIndex');

    // Filter out the last shown verse to prevent repetition
    let availableVerses = verses.filter((verse, index) => index != lastShownVerseIndex);
    
    // If all verses have been shown, reset and allow all verses
    if (availableVerses.length === 0) {
        availableVerses = [...verses]; // Allow all verses
        localStorage.removeItem('lastShownVerseIndex');
    }

    // Randomly select a verse (or range of verses)
    const randomIndex = Math.floor(Math.random() * availableVerses.length);
    const randomVerse = availableVerses[randomIndex];

    // Store the selected random index in localStorage to avoid repetition
    localStorage.setItem('lastShownVerseIndex', verses.indexOf(randomVerse));

    // If the verse is a range (e.g., 93:3-4), handle both verses in order
    if (randomVerse.includes('-')) {
        const [chapter, range] = randomVerse.split(':');
        const [start, end] = range.split('-').map(num => parseInt(num, 10));
        fetchRangeVerses(chapter, start, end);
    } else {
        // Fetch and display a single verse
        fetchVerse(randomVerse);
    }
}

// Function to fetch multiple verses for a range in order
async function fetchRangeVerses(chapter, startVerse, endVerse) {
    const verses = [];

    // Loop through the verse range and fetch each verse in order
    for (let verse = startVerse; verse <= endVerse; verse++) {
        const verseData = await fetchVerseData(chapter, verse);
        verses.push(verseData);
    }

    // Once all verses are fetched, display them in order
    displayVerses(verses);
}

// Function to fetch a single verse
function fetchVerse(verse) {
    const [chapter, verseNumber] = verse.split(':');
    fetchVerseData(chapter, parseInt(verseNumber, 10))
        .then(verseData => {
            // Display the single verse after fetching
            displayVerses([verseData]);
        })
        .catch(error => {
            console.error('Error fetching verse:', error);
        });
}

// Function to fetch verse data for a single verse
function fetchVerseData(chapter, verse) {
    return new Promise((resolve, reject) => {
        const requestPayload = {
            action: 'getVerseDetails',
            chapter: chapter,
            verse: verse,
            edition_id: 20
        };

        fetch(apiServer, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestPayload)
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                resolve(data.data);
            } else {
                reject('Verse not found.');
            }
        })
        .catch(error => {
            console.error('Error fetching verse:', error);
            reject('An error occurred while fetching the verse.');
        });
    });
}

// Function to display multiple verses
function displayVerses(verses) {
    const versesContainer = document.getElementById('ayahResultMood');
    versesContainer.style.display = 'block';
    versesContainer.innerHTML = ''; // Clear previous results

    verses.forEach(verse => {
        const ayahContainer = document.createElement('div');
        ayahContainer.style.position = 'relative';
        ayahContainer.style.marginBottom = '10px';

        const ayahText = document.createElement('p');
        ayahText.textContent = verse.verse_text;

        const ayahReference = document.createElement('p');
        ayahReference.style.position = 'absolute';
        ayahReference.style.bottom = '55px';
        ayahReference.style.left = '0';
        ayahReference.style.fontSize = '14px';
        ayahReference.style.color = 'gray';
        ayahReference.textContent = `${verse.chapter_name} ${verse.verse_number}`;

        ayahContainer.appendChild(ayahText);
        ayahContainer.appendChild(ayahReference);
        versesContainer.appendChild(ayahContainer);
    });
}
