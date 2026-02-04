// --- Game State ---
const state = {
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    totalPairs: 0,
    moves: 0,
    timer: null,
    seconds: 0,
    isLocked: false,
    gameActive: false
};

// --- Themes Data ---
const themes = {
    letters: {
        set: 'ABCDEFGHIJKLMNOPQR'.split(''),
        back: '#2196F3', // Blue
        front: '#4CAF50' // Green
    },
    emojis: {
        set: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦'],
        back: '#673AB7', // Purple
        front: '#FF9800' // Orange
    },
    numbers: {
        set: ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18'],
        back: '#333333', // Dark Grey
        front: '#F44336' // Red
    }
};

// --- Audio Context ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, type, duration) {
    const toggle = document.getElementById('soundToggle');
    if (toggle && !toggle.checked) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

const sounds = {
    flip: () => playTone(300, 'sine', 0.1),
    match: () => { playTone(600, 'sine', 0.1); setTimeout(() => playTone(800, 'sine', 0.2), 100); },
    wrong: () => playTone(150, 'sawtooth', 0.3),
    win: () => { playTone(500, 'square', 0.1); setTimeout(() => playTone(700, 'square', 0.1), 100); }
};

// --- DOM Elements ---
const gameBoard = document.getElementById('gameBoard');
const movesDisplay = document.getElementById('moves');
const timerDisplay = document.getElementById('timer');
const globalMovesDisplay = document.getElementById('globalMoves'); // NEW
const difficultySelect = document.getElementById('difficulty');
const themeSelect = document.getElementById('theme');
const restartBtn = document.getElementById('restartBtn');
const modal = document.getElementById('gameOverModal');

// --- STORAGE FUNCTIONS (Assignment Part 1) ---

// 1. Save current game state to SessionStorage (Survives Refresh, Unique per Tab)
const saveGameState = () => {
    if (!state.gameActive) return;
    
    const gameData = {
        moves: state.moves,
        seconds: state.seconds,
        matchedPairs: state.matchedPairs,
        totalPairs: state.totalPairs,
        difficulty: difficultySelect.value,
        theme: themeSelect.value,
        boardHTML: gameBoard.innerHTML // Save the actual HTML of the cards
    };
    sessionStorage.setItem('memoryGameState', JSON.stringify(gameData));
};

// 2. Update Global Moves in LocalStorage (Shared across all tabs)
const updateGlobalMoves = () => {
    let total = parseInt(localStorage.getItem('memoryGameGlobalMoves')) || 0;
    total++;
    localStorage.setItem('memoryGameGlobalMoves', total);
    globalMovesDisplay.textContent = total;
};

// 3. Load Global Moves on startup
const loadGlobalMoves = () => {
    const total = parseInt(localStorage.getItem('memoryGameGlobalMoves')) || 0;
    globalMovesDisplay.textContent = total;
};

// --- Game Logic ---

const initGame = (isLoadFromSave = false) => {
    // Stop any existing timer
    clearInterval(state.timer);
    loadGlobalMoves();

    // CHECK: Is there a saved game in SessionStorage?
    const savedData = sessionStorage.getItem('memoryGameState');

    if (isLoadFromSave && savedData) {
        // --- RESTORE GAME ---
        const data = JSON.parse(savedData);
        
        // Restore variables
        state.moves = data.moves;
        state.seconds = data.seconds;
        state.matchedPairs = data.matchedPairs;
        state.totalPairs = data.totalPairs;
        state.gameActive = true;
        state.flippedCards = []; // Reset flipped cards to avoid stuck state
        state.isLocked = false;

        // Restore UI
        difficultySelect.value = data.difficulty;
        themeSelect.value = data.theme;
        movesDisplay.textContent = state.moves;
        
        // Restore Board
        gameBoard.style.gridTemplateColumns = `repeat(${data.difficulty}, 80px)`;
        gameBoard.innerHTML = data.boardHTML;

        // IMPORTANT: Re-attach event listeners because innerHTML kills them
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.addEventListener('click', () => handleCardClick(card));
        });

        // Apply Theme Colors
        const currentTheme = themes[data.theme];
        document.documentElement.style.setProperty('--card-back', currentTheme.back);
        document.documentElement.style.setProperty('--card-front', currentTheme.front);

        // Restart Timer
        state.timer = setInterval(updateTimer, 1000);

    } else {
        // --- NEW GAME ---
        sessionStorage.removeItem('memoryGameState'); // Clear old save
        
        state.flippedCards = [];
        state.matchedPairs = 0;
        state.moves = 0;
        state.seconds = 0;
        state.isLocked = false;
        state.gameActive = true;
        
        movesDisplay.textContent = '0';
        timerDisplay.textContent = '00:00';
        state.timer = setInterval(updateTimer, 1000);
        modal.classList.remove('show');

        // Apply Theme
        const themeKey = themeSelect.value;
        const currentTheme = themes[themeKey];
        document.documentElement.style.setProperty('--card-back', currentTheme.back);
        document.documentElement.style.setProperty('--card-front', currentTheme.front);

        // Get Settings
        const gridSize = parseInt(difficultySelect.value);
        const numPairs = (gridSize * gridSize) / 2;
        state.totalPairs = numPairs;

        gameBoard.style.gridTemplateColumns = `repeat(${gridSize}, 80px)`;
        
        // Generate Cards
        const selectedItems = currentTheme.set.slice(0, numPairs);
        const deck = [...selectedItems, ...selectedItems];
        
        // Shuffle
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }

        gameBoard.innerHTML = '';

        deck.forEach((item) => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.dataset.value = item;

            card.innerHTML = `
                <div class="card-inner">
                    <div class="card-face card-front"></div>
                    <div class="card-face card-back">${item}</div>
                </div>
            `;

            card.addEventListener('click', () => handleCardClick(card));
            gameBoard.appendChild(card);
        });
        
        saveGameState(); // Save initial state
    }
};

const handleCardClick = (card) => {
    if (state.isLocked || card.classList.contains('flipped') || !state.gameActive) return;

    sounds.flip();
    card.classList.add('flipped');
    state.flippedCards.push(card);
    
    saveGameState(); // Save state on flip

    if (state.flippedCards.length === 2) {
        state.moves++;
        movesDisplay.textContent = state.moves;
        
        updateGlobalMoves(); // Increment global moves
        saveGameState(); // Save state on move

        checkForMatch();
    }
};

const checkForMatch = () => {
    state.isLocked = true;
    const [card1, card2] = state.flippedCards;
    const match = card1.dataset.value === card2.dataset.value;

    if (match) {
        sounds.match();
        state.matchedPairs++;
        state.flippedCards = [];
        state.isLocked = false;
        saveGameState(); // Save match state

        if (state.matchedPairs === state.totalPairs) {
            endGame();
        }
    } else {
        sounds.wrong();
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            state.flippedCards = [];
            state.isLocked = false;
            saveGameState(); // Save reset state
        }, 1000);
    }
};

const updateTimer = () => {
    state.seconds++;
    const mins = Math.floor(state.seconds / 60).toString().padStart(2, '0');
    const secs = (state.seconds % 60).toString().padStart(2, '0');
    timerDisplay.textContent = `${mins}:${secs}`;
    saveGameState(); // Save timer state
};

const endGame = () => {
    state.gameActive = false;
    clearInterval(state.timer);
    sessionStorage.removeItem('memoryGameState'); // Clear save on win
    sounds.win();
    
    document.getElementById('finalTime').textContent = timerDisplay.textContent;
    document.getElementById('finalMoves').textContent = state.moves;
    
    setTimeout(() => {
        modal.classList.add('show');
    }, 500);
};

// Restart button always starts a FRESH game
restartBtn.addEventListener('click', () => initGame(false));

difficultySelect.addEventListener('change', () => initGame(false));
themeSelect.addEventListener('change', () => initGame(false));

// On Page Load: Try to load from save
window.addEventListener('load', () => {
    // If we have data, load it. If not, start new.
    if (sessionStorage.getItem('memoryGameState')) {
        initGame(true);
    } else {
        initGame(false);
    }
});
