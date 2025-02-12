import inquirer from 'inquirer';
import open from 'open';
import fs from 'fs';
import chalk from 'chalk';
import figlet from 'figlet';
import { execSync } from 'child_process';

const searchHistory = []; // Array to store search history
let username = ''; // 
const bookmarks = [];

// Modify main function to exclude voice search
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


// Load bookmarks from file
function loadBookmarks() {
    if (fs.existsSync('bookmarks.json')) {
        return JSON.parse(fs.readFileSync('bookmarks.json'));
    }
    return [];
}

// Save bookmarks to file
function saveBookmarks(bookmarks) {
    fs.writeFileSync('bookmarks.json', JSON.stringify(bookmarks, null, 2));
}

// Add video to bookmarks
async function addBookmark(videoName) {
    const bookmarks = loadBookmarks();
    if (!bookmarks.includes(videoName)) {
        bookmarks.push(videoName);
        saveBookmarks(bookmarks);
        console.log(chalk.green(`\n✅ "${videoName}" has been bookmarked!\n`));
    } else {
        console.log(chalk.yellow(`\n⚠️ "${videoName}" is already in bookmarks.\n`));
    }
}

// View bookmarks
function viewBookmarks() {
    const bookmarks = loadBookmarks();
    if (bookmarks.length === 0) {
        console.log(chalk.yellow('\nNo bookmarks available.\n'));
    } else {
        console.log(chalk.green('\n📌 Your Bookmarks:\n'));
        bookmarks.forEach((video, index) => {
            console.log(chalk.cyan(`${index + 1}: ${video}`));
        });
    }
}

// Remove a bookmark
async function removeBookmark() {
    const bookmarks = loadBookmarks();
    if (bookmarks.length === 0) {
        console.log(chalk.yellow('\nNo bookmarks available to remove.\n'));
        return;
    }

    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'selectedBookmark',
            message: 'Select a bookmark to remove:',
            choices: bookmarks,
        },
    ]);

    const updatedBookmarks = bookmarks.filter((video) => video !== answers.selectedBookmark);
    saveBookmarks(updatedBookmarks);
    console.log(chalk.red(`\n❌ Removed: "${answers.selectedBookmark}" from bookmarks.\n`));
}

// Load search history
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

// Welcome banner
function displayWelcomeBanner() {
    console.log(chalk.blueBright(figlet.textSync('YouTube CLI', { horizontalLayout: 'full' })));
    console.log(chalk.cyanBright('🎵 Welcome to the YouTube Video CLI! 🎵\n'));
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
    console.log(chalk.greenBright(`\nHello, ${username}! 👋\n`));
}

// Function to get the video name from the user


// Function to clear search history
function clearSearchHistory() {
    searchHistory.length = 0; // Clear the array
    saveSearchHistory();
    console.log(chalk.red('\nSearch history cleared.\n'));
}

// Function to re-search from history
async function reSearchFromHistory() {
    if (searchHistory.length === 0) {
        console.log(chalk.yellow('\nNo search history available.\n'));
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
                '🎵 Search for a new video',
                '📌 View Bookmarked Videos',
                '📌 Add a Video to Bookmarks',
                '🗑️ Remove a Bookmark',
                '🕵️ View Search History',
                '❌ Clear Search History',
                '🚪 Exit',
            ],
        },
    ]);
    return answers.menuOption;
}

// Function to display search history
function displaySearchHistory() {
    if (searchHistory.length === 0) {
        console.log(chalk.yellow('\nNo search history available.\n'));
    } else {
        console.log(chalk.green('\nSearch History:\n'));
        searchHistory.forEach((video, index) => {
            console.log(chalk.cyan(`${index + 1}: ${video}\n`));
        });
    }
}

// Function to open the YouTube search results
function openYouTubeSearch(videoName) {
    const searchURL = `https://www.youtube.com/results?search_query=${encodeURIComponent(videoName)}`;
    displaySearchHistory(); // Display search history after each search
    console.log(chalk.blue(`\nOpening YouTube search results for: "${videoName}"\n`));
    open(searchURL);
}

// CLI logic
async function runCLI() {
    while (true) {
        const option = await displayMenu();
        switch (option) {
            case '🎵 Search for a new video':
                const videoName = await getVideoName();
                openYouTubeSearch(videoName);
                break;
            case '📌 View Bookmarked Videos':
                viewBookmarks();
                break;
            case '📌 Add a Video to Bookmarks':
                const bookmarkVideo = await getVideoName();
                await addBookmark(bookmarkVideo);
                break;
            case '🗑️ Remove a Bookmark':
                await removeBookmark();
                break;
            case '🕵️ View Search History':
                displaySearchHistory();
                break;
            case '❌ Clear Search History':
                clearSearchHistory();
                break;
            case '🚪 Exit':
                console.log(chalk.blue(`\nGoodbye! 👋\n`));
                process.exit(0);
        }
    }
}

runCLI();
