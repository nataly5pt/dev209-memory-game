# Memory Game

**Live Site:** [Paste your GitHub Pages URL here]  
**Repo:** [Paste your GitHub Repo URL here]

## Description
A simple memory matching game built with vanilla JavaScript, HTML, and CSS. Flip cards to find matching pairs. Tracks moves and elapsed time.

## Demo
- Grid sizes: 4x4 (Easy), 6x6 (Hard)  
- Timer and move counter  
- Sound effects for flip/match/win  
- Customizable card sets (Letters, Emojis, Numbers) and color themes

## How to Run
1. Clone the repo or download files.  
2. Open `index.html` in a browser.

## How to Play
1. Select difficulty and style (optional).  
2. Click cards to reveal them.  
3. Match pairs until all cards are matched.  
4. Watch the move counter and timer; winning triggers a sound.

## Implementation Notes
- Functional iteration: used `Array.prototype.forEach()` in `initGame` to generate cards.  
- DOM manipulation: build and inject card elements (`document.createElement`, `gameBoard.innerHTML = ''`, etc.).  
- Event handling: attached click listeners per card (`card.addEventListener('click', () => handleCardClick(card))`).  
- ES6 features: template literals for dynamic strings (e.g., `gameBoard.style.gridTemplateColumns = \`repeat(${gridSize}, 1fr)\``) and arrow functions for core logic.

## Extra Credit Features
- Difficulty selection (4x4, 6x6)  
- Live timer (minutes:seconds)  
- Sound effects via Web Audio API  
- Customizable icons and themes

## Project Structure (example)
- index.html — UI  
- styles.css — styling and themes  
- script.js — game logic, DOM, events

## Notes
- Open `index.html` directly for local testing. For GitHub Pages, push the repo and set Pages to the `main` or `gh-pages` branch.

<!-- Add license, credits, or contribution guidelines if desired. -->