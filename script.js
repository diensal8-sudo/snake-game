// ===== Impostazioni =====
const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");

const CELL = 20;                       // dimensione di una cella in pixel
const COLS = canvas.width / CELL;      // 20 colonne
const ROWS = canvas.height / CELL;     // 20 righe

const START_SPEED = 200;               // millisecondi tra un movimento e l'altro all'inizio
const MIN_SPEED = 80;                  // il serpente non va più veloce di così
const SPEED_STEP = 6;                  // quanto accelera ogni volta che mangia

// ===== Record salvato nel browser =====
function loadBest() {
  try {
    return Number(localStorage.getItem("snake-best")) || 0;
  } catch {
    return 0;
  }
}

function saveBest() {
  try {
    localStorage.setItem("snake-best", best);
  } catch {
    // se il browser non permette di salvare, il gioco funziona lo stesso
  }
}

// ===== Stato del gioco =====
let snake, food, direction, nextDirection;
let score, gameOver, newRecord, speed, timer;
let best = loadBest();

function resetGame() {
  snake = [
    { x: 10, y: 10 },                  // testa
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];
  direction = { x: 1, y: 0 };          // all'inizio va verso destra
  nextDirection = { x: 1, y: 0 };      // direzione scelta con la tastiera
  score = 0;
  speed = START_SPEED;
  gameOver = false;
  newRecord = false;

  scoreEl.textContent = score;
  bestEl.textContent = best;

  placeFood();
  draw();
  startTimer();
}

// (ri)avvia il ciclo di gioco con la velocità attuale
function startTimer() {
  clearInterval(timer);
  timer = setInterval(gameLoop, speed);
}

// mette il cibo in una cella libera, scelta a caso
function placeFood() {
  do {
    food = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS),
    };
  } while (snake.some((part) => part.x === food.x && part.y === food.y));
}

// ===== Disegno =====
function drawRoundedCell(x, y, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2, 6);
  ctx.fill();
}

function drawBackground() {
  // scacchiera leggera: aiuta a "leggere" la griglia
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? "#1e293b" : "#233148";
      ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
    }
  }
}

function drawFood() {
  ctx.fillStyle = "#f87171";
  ctx.beginPath();
  ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2);
  ctx.fill();
}

function drawEyes(head) {
  const cx = head.x * CELL + CELL / 2;
  const cy = head.y * CELL + CELL / 2;
  // gli occhi stanno davanti alla testa, ai due lati della direzione
  const sideX = -direction.y;
  const sideY = direction.x;

  [1, -1].forEach((side) => {
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(
      cx + direction.x * 3 + sideX * side * 4,
      cy + direction.y * 3 + sideY * side * 4,
      2.2,
      0,
      Math.PI * 2
    );
    ctx.fill();
  });
}

function draw() {
  drawBackground();
  drawFood();

  // serpente (la testa ha un colore diverso)
  snake.forEach((part, i) => {
    drawRoundedCell(part.x, part.y, i === 0 ? "#4ade80" : "#22c55e");
  });
  drawEyes(snake[0]);

  if (gameOver) drawGameOver();
}

function drawGameOver() {
  ctx.fillStyle = "rgba(15, 23, 42, 0.8)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = "center";
  ctx.fillStyle = "#e2e8f0";
  ctx.font = "bold 34px system-ui, sans-serif";
  ctx.fillText("Game over", canvas.width / 2, canvas.height / 2 - 30);

  ctx.font = "20px system-ui, sans-serif";
  ctx.fillText("Punti: " + score, canvas.width / 2, canvas.height / 2 + 5);

  if (newRecord) {
    ctx.fillStyle = "#facc15";
    ctx.font = "bold 20px system-ui, sans-serif";
    ctx.fillText("Nuovo record!", canvas.width / 2, canvas.height / 2 + 35);
  }

  ctx.fillStyle = "#94a3b8";
  ctx.font = "16px system-ui, sans-serif";
  ctx.fillText("Premi Invio per ricominciare", canvas.width / 2, canvas.height / 2 + 70);
}

// ===== Movimento =====
function update() {
  direction = nextDirection;

  // nuova testa = vecchia testa + direzione
  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  };

  // sbatte contro un muro?
  if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
    endGame();
    return;
  }

  // sbatte contro se stesso?
  if (snake.some((part) => part.x === head.x && part.y === head.y)) {
    endGame();
    return;
  }

  snake.unshift(head);   // aggiungi la nuova testa davanti

  if (head.x === food.x && head.y === food.y) {
    eatFood();
  } else {
    snake.pop();         // se non ha mangiato, togli l'ultimo pezzo dietro
  }
}

function eatFood() {
  // non togliamo la coda, quindi il serpente cresce
  score++;
  scoreEl.textContent = score;

  // record
  if (score > best) {
    best = score;
    newRecord = true;
    bestEl.textContent = best;
    saveBest();
  }

  // accelera un pochino, fino al limite
  speed = Math.max(MIN_SPEED, speed - SPEED_STEP);
  startTimer();

  placeFood();
}

function endGame() {
  gameOver = true;
  clearInterval(timer);
  draw();
}

// ===== Comandi =====
document.addEventListener("keydown", (e) => {
  // non si può invertire la marcia di colpo (andare a sinistra se vai a destra)
  if (e.key === "ArrowUp" && direction.y === 0) nextDirection = { x: 0, y: -1 };
  if (e.key === "ArrowDown" && direction.y === 0) nextDirection = { x: 0, y: 1 };
  if (e.key === "ArrowLeft" && direction.x === 0) nextDirection = { x: -1, y: 0 };
  if (e.key === "ArrowRight" && direction.x === 0) nextDirection = { x: 1, y: 0 };

  // a fine partita, Invio fa ripartire il gioco
  if (e.key === "Enter" && gameOver) resetGame();

  // evita che le frecce facciano scorrere la pagina
  if (e.key.startsWith("Arrow")) e.preventDefault();
});

// ===== Ciclo di gioco =====
function gameLoop() {
  update();
  if (!gameOver) draw();
}

// ===== Avvio =====
resetGame();
