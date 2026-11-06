# Snake

The classic Snake game, built from scratch with **HTML, CSS and JavaScript**. No libraries, no frameworks.

> 🎮 **Play it:** add your GitHub Pages link here (`https://your-name.github.io/snake-game/`)

Part of the *Feral Frame Studio* series: small projects built step by step.

## How to play

- Move the snake with the **arrow keys**, or on a phone with a **swipe** on the board or the **on-screen buttons**.
- Eat the red food to grow and score a point.
- Every piece of food makes the snake a little **faster**.
- You lose if you hit a **wall** or **yourself**. Press **Enter** (or tap the board) to play again.
- Your **record** is saved in the browser, so it is still there tomorrow.

## The files

| File | What it does |
|---|---|
| `index.html` | The page: title, score, record and the `<canvas>` where the game is drawn |
| `style.css` | The look: dark card, rounded score labels |
| `script.js` | The logic of the game |

## The main ideas

**1. The grid.** The canvas is 400 × 400 pixels, divided into cells of 20 pixels: 20 columns and 20 rows.

**2. The snake is a list of coordinates.** Each piece is an object `{ x, y }`, and the first one is the head.

```js
snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
```

**3. Movement is a trick.** The snake does not really move. At every step we add a new head in front and remove the last piece behind.

```js
snake.unshift(head);   // new head in front
snake.pop();           // last piece removed
```

**4. Growing.** When the head lands on the food we skip `pop()`, so the snake is one piece longer.

**5. Game over.** Two checks on the new head: is it outside the board (wall)? Is it on a piece of the snake (itself)?

**6. The game loop.** `setInterval` calls `update()` and `draw()` again and again. Starting at 200 ms, it goes down by 6 ms for every food eaten, down to a minimum of 80 ms.

**7. The record.** It lives in `localStorage`, the small memory of the browser:

```js
localStorage.setItem("snake-best", best);
```

**8. No sudden reverse.** If you are going right you cannot go left immediately, otherwise the snake would run into itself.

**9. Works on phones.** One function, `setDirection(name)`, is used by the keyboard, the buttons and the swipe (the swipe compares the horizontal and vertical distance of the finger). The buttons are hidden on computers with CSS `@media (hover: hover)`.

## Settings to play with

At the top of `script.js` there are a few numbers. Change them and the game changes:

```js
const CELL = 20;          // size of a cell
const START_SPEED = 200;  // ms between two steps at the start
const MIN_SPEED = 80;     // the fastest it can go
const SPEED_STEP = 6;     // how much faster for each food
```

## Run it on your computer

Download the three files in the same folder and open `index.html` in a browser. That's all.

## Put it online (GitHub Pages)

1. Create a new public repository on GitHub.
2. Upload `index.html`, `style.css` and `script.js` (Add file → Upload files).
3. Go to **Settings → Pages**, choose branch **main**, folder **/ (root)**, and save.
4. After a minute or two your link appears. Paste it in the repository's **Website** field (the gear next to *About*).

## Ideas to extend it

- A pause button
- Walls that wrap around instead of killing the snake
- A second snake or obstacles

---

## 🇮🇹 In italiano

Il classico gioco **Snake** fatto da zero con HTML, CSS e JavaScript, senza librerie.

**Come si gioca:** muovi il serpente con le **frecce** (su telefono con lo **swipe** o i **pulsanti**), mangia il cibo rosso per crescere e fare punti. Ogni cibo lo rende un po' più **veloce**. Perdi se tocchi un **muro** o **te stesso**; premi **Invio** per ricominciare. Il **record** resta salvato nel browser.

**Le idee principali:** il serpente è una **lista di coordinate**; si muove aggiungendo una **nuova testa** davanti e togliendo l'**ultimo pezzo** dietro; cresce quando **non togliamo la coda**; il record vive in **localStorage**.

**Per provarlo:** metti i tre file nella stessa cartella e apri `index.html`. Per metterlo online usa **GitHub Pages** (Settings → Pages → branch main, cartella root).
