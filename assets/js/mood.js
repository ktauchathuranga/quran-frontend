// API endpoint
// const apiServer = 'http://localhost:8080';

// Mapping for each feeling and their corresponding verses
const versesMap = {
    happy: [
        '14:7', '16:8', '10:58', '55:13', '64:11', '28:73', '39:69', '41:30', '46:13', '76:11', 
        '2:112', '3:170', '5:119', '36:58', '37:60', '43:70', '45:30', '48:29', '89:27-30', '95:6'
    ],
    grateful: [
        '2:152', '76:9-10', '14:7', '16:114', '31:12', '34:13', '39:66', '7:144', '10:22-23', '2:267',
        '39:7', '3:144', '16:18', '2:245', '2:172', '5:89', '16:14', '22:37', '27:19', '54:35'
    ],
    anger: [
        '42:37', '3:134', '16:126', '41:34', '7:199', '23:96', '5:8', '4:148', '42:40', '28:54',
        '2:109', '49:12', '25:63', '31:17', '45:14', '16:90', '5:101', '4:36', '6:108', '16:125'
    ],
    sadness: [
        '9:51', '94:5-6', '2:286', '3:139', '12:86', '28:7', '93:4-5', '18:67', '57:22-23', '2:155-157',
        '11:49', '42:28', '13:28', '28:13', '33:6', '39:53', '3:173', '2:214', '16:41', '2:286'
    ],
    loneliness: [
        '2:186', '93:3-4', '9:40', '20:46', '57:4', '6:59', '50:16', '4:75', '16:97', '3:173',
        '2:257', '4:69', '28:56', '48:4', '3:139', '33:3', '65:2-3', '8:62', '11:90', '25:74'
    ],
    anxiousness: [
        '29:69', '13:28', '2:286', '3:139', '20:46', '39:53', '65:2-3', '11:90', '4:83', '33:3',
        '2:153', '9:51', '3:173', '8:62', '41:30', '48:4', '50:16', '57:4', '16:97', '25:74'
    ]
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
    versesContainer.style.display = 'block';  // Make the container visible
    versesContainer.innerHTML = ''; // Clear previous results

    const ayahContainerMood = document.getElementById('ayahContainerMood'); 
    ayahContainerMood.style.display = 'block'; // Ensure the container is visible

    verses.forEach(verse => {
        const ayahContainer = document.createElement('div');
        ayahContainer.style.position = 'relative';
        ayahContainer.style.marginBottom = '20px'; // Increased from 10px to 20px

        const ayahText = document.createElement('p');
        ayahText.textContent = verse.verse_text;
        ayahText.style.marginBottom = '30px'; // Add margin to the verse text

        const ayahReference = document.createElement('p');
        ayahReference.style.position = 'absolute';
        ayahReference.style.bottom = '-75px'; // Increased from -55px to -75px
        ayahReference.style.left = '0';
        ayahReference.style.fontSize = '14px';
        ayahReference.style.color = 'gray';
        ayahReference.textContent = `${verse.chapter_name} ${verse.verse_number}`;

        ayahContainer.appendChild(ayahText);
        ayahContainer.appendChild(ayahReference);
        versesContainer.appendChild(ayahContainer);
    });

    versesContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
