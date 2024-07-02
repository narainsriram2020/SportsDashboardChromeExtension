const FOOTBALL_API_URL = 'https://v3.football.api-sports.io';
const ARSENAL_TEAM_ID = 42;
const API_KEY = 'a57cfda99c81c3aa386f812084e869ec'; // Store securely

// Initialize default settings when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({
        apiKey: API_KEY,
        updateInterval: 15 // Update interval in minutes
    });

    // Initial data fetch
    updateData();
});

// Set up alarm for periodic updates
chrome.alarms.create('updateData', { periodInMinutes: 15 });

// Listen for alarm
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'updateData') {
        updateData();
    }
});

// Function to update data
async function updateData() {
    try {
        const { apiKey } = await chrome.storage.sync.get(['apiKey']);
        if (!apiKey) {
            console.log('API key not set');
            return;
        }

        const [matches, statistics, players] = await Promise.all([
            fetchArsenalMatches(apiKey),
            fetchArsenalStatistics(apiKey),
            fetchArsenalPlayers(apiKey)
        ]);

        await chrome.storage.local.set({
            arsenalMatches: matches,
            arsenalStatistics: statistics,
            arsenalPlayers: players
        });
        console.log(`Data updated for Arsenal`);
    } catch (error) {
        console.error('Error updating data:', error);
    }
}

async function fetchArsenalMatches(apiKey) {
    const headers = {
        'x-apisports-key': apiKey
    };

    const response = await fetch(`${FOOTBALL_API_URL}/fixtures?team=${ARSENAL_TEAM_ID}&next=5`, { headers });
    const data = await response.json();

    return data.response;
}

async function fetchArsenalStatistics(apiKey) {
    const headers = {
        'x-apisports-key': apiKey
    };

    const response = await fetch(`${FOOTBALL_API_URL}/teams/statistics?team=${ARSENAL_TEAM_ID}&season=2023`, { headers });
    const data = await response.json();

    return data.response;
}

async function fetchArsenalPlayers(apiKey) {
    const headers = {
        'x-apisports-key': apiKey
    };

    const response = await fetch(`${FOOTBALL_API_URL}/players?team=${ARSENAL_TEAM_ID}&season=2023`, { headers });
    const data = await response.json();

    return data.response;
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'updateData') {
        updateData().then(() => sendResponse({ status: 'Data updated' }));
        return true; // Indicates that the response is sent asynchronously
    }
});
