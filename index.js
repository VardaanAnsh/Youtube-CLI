import inquirer from 'inquirer';
import open from 'open';
import fs from 'fs';
import chalk from 'chalk';
import figlet from 'figlet';

const searchHistory = []; // Array to store search history
let username = ''; // Variable to store the username

// Load search history from a file
function loadSearchHistory() {
    if (fs.existsSync('searchHistory.json')) {
        const data = fs.readFileSync('searchHistory.json');
        searchHistory.push(...JSON.parse(data));
    }
}

// Save search history
function saveSearchHistory() {
    fs.writeFileSync('searchHistory.json', JSON.stringify(searchHistory, null, 2));
}

// Function to display a welcome banner
function displayWelcomeBanner() {
    console.log(chalk.blueBright(figlet.textSync('YouTube CLI', { horizontalLayout: 'full' })));
    console.log(chalk.cyanBright(`🎵 Welcome to the YouTube Video CLI! 🎵\n`)); // Added extra space
}

// Function to ask for username
async function askForUsername() {
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'username',
            message: 'Enter your name:',
        },
    ]);
    username = answers.username;
    console.log(chalk.greenBright(`\nHello, ${username}! 👋\n`)); // Added extra space
}

// Function to get the video name from the user
async function getVideoName() {
    const answers = await inquirer.prompt([
        {
            type: 'autocomplete',
            name: 'videoName',
            message: 'Enter the name of the music video you want to search for:',
            source: (answersSoFar, input) => {
                return Promise.resolve(
                    searchHistory.filter((video) =>
                        video.toLowerCase().includes(input?.toLowerCase() || '')
                    )
                );
            },
        },
    ]);
    const videoName = answers.videoName;
    searchHistory.push(videoName); // Add the video name to search history
    saveSearchHistory();
    return videoName;
}

// Function to clear search history
function clearSearchHistory() {
    searchHistory.length = 0; // Clear the array
    saveSearchHistory();
    console.log(chalk.red('\nSearch history cleared.\n')); // Added extra space
}

// Function to re-search from history
async function reSearchFromHistory() {
    if (searchHistory.length === 0) {
        console.log(chalk.yellow('\nNo search history available.\n')); // Added extra space
        return;
    }
    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'selectedVideo',
            message: 'Select a video to search again:',
            choices: searchHistory,
        },
    ]);
    openYouTubeSearch(answers.selectedVideo);
}

// Function to display menu
async function displayMenu() {
    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'menuOption',
            message: 'Choose an option:',
            choices: [
                'Search for a new video',
                'View search history',
                'Re-search from history',
                'Clear search history',
                'Exit',
            ],
        },
    ]);
    return answers.menuOption;
}

// Function to display search history
function displaySearchHistory() {
    if (searchHistory.length === 0) {
        console.log(chalk.yellow('\nNo search history available.\n')); // Added extra space
    } else {
        console.log(chalk.green('\nSearch History:\n'));
        searchHistory.forEach((video, index) => {
            console.log(chalk.cyan(`${index + 1}: ${video}\n`)); // Added extra space
        });
    }
}

// Function to open the YouTube search results
function openYouTubeSearch(videoName) {
    const searchURL = `https://www.youtube.com/results?search_query=${encodeURIComponent(videoName)}`;
    displaySearchHistory(); // Display search history after each search
    console.log(chalk.blue(`\nOpening YouTube search results for: "${videoName}"\n`)); // Added extra space
    open(searchURL);
}

// Main CLI logic
async function runCLI() {
    loadSearchHistory(); // Load search history at the start
    displayWelcomeBanner(); // Display the welcome banner
    await askForUsername(); // Ask for the username

    while (true) {
        try {
            const option = await displayMenu();

            switch (option) {
                case 'Search for a new video':
                    const videoName = await getVideoName();
                    openYouTubeSearch(videoName);
                    break;

                case 'View search history':
                    displaySearchHistory();
                    break;

                case 'Re-search from history':
                    await reSearchFromHistory();
                    break;

                case 'Clear search history':
                    clearSearchHistory();
                    break;

                case 'Exit':
                    console.log(chalk.blue(`\nGoodbye, ${username}! 👋\n`)); // Added extra space
                    process.exit(0);
            }
        } catch (error) {
            console.error(chalk.red('\nAn error occurred:'), error.message); // Added extra space
        }
    }
}

// Run the CLI
runCLI();
