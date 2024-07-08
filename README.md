# Sports Dashboard Chrome Extension

Welcome to the Sports Dashboard Chrome Extension! This extension provides the latest updates for Arsenal and Formula 1. Below you'll find instructions on how to install, use, and configure the extension.

## Table of Contents

1. [Installation](#installation)
2. [Usage](#usage)
3. [Features](#features)
4. [Configuration](#configuration)

## Installation

To install the Sports Dashboard Chrome Extension, follow these steps:

1. **Clone or download the repository:**
    ```sh
    git clone https://github.com/your-username/sports-dashboard.git
    ```
2. **Open Chrome and navigate to the Extensions page:**
    - Go to `chrome://extensions/` or click on the menu (three dots in the top-right corner) -> More tools -> Extensions.
3. **Enable Developer Mode:**
    - Toggle the switch in the top-right corner to enable Developer Mode.
4. **Load the extension:**
    - Click on the "Load unpacked" button and select the directory where you cloned/downloaded the repository.

## Usage

1. **Open the extension:**
    - Click on the Sports Dashboard icon in the Chrome toolbar to open the popup.
2. **Select a sport:**
    - Click on the "Arsenal" or "Formula 1" button to view the respective sports data.
3. **Navigate through sections:**
    - Use the navigation buttons to view matches, statistics, players (for Arsenal), and races (for Formula 1).

## Features

- **Arsenal:**
  - View upcoming matches.
  - See detailed team statistics for the current season.
  - Explore the team roster and player details.

- **Formula 1:**
  - View the race schedule for the current season.
  - Get details about each race, including date, circuit, and location.

## Configuration

The extension uses the API-Football and API-Formula 1 services to fetch data. Make sure you have valid API keys and update the following variables in `popup.js`:

```javascript
const FOOTBALL_API_URL = 'https://v3.football.api-sports.io';
const F1_API_URL = 'https://v1.formula-1.api-sports.io';
const ARSENAL_TEAM_ID = 42;
const API_KEY = 'your_api_key_here';
