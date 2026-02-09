const gameBoard = document.getElementById('game-board');
const movesDisplay = document.getElementById('moves');
const timerDisplay = document.getElementById('timer');
const restartBtn = document.getElementById('restartBtn');
const difficultySelect = document.getElementById('difficulty');
const themeSelect = document.getElementById('theme');

// NEW: Global Moves Display
const globalMovesDisplay = document.createElement('div');
globalMovesDisplay.id = 'global-moves';
globalMovesDisplay.style.marginTop = '10px';
globalMovesDisplay.style.fontWeight = 'bold';
document.querySelector('.stats').appendChild(globalMovesDisplay);

let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let timer = 0;
let timerInterval;
let gameActive = false;

// THEMES
const themes = {
    letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'],
    emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', 'ox', '🐯', '🐨', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', 'duck', '🦅', '🦉', '🦇'],
    numbers: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18']
};

// --- STATE MANAGEMENT EXPLANATION ---
// 1. Game State (Cards, Timer, Current Moves): Uses sessionStorage.
//    Why? The requirement says "if you open another tab... it should be another unique version of the game."
//    sessionStorage is unique to each tab, so Game A in Tab 1 won't mess up Game B in Tab 2.
//
// 2. Global Total Moves: Uses localStorage.
//    Why? The requirement says "count all moves across the tabs."
//    localStorage is shared across all tabs for the same domain.

function saveGameState() {
    const state = {
        cards: cards.map(c => ({ 
            value: c.dataset.value, 
            flipped: c.classList.contains('flipped'), 
            matched: c.classList.contains('matched') 
        })),
        moves: moves,
        timer: timer,
        difficulty: difficultySelect.value,
        theme: themeSelect.value,
        matchedPairs: matchedPairs,
        gameActive: gameActive
    };
    sessionStorage.setItem('memoryGameState', JSON.stringify(state));
}

function updateGlobalMoves() {
    let total = parseInt(localStorage.getItem('globalMoves') || '0');
    globalMovesDisplay.textContent = `Total Global Moves (All Tabs): ${total}`;
}

function incrementGlobalMoves() {
    let total = parseInt(localStorage.getItem('globalMoves') || '0');
    total++;
    localStorage.setItem('globalMoves', total);
    updateGlobalMoves();
    
    // Trigger update in other tabs
    window.dispatchEvent(new Event('storage'));
}

// Listen for changes in other tabs to update global count immediately
window.addEventListener('storage', () => {
    updateGlobalMoves();
});

function initGame(loadFromSave = false) {
    // Clear previous state
    gameBoard.innerHTML = '';
    flippedCards = [];
    clearInterval(timerInterval);

    let savedState = null;
    if (loadFromSave) {
        try {
            savedState = JSON.parse(sessionStorage.getItem('memoryGameState'));
        } catch (e) {
            console.error("Save file corrupted", e);
            loadFromSave = false;
        }
    }

    if (loadFromSave && savedState) {
        // RESTORE STATE
        moves = savedState.moves;
        timer = savedState.timer;
        matchedPairs = savedState.matchedPairs;
        gameActive = savedState.gameActive;
        difficultySelect.value = savedState.difficulty;
        themeSelect.value = savedState.theme;
        
        // Rebuild Board from Save
        const gridSize = parseInt(savedState.difficulty);
        gameBoard.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
        
        cards = [];
        savedState.cards.forEach(cardData => {
            const card = createCardElement(cardData.value);
            if (cardData.flipped) card.classList.add('flipped');
            if (cardData.matched) card.classList.add('matched');
            cards.push(card);
            gameBoard.appendChild(card);
        });

        if (gameActive) startTimer();

    } else {
        // NEW GAME
        moves = 0;
        timer = 0;
        matchedPairs = 0;
        gameActive = true;
        sessionStorage.removeItem('memoryGameState'); // Clear old save
        
        const gridSize = parseInt(difficultySelect.value);
        const numPairs = (gridSize * gridSize) / 2;
        const theme = themes[themeSelect.value];
        const selectedValues = theme.slice(0, numPairs);
        const gameValues = [...selectedValues, ...selectedValues];
        
        // Shuffle
        gameValues.sort(() => Math.random() - 0.5);

        gameBoard.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
        
        cards = [];
        gameValues.forEach(value => {
            const card = createCardElement(value);
            cards.push(card);
            gameBoard.appendChild(card);
        });
        
        saveGameState();
        startTimer();
    }

    movesDisplay.textContent = `Moves: ${moves}`;
    timerDisplay.textContent = `Time: ${formatTime(timer)}`;
    updateGlobalMoves();
}

function createCardElement(value) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.value = value;

    const cardInner = document.createElement('div');
    cardInner.classList.add('card-inner');

    const cardFront = document.createElement('div');
    cardFront.classList.add('card-front');

    const cardBack = document.createElement('div');
    cardBack.classList.add('card-back');
    cardBack.textContent = value;

    cardInner.appendChild(cardFront);
    cardInner.appendChild(cardBack);
    card.appendChild(cardInner);

    card.addEventListener('click', () => flipCard(card));
    return card;
}

function flipCard(card) {
    if (!gameActive || card.classList.contains('flipped') || flippedCards.length >= 2) return;

    card.classList.add('flipped');
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        moves++;
        movesDisplay.textContent = `Moves: ${moves}`;
        incrementGlobalMoves(); // Update global counter
        saveGameState();
        checkForMatch();
    } else {
        saveGameState();
    }
}

function checkForMatch() {
    const [card1, card2] = flippedCards;
    const isMatch = card1.dataset.value === card2.dataset.value;

    if (isMatch) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        matchedPairs++;
        flippedCards = [];
        saveGameState();

        const totalPairs = (parseInt(difficultySelect.value) ** 2) / 2;
        if (matchedPairs === totalPairs) {
            endGame();
        }
    } else {
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            flippedCards = [];
            saveGameState();
        }, 1000);
    }
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timer++;
        timerDisplay.textContent = `Time: ${formatTime(timer)}`;
        saveGameState();
    }, 1000);
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
}

function endGame() {
    gameActive = false;
    clearInterval(timerInterval);
    saveGameState();
    setTimeout(() => alert(`Game Over! Moves: ${moves} Time: ${formatTime(timer)}`), 500);
}

restartBtn.addEventListener('click', () => initGame(false));
difficultySelect.addEventListener('change', () => initGame(false));
themeSelect.addEventListener('change', () => initGame(false));

// On Page Load
window.addEventListener('load', () => {
    // Check if we have a saved game in this tab
    if (sessionStorage.getItem('memoryGameState')) {
        initGame(true);
    } else {
        initGame(false);
    }
});
