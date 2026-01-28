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
