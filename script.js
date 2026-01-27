// /c:/Users/natal/OneDrive/Desktop/Bellevue_College/BC_Classes/_Winter_2026/DEV_209/week_4/dev209-memory-game/script.js

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
        set: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','cow','🐷','frog','🐵','🐔','🐧','🐦'],
        back: '#673AB7', // Purple
        front: '#FF9800' // Orange
    },
    numbers: {
        set: ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18'],
        back: '#333333', // Dark Grey
        front: '#F44336' // Red
    }
};

// --- Audio Context (Extra Credit) ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, type, duration) {
    if (!document.getElementById('soundToggle') || !document.getElementById('soundToggle').checked) return;
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
const difficultySelect = document.getElementById('difficulty');
const themeSelect = document.getElementById('theme');
const restartBtn = document.getElementById('restartBtn');
const modal = document.getElementById('gameOverModal');

// --- Game Logic ---

// REQUIREMENT: ES6 Feature (Arrow Functions)
const initGame = () => {
    // Reset State
    state.flippedCards = [];
    state.matchedPairs = 0;
    state.moves = 0;
    state.seconds = 0;
    state.isLocked = false;
    state.gameActive = true;
    
    clearInterval(state.timer);
    state.timer = setInterval(updateTimer, 1000);
    
    if (modal) modal.classList.remove('show');
    if (movesDisplay) movesDisplay.textContent = `Moves: 0`;
    if (timerDisplay) timerDisplay.textContent = `Time: 00:00`;

    // Apply Theme
    const themeKey = themeSelect ? themeSelect.value : 'letters';
    const currentTheme = themes[themeKey] || themes.letters;
    document.documentElement.style.setProperty('--card-back', currentTheme.back);
    document.documentElement.style.setProperty('--card-front', currentTheme.front);

    // Get Settings
    const gridSize = difficultySelect ? parseInt(difficultySelect.value) : 4;
    const numPairs = (gridSize * gridSize) / 2;
    state.totalPairs = numPairs;

    // Setup Grid CSS
    if (gameBoard) gameBoard.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    
    // Generate Cards
    const selectedItems = currentTheme.set.slice(0, numPairs);
    const deck = [...selectedItems, ...selectedItems];
    
    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    // REQUIREMENT: DOM Manipulation
    if (gameBoard) gameBoard.innerHTML = '';

    // REQUIREMENT: Functional Programming (.forEach)
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

        // REQUIREMENT: Event Listener
        card.addEventListener('click', () => handleCardClick(card));
        if (gameBoard) gameBoard.appendChild(card);
    });
};

const handleCardClick = (card) => {
    if (state.isLocked || card.classList.contains('flipped') || !state.gameActive) return;

    // Resume audio context on user gesture if needed
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(()=>{});

    sounds.flip();
    card.classList.add('flipped');
    state.flippedCards.push(card);

    if (state.flippedCards.length === 2) {
        state.moves++;
        if (movesDisplay) movesDisplay.textContent = `Moves: ${state.moves}`;
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
        }, 1000);
    }
};

const updateTimer = () => {
    state.seconds++;
    const mins = Math.floor(state.seconds / 60).toString().padStart(2, '0');
    const secs = (state.seconds % 60).toString().padStart(2, '0');
    if (timerDisplay) timerDisplay.textContent = `Time: ${mins}:${secs}`;
};

const endGame = () => {
    state.gameActive = false;
    clearInterval(state.timer);
    sounds.win();
    
    // REQUIREMENT: ES6 Feature (Template Literals)
    const finalTimeEl = document.getElementById('finalTime');
    const finalMovesEl = document.getElementById('finalMoves');
    if (finalTimeEl) finalTimeEl.textContent = timerDisplay ? timerDisplay.textContent.replace('Time: ', '') : '00:00';
    if (finalMovesEl) finalMovesEl.textContent = state.moves;
    
    setTimeout(() => {
        if (modal) modal.classList.add('show');
    }, 500);
};

if (restartBtn) restartBtn.addEventListener('click', initGame);
if (difficultySelect) difficultySelect.addEventListener('change', initGame);
if (themeSelect) themeSelect.addEventListener('change', initGame);

// Start Game
initGame();