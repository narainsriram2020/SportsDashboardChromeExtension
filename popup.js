document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('selectArsenal').addEventListener('click', () => selectSport('arsenal'));
    document.getElementById('selectF1').addEventListener('click', () => selectSport('f1'));
    document.getElementById('selectThunder').addEventListener('click', () => selectSport('thunder'));
    document.getElementById('selectGiants').addEventListener('click', () => selectSport('giants'));

    // Arsenal section buttons
    document.getElementById('matches').addEventListener('click', showMatches);
    document.getElementById('statistics').addEventListener('click', showStatistics);
    document.getElementById('players').addEventListener('click', showPlayers);

    // F1 section buttons
    document.getElementById('races').addEventListener('click', showRaces);

    // Thunder section buttons (NBA)
    document.getElementById('thunderMatches').addEventListener('click', showThunderMatches);
    document.getElementById('thunderStatistics').addEventListener('click', showThunderStatistics);
    document.getElementById('thunderPlayers').addEventListener('click', showThunderPlayers);

    // Giants section buttons (NFL)
    document.getElementById('giantsMatches').addEventListener('click', showGiantsMatches);
    document.getElementById('giantsStatistics').addEventListener('click', showGiantsStatistics);
    document.getElementById('giantsPlayers').addEventListener('click', showGiantsPlayers);

    // Show selection screen initially
    showSelectionScreen();
});

const FOOTBALL_API_URL = 'https://v3.football.api-sports.io';
const BASKETBALL_API_URL = 'https://api-nba-v1.p.rapidapi.com';
const NFL_API_URL = 'https://api-nfl-v1.p.rapidapi.com';
const F1_API_URL = 'https://v1.formula-1.api-sports.io';
const ARSENAL_TEAM_ID = 42;
const THUNDER_TEAM_ID = 25;
const GIANTS_TEAM_ID = 4;
const API_KEY = '8390bb952d467bb45938caf5fb79cea7'; // Store securely

function showSelectionScreen() {
    document.getElementById('arsenalNav').classList.add('hidden');
    document.getElementById('f1Nav').classList.add('hidden');
    document.getElementById('thunderNav').classList.add('hidden');
    document.getElementById('giantsNav').classList.add('hidden');
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
    } else if (sport === 'thunder') {
        document.body.style.backgroundColor = '#007AC1'; // Thunder background color
        document.getElementById('thunderNav').classList.remove('hidden');
        showThunderMatches(); // Automatically load matches for Thunder
    } else if (sport === 'giants') {
        document.body.style.backgroundColor = '#0B2265'; // Giants background color
        document.getElementById('giantsNav').classList.remove('hidden');
        showGiantsMatches(); // Automatically load matches for Giants
    }
}

// NBA (Thunder) Section
function showThunderMatches() {
    showLoading(true);
    const currentDate = new Date().toISOString().split('T')[0];

    chrome.runtime.sendMessage({
        action: "fetchThunderMatches",
        url: `${BASKETBALL_API_URL}/games?team=${THUNDER_TEAM_ID}&season=2023-2024&date=${currentDate}`,
        apiKey: API_KEY
    }, response => {
        if (response.error) {
            console.error('Error:', response.error);
            handleApiError(new Error(response.error), 'Thunder matches');
        } else {
            console.log('Received data:', response.data);
            displayThunderMatches(response.data.response);
        }
        showLoading(false);
    });
}

function displayThunderMatches(matches) {
    const content = document.getElementById('contentArea');
    if (matches && matches.length > 0) {
        content.innerHTML = matches.map(match => `
            <div class="match">
                <h3>${new Date(match.date).toLocaleString()} - ${match.teams.home.name} vs ${match.teams.away.name}</h3>
                <p>${match.arena.name} - ${match.arena.city}</p>
            </div>
        `).join('');
    } else {
        content.innerHTML = 'No Thunder matches available for today.';
    }
}

function fetchData(endpoint, params) {
    showLoading(true);
    const url = `${BASKETBALL_API_URL}/${endpoint}?${new URLSearchParams(params)}`;

    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
            action: "fetchData",
            url: url,
            apiKey: API_KEY
        }, response => {
            if (response.error) {
                console.error('Error:', response.error);
                handleApiError(new Error(response.error), endpoint);
                reject(response.error);
            } else {
                console.log('Received data:', response.data);
                resolve(response.data);
            }
            showLoading(false);
        });
    });
}

function showThunderStatistics() {
    fetchData('teams/statistics', { id: THUNDER_TEAM_ID, season: '2023-2024' })
        .then(data => displayThunderStatistics(data.response[0]))
        .catch(error => console.error('Error fetching Thunder statistics:', error));
}

function displayThunderStatistics(statistics) {
    const content = document.getElementById('contentArea');
    if (statistics) {
        content.innerHTML = `
            <h3>Thunder Statistics (2023-2024 Season)</h3>
            <p>Games: ${statistics.games}</p>
            <p>Points Per Game: ${statistics.points.average.toFixed(1)}</p>
            <p>Rebounds Per Game: ${statistics.totReb.average.toFixed(1)}</p>
            <p>Assists Per Game: ${statistics.assists.average.toFixed(1)}</p>
            <p>Field Goal Percentage: ${(statistics.fgp.average * 100).toFixed(1)}%</p>
            <p>Three-Point Percentage: ${(statistics.tpp.average * 100).toFixed(1)}%</p>
        `;
    } else {
        content.innerHTML = 'No Thunder statistics available.';
    }
}

function showThunderPlayers() {
    showLoading(true);
    fetch(`${BASKETBALL_API_URL}/players?team=${THUNDER_TEAM_ID}&season=2023-2024`, {
        headers: {
            'x-apisports-key': API_KEY
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => displayThunderPlayers(data.response))
        .catch(error => handleApiError(error, 'Thunder players'))
        .finally(() => showLoading(false));
}

function displayThunderPlayers(players) {
    const content = document.getElementById('contentArea');
    if (players && players.length > 0) {
        content.innerHTML = `
            <h3>Thunder Players (2023-2024 Season)</h3>
            <div class="player-list">
                ${players.map(player => `
                    <div class="player">
                        <span>${player.firstname} ${player.lastname}</span>
                        <span>Position: ${player.position}</span>
                        <span>Jersey: ${player.leagues.standard.jersey}</span>
                    </div>
                `).join('')}
            </div>
        `;
    } else {
        content.innerHTML = 'No Thunder players available.';
    }
}

// NFL (Giants) Section
function showGiantsMatches() {
    showLoading(true);
    const currentYear = new Date().getFullYear();
    chrome.runtime.sendMessage({
        action: "fetchGiantsMatches",
        url: `${NFL_API_URL}/games?team=${GIANTS_TEAM_ID}&season=${currentYear}`,
        apiKey: API_KEY
    }, response => {
        if (response.error) {
            console.error('Error fetching Giants matches:', response.error);
            handleApiError(new Error(response.error), 'Giants matches');
        } else {
            console.log('Received Giants matches data:', response.data);
            displayGiantsMatches(response.data.response);
        }
        showLoading(false);
    });
}

function displayGiantsMatches(matches) {
    const content = document.getElementById('contentArea');
    if (matches && matches.length > 0) {
        content.innerHTML = matches.map(match => `
            <div class="match">
                <h3>${new Date(match.game.date.start).toLocaleString()} - ${match.teams.home.name} vs ${match.teams.away.name}</h3>
                <p>${match.game.venue.name} - ${match.game.venue.city}</p>
            </div>
        `).join('');
    } else {
        content.innerHTML = 'No Giants matches available for the current season.';
    }
}

function showGiantsStatistics() {
    showLoading(true);
    const currentYear = new Date().getFullYear();
    fetch(`${NFL_API_URL}/teams/statistics?id=${GIANTS_TEAM_ID}&season=${currentYear}`, {
        headers: {
            'x-apisports-key': API_KEY
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => displayGiantsStatistics(data.response))
        .catch(error => handleApiError(error, 'Giants statistics'))
        .finally(() => showLoading(false));
}

function displayGiantsStatistics(statistics) {
    const content = document.getElementById('contentArea');
    if (statistics && statistics.length > 0) {
        const stats = statistics[0];
        content.innerHTML = `
            <h3>Giants Statistics (${new Date().getFullYear()} Season)</h3>
            <p>Games Played: ${stats.games.played}</p>
            <p>Points For: ${stats.points.for.total}</p>
            <p>Points Against: ${stats.points.against.total}</p>
            <p>Total Yards: ${stats.yards.total}</p>
            <p>Pass Yards: ${stats.yards.pass.total}</p>
            <p>Rush Yards: ${stats.yards.rush.total}</p>
        `;
    } else {
        content.innerHTML = 'No Giants statistics available for the current season.';
    }
}

function showGiantsPlayers() {
    showLoading(true);
    const currentYear = new Date().getFullYear();
    fetch(`${NFL_API_URL}/players?team=${GIANTS_TEAM_ID}&season=${currentYear}`, {
        headers: {
            'x-apisports-key': API_KEY
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => displayGiantsPlayers(data.response))
        .catch(error => handleApiError(error, 'Giants players'))
        .finally(() => showLoading(false));
}

function displayGiantsPlayers(players) {
    const content = document.getElementById('contentArea');
    if (players && players.length > 0) {
        content.innerHTML = `
            <h3>Giants Players (${new Date().getFullYear()} Season)</h3>
            <div class="player-list">
                ${players.map(player => `
                    <div class="player">
                        <span>${player.name}</span>
                        <span>Position: ${player.position}</span>
                        <span>Number: ${player.number || 'N/A'}</span>
                    </div>
                `).join('')}
            </div>
        `;
    } else {
        content.innerHTML = 'No Giants players available for the current season.';
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

function showLoading(isLoading) {
    const spinner = document.getElementById('loadingSpinner');
    const content = document.getElementById('contentArea');
    if (spinner && content) {
        spinner.style.display = isLoading ? 'block' : 'none';
        content.style.display = isLoading ? 'none' : 'block';
    }
}
