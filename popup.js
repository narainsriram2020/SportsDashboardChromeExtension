document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('selectArsenal').addEventListener('click', () => selectSport('arsenal'));
    document.getElementById('selectF1').addEventListener('click', () => selectSport('f1'));

    // Arsenal section buttons
    document.getElementById('matches').addEventListener('click', showMatches);
    document.getElementById('statistics').addEventListener('click', showStatistics);
    document.getElementById('players').addEventListener('click', showPlayers);

    // F1 section buttons
    document.getElementById('races').addEventListener('click', showRaces);

    // Show selection screen initially
    showSelectionScreen();
});

const FOOTBALL_API_URL = 'https://v3.football.api-sports.io';
const F1_API_URL = 'https://v1.formula-1.api-sports.io';
const ARSENAL_TEAM_ID = 42;
const API_KEY = '31a662663930844fe119cfa4498162a3';

function showSelectionScreen() {
    document.getElementById('arsenalNav').classList.add('hidden');
    document.getElementById('f1Nav').classList.add('hidden');
    document.getElementById('contentArea').innerHTML = '';
}

function handleApiError(error, endpoint) {
    console.error(`Error fetching data from ${endpoint}:`, error);
    if (error.response) {
        console.error('Response:', error.response);
    }
    document.getElementById('contentArea').innerHTML = `Error fetching data from ${endpoint}. Please check the console for more details.`;
}

function selectSport(sport) {
    showSelectionScreen();

    // Set background color based on selected sport
    if (sport === 'arsenal') {
        document.body.style.backgroundColor = '#EF0107'; // Arsenal background color
        document.getElementById('arsenalNav').classList.remove('hidden');
        showMatches(); // Automatically load matches for Arsenal
    } else if (sport === 'f1') {
        document.body.style.backgroundColor = '#27F4D2'; // F1 background color
        document.getElementById('f1Nav').classList.remove('hidden');
        showRaces(); // Automatically load races for Formula 1
    }
}

// ARSENAL SECTION
function showMatches() {
    showLoading(true);
    fetch(`${FOOTBALL_API_URL}/fixtures?team=${ARSENAL_TEAM_ID}&next=30`, {
        headers: { 'x-apisports-key': API_KEY }
    })
        .then(response => response.json())
        .then(data => displayMatches(data.response))
        .catch(error => console.error('Error fetching matches:', error))
        .finally(() => showLoading(false));
}

function displayMatches(matches) {
    const content = document.getElementById('contentArea');
    if (matches.length > 0) {
        content.innerHTML = matches.map(match => `
            <div class="match">
                <h3>${match.teams.home.name} vs ${match.teams.away.name}</h3>
                <p>${new Date(match.fixture.date).toLocaleString()} - ${match.fixture.venue.name}</p>
            </div>
        `).join('');
    } else {
        content.innerHTML = 'No matches available.';
    }
}

function showStatistics() {
    showLoading(true);
    fetch(`${FOOTBALL_API_URL}/teams/statistics?team=${ARSENAL_TEAM_ID}&league=39&season=2023`, {
        headers: { 'x-apisports-key': API_KEY }
    })
        .then(response => response.json())
        .then(data => displayStatistics(data.response))
        .catch(error => {
            console.error('Error fetching statistics:', error);
            document.getElementById('contentArea').innerHTML = 'Error fetching statistics. Please try again.';
        })
        .finally(() => showLoading(false));
}

function displayStatistics(statistics) {
    const content = document.getElementById('contentArea');
    if (statistics) {
        content.innerHTML = `
            <h3>Arsenal Statistics - 2023/2024 Season</h3>
            <p>Matches Played: ${statistics.fixtures.played.total}</p>
            <p>Wins: ${statistics.fixtures.wins.total}</p>
            <p>Draws: ${statistics.fixtures.draws.total}</p>
            <p>Losses: ${statistics.fixtures.loses.total}</p>
            <p>Goals For: ${statistics.goals.for.total.total}</p>
            <p>Goals Against: ${statistics.goals.against.total.total}</p>
            <p>Clean Sheets: ${statistics.clean_sheet.total}</p>
            <p>Failed to Score: ${statistics.failed_to_score.total}</p>
        `;
    } else {
        content.innerHTML = 'No statistics available for the current season.';
    }
}

// Update the showPlayers function
function showPlayers() {
    showLoading(true);
    fetch(`${FOOTBALL_API_URL}/players/squads?team=${ARSENAL_TEAM_ID}`, {
        headers: { 'x-apisports-key': API_KEY }
    })
        .then(response => response.json())
        .then(data => displayPlayers(data.response[0].players))
        .catch(error => console.error('Error fetching players:', error))
        .finally(() => showLoading(false));
}

function displayPlayers(players) {
    const content = document.getElementById('contentArea');
    if (players && players.length > 0) {
        // Sort players by their position (Goalkeepers first, then Defenders, Midfielders, and Attackers)
        const positionOrder = { 'Goalkeeper': 1, 'Defender': 2, 'Midfielder': 3, 'Attacker': 4 };
        players.sort((a, b) => positionOrder[a.position] - positionOrder[b.position] || a.number - b.number);

        content.innerHTML = `
            <h3>Arsenal Squad - 2024 Season</h3>
            <div class="team-sheet">
                ${players.map(player => `
                    <div class="player-card">
                        <span class="player-number">${player.number || '-'}</span>
                        <span class="player-name">${player.name}</span>
                        <span class="player-position">${player.position}</span>
                    </div>
                `).join('')}
            </div>
        `;
    } else {
        content.innerHTML = 'No players available for the 2024 season.';
    }
}

// F1 SECTION
function showRaces() {
    showLoading(true);
    fetch(`${F1_API_URL}/races?season=2024`, {
        headers: { 'x-apisports-key': API_KEY }
    })
        .then(response => response.json())
        .then(data => displayRaces(data.response))
        .catch(error => console.error('Error fetching races:', error))
        .finally(() => showLoading(false));
}

function displayRaces(races) {
    const content = document.getElementById('contentArea');
    if (races && races.length > 0) {
        // Use a Set to store unique race names
        let uniqueRaces = new Set();
        races.forEach(race => uniqueRaces.add(race.competition.name));

        content.innerHTML = `
            ${Array.from(uniqueRaces).map(raceName => {
            // Find the first race object that matches the race name
            const race = races.find(r => r.competition.name === raceName);
            if (!race) return ''; // If no race found, return empty string

            return `
                    <div class="race">
                        <h4>${race.competition.name}</h4>
                        <p>Date: ${new Date(race.date).toLocaleDateString()}</p>
                        <p>Circuit: ${race.circuit.name}</p>
                        <p>Country: ${race.competition.location.country}</p>
                        ${race.circuit.image ? `<img src="${race.circuit.image}" class="circuit-image" alt="${race.circuit.name}">` : ''}
                    </div>
                `;
        }).join('')}
        `;
    } else {
        content.innerHTML = 'No F1 races available.';
    }
}

function showLoading(isLoading) {
    const spinner = document.getElementById('loadingSpinner');
    const content = document.getElementById('contentArea');
    if (spinner && content) {
        spinner.style.display = isLoading ? 'block' : 'none';
        content.style.display = isLoading ? 'none' : 'block';
    }
}
