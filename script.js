// ===== Impostazioni =====
const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");

const CELL = 20;                       // dimensione di una cella in pixel
const COLS = canvas.width / CELL;      // 20 colonne
const ROWS = canvas.height / CELL;     // 20 righe

// true su telefono e tablet (schermo touch)
const isTouch = window.matchMedia("(pointer: coarse)").matches;

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
  ctx.fillText(
    isTouch ? "Tocca per ricominciare" : "Premi Invio per ricominciare",
    canvas.width / 2,
    canvas.height / 2 + 70
  );
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
// cambia direzione: dx/dy sono -1, 0 oppure 1
function turn(dx, dy) {
  // non si può invertire la marcia di colpo (andare a sinistra se vai a destra)
  if (dx !== 0 && direction.x === 0) nextDirection = { x: dx, y: 0 };
  if (dy !== 0 && direction.y === 0) nextDirection = { x: 0, y: dy };
}

// tastiera
const KEYS = {
  ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
  w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0],
};

document.addEventListener("keydown", (e) => {
  const move = KEYS[e.key];
  if (move) turn(move[0], move[1]);

  // a fine partita, Invio fa ripartire il gioco
  if (e.key === "Enter" && gameOver) resetGame();

  // evita che le frecce facciano scorrere la pagina
  if (e.key.startsWith("Arrow")) e.preventDefault();
});

// tasti a schermo (telefono)
document.querySelectorAll(".pad button").forEach((btn) => {
  btn.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    turn(Number(btn.dataset.dx), Number(btn.dataset.dy));
  });
});

// scorrimento del dito sul campo
let touchStart = null;
let swiped = false;

canvas.addEventListener("touchstart", (e) => {
  const t = e.touches[0];
  touchStart = { x: t.clientX, y: t.clientY };
  swiped = false;
  e.preventDefault();
}, { passive: false });

canvas.addEventListener("touchmove", (e) => {
  if (!touchStart) return;
  const t = e.touches[0];
  const dx = t.clientX - touchStart.x;
  const dy = t.clientY - touchStart.y;

  // aspetta che il dito si sia spostato abbastanza (24 pixel)
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;

  // vince l'asse in cui il dito si è spostato di più
  if (Math.abs(dx) > Math.abs(dy)) turn(dx > 0 ? 1 : -1, 0);
  else turn(0, dy > 0 ? 1 : -1);

  swiped = true;
  touchStart = { x: t.clientX, y: t.clientY };  // si può scorrere di nuovo senza alzare il dito
  e.preventDefault();
}, { passive: false });

canvas.addEventListener("touchend", () => {
  // un tocco semplice (senza scorrere) a fine partita fa ripartire il gioco
  if (!swiped && gameOver) resetGame();
  touchStart = null;
});

// clic del mouse a fine partita
canvas.addEventListener("click", () => {
  if (gameOver) resetGame();
});

// ===== Ciclo di gioco =====
function gameLoop() {
  update();
  if (!gameOver) draw();
}

// ===== Avvio =====
resetGame();
