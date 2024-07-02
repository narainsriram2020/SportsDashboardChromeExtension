document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('selectArsenal').addEventListener('click', () => selectSport('arsenal'));
    document.getElementById('selectF1').addEventListener('click', () => selectSport('f1'));

    // Arsenal section buttons
    document.getElementById('matches').addEventListener('click', showMatches);
    document.getElementById('statistics').addEventListener('click', showStatistics);
    document.getElementById('players').addEventListener('click', showPlayers);

    // F1 section buttons
    document.getElementById('races').addEventListener('click', showRaces);
    document.getElementById('standings').addEventListener('click', showStandings);
    document.getElementById('drivers').addEventListener('click', showDrivers);

    // Show selection screen initially
    showSelectionScreen();
});

const FOOTBALL_API_URL = 'https://v3.football.api-sports.io';
const F1_API_URL = 'https://v1.formula-1.api-sports.io';
const ARSENAL_TEAM_ID = 42;
const API_KEY = 'a57cfda99c81c3aa386f812084e869ec'; // Store securely

function showSelectionScreen() {
    document.getElementById('arsenalNav').classList.add('hidden');
    document.getElementById('f1Nav').classList.add('hidden');
    document.getElementById('contentArea').innerHTML = '';
}

function selectSport(sport) {
    showSelectionScreen();
    if (sport === 'arsenal') {
        document.getElementById('arsenalNav').classList.remove('hidden');
        showMatches(); // Automatically load matches for Arsenal
    } else if (sport === 'f1') {
        document.getElementById('f1Nav').classList.remove('hidden');
        showRaces(); // Automatically load races for Formula 1
    }
}

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
    fetch(`${FOOTBALL_API_URL}/teams/statistics?team=${ARSENAL_TEAM_ID}&season=2024`, {
        headers: { 'x-apisports-key': API_KEY }
    })
        .then(response => response.json())
        .then(data => displayStatistics(data.response))
        .catch(error => console.error('Error fetching statistics:', error))
        .finally(() => showLoading(false));
}

function displayStatistics(statistics) {
    const content = document.getElementById('contentArea');
    if (statistics) {
        content.innerHTML = `
            <h3>Statistics - 2024 Season</h3>
            <p>Wins: ${statistics.statistics[0].league.wins}</p>
            <p>Draws: ${statistics.statistics[0].league.draws}</p>
            <p>Losses: ${statistics.statistics[0].league.losses}</p>
        `;
    } else {
        content.innerHTML = 'No statistics available for the 2024 season.';
    }
}


function showPlayers() {
    showLoading(true);
    fetch(`${FOOTBALL_API_URL}/players?team=${ARSENAL_TEAM_ID}&season=2024`, {
        headers: { 'x-apisports-key': API_KEY }
    })
        .then(response => response.json())
        .then(data => displayPlayers(data.response))
        .catch(error => console.error('Error fetching players:', error))
        .finally(() => showLoading(false));
}

function displayPlayers(players) {
    const content = document.getElementById('contentArea');
    if (players.length > 0) {
        // Sort players by position (assuming 'games.position' is a valid sorting criteria)
        players.sort((a, b) => a.statistics[0].games.position - b.statistics[0].games.position);

        content.innerHTML = `
            <h3>Players - 2024 Season</h3>
            ${players.map(player => `
                <div class="player">
                    <p>Name: ${player.player.name}</p>
                    <p>Position: ${player.statistics[0].games.position}</p>
                    <p>Age: ${player.player.age}</p>
                    <img src="${player.player.photo}" class="player-image" alt="${player.player.name}">
                </div>
            `).join('')}
        `;
    } else {
        content.innerHTML = 'No players available for the 2024 season.';
    }
}


function showRaces() {
    showLoading(true);
    fetch(`${F1_API_URL}/races?season=2023`, {
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
            <h3>F1 Races</h3>
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

function showStandings() {
    showLoading(true);
    fetch(`${F1_API_URL}/standings?season=2023`, {
        headers: { 'x-apisports-key': API_KEY }
    })
        .then(response => response.json())
        .then(data => displayStandings(data.response))
        .catch(error => console.error('Error fetching standings:', error))
        .finally(() => showLoading(false));
}

function showDrivers() {
    showLoading(true);
    fetch(`${F1_API_URL}/drivers?season=2023`, {
        headers: { 'x-apisports-key': API_KEY }
    })
        .then(response => response.json())
        .then(data => displayDrivers(data.response))
        .catch(error => console.error('Error fetching drivers:', error))
        .finally(() => showLoading(false));
}

function displayStandings(standings) {
    const content = document.getElementById('contentArea');
    if (standings && standings.length > 0) {
        content.innerHTML = `
            <h3>Standings - 2023 Season</h3>
            ${standings.map(driver => `
                <div class="standing">
                    <p>${driver.position}. ${driver.driver.name} - ${driver.points} points</p>
                </div>
            `).join('')}
        `;
    } else {
        content.innerHTML = 'Standings data is not available for the 2023 season.';
    }
}

function displayDrivers(drivers) {
    const content = document.getElementById('contentArea');
    if (drivers && drivers.length > 0) {
        content.innerHTML = `
            <h3>Drivers - 2023 Season</h3>
            ${drivers.map(driver => `
                <div class="driver">
                    <p>${driver.driver.name}</p>
                    <img src="${driver.driver.image}" class="driver-image" alt="${driver.driver.name}">
                    <p>Nationality: ${driver.driver.nationality}</p>
                    <p>Date of Birth: ${driver.driver.dateOfBirth}</p>
                </div>
            `).join('')}
        `;
    } else {
        content.innerHTML = 'Driver data is not available for the 2023 season.';
    }
}


function showLoading(isLoading) {
    document.getElementById('loadingSpinner').classList.toggle('hidden', !isLoading);
    document.getElementById('contentArea').classList.toggle('hidden', isLoading);
}
