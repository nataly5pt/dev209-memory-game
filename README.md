# 🧠 Memory Game — JavaScript & DOM Manipulation Assignment

**Live Site:** https://nataly5pt.github.io/dev209-memory-game/  
**GitHub Repository:** https://github.com/nataly5pt/dev209-memory-game  

---

## 📌 Project Description
This project is a browser-based memory matching game built using vanilla JavaScript, HTML, and CSS.  
Players flip cards to find matching pairs. The game tracks total moves and elapsed time and displays a game completion message once all pairs are matched.

---

## ▶️ How to Run Locally
1. Clone or download this repository.
2. Open `index.html` in any modern web browser.

---

## ✅ Assignment Requirements Evidence

### 1️⃣ Functional Programming Concept
I used the `.map()` and `.forEach()` array methods to generate and render the shuffled deck of cards. These methods apply a function to each element without manually managing loop counters, demonstrating functional programming principles.

**Example:**
```js

cards.forEach(card => gameBoard.appendChild(createCard(card)));

Code Explanation & Requirements
1. Functional Programming Concept
I used the .forEach() method in the initGame function to iterate over the deck of cards. This is a functional programming method that allows me to execute code for every item in an array without manually managing loop counters.

Code Reference: deck.forEach((item) => { ... }) inside script.js.
2. DOM Manipulation
I manipulated the DOM in the initGame function by creating new div elements for the cards and appending them to the game board container.

Code Reference: const card = document.createElement('div'); and gameBoard.appendChild(card); inside script.js.
3. Event Handling
I added an event listener to the "Restart" button so that the game resets when clicked. I also added click listeners to every card as they are generated.

Code Reference: restartBtn.addEventListener('click', initGame); at the bottom of script.js.
4. ES6 Feature
I used Template Literals (backticks) to dynamically insert variables into strings, such as when updating the timer display.

Code Reference: `timerDisplay.textContent = `${mins}:${secs}`;` inside the `updateTimer` function.