const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const highEl = document.getElementById("high");
const startBtn = document.getElementById("startBtn");

const GRID = 20;                 // 20x20 blocks
const SIZE = canvas.width / GRID; // each block size

let snake, dir, food, score, high, loop, paused, speed;

high = Number(localStorage.getItem("snake_high") || 0);
highEl.textContent = high;

function resetGame() {
  snake = [{ x: 10, y: 10 }]; // start in center
  dir = { x: 1, y: 0 };       // moving right
  score = 0;
  speed = 250;                // ms (lower = faster)
  paused = false;
  scoreEl.textContent = score;

  spawnFood();
  draw();
}

function spawnFood() {
  while (true) {
    const fx = Math.floor(Math.random() * GRID);
    const fy = Math.floor(Math.random() * GRID);
    const onSnake = snake.some(s => s.x === fx && s.y === fy);
    if (!onSnake) {
      food = { x: fx, y: fy };
      return;
    }
  }
}

function startLoop() {
  clearInterval(loop);
  loop = setInterval(tick, speed);
}

function gameOver() {
  clearInterval(loop);
  if (score > high) {
    high = score;
    localStorage.setItem("snake_high", String(high));
    highEl.textContent = high;
  }
  // simple overlay
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 22px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("Game Over 😵", canvas.width / 2, canvas.height / 2 - 10);
  ctx.font = "16px system-ui";
  ctx.fillText("Press Start / Restart", canvas.width / 2, canvas.height / 2 + 18);
}

function tick() {
  if (paused) return;

  const head = snake[0];
  const newHead = { x: head.x + dir.x, y: head.y + dir.y };

  // wall collision
  if (newHead.x < 0 || newHead.x >= GRID || newHead.y < 0 || newHead.y >= GRID) {
    return gameOver();
  }

  // self collision
  if (snake.some((s, i) => i !== 0 && s.x === newHead.x && s.y === newHead.y)) {
    return gameOver();
  }

  snake.unshift(newHead);

  // eat food
  if (newHead.x === food.x && newHead.y === food.y) {
    score += 10;
    scoreEl.textContent = score;
    spawnFood();

    // speed up a bit every 50 points
    if (score % 50 === 0 && speed > 60) {
      speed -= 10;
      startLoop();
    }
  } else {
    snake.pop(); // move: remove tail
  }

  draw();
}

function draw() {
  // background
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // subtle grid
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  for (let i = 0; i <= GRID; i++) {
    ctx.beginPath();
    ctx.moveTo(i * SIZE, 0);
    ctx.lineTo(i * SIZE, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * SIZE);
    ctx.lineTo(canvas.width, i * SIZE);
    ctx.stroke();
  }

  // food
  ctx.fillStyle = "#ff4d6d";
  ctx.beginPath();
  ctx.arc(food.x * SIZE + SIZE / 2, food.y * SIZE + SIZE / 2, SIZE * 0.35, 0, Math.PI * 2);
  ctx.fill();

  // snake
  snake.forEach((s, idx) => {
    ctx.fillStyle = idx === 0 ? "#7CFF6B" : "rgba(124,255,107,0.75)";
    ctx.fillRect(s.x * SIZE + 2, s.y * SIZE + 2, SIZE - 4, SIZE - 4);
  });
}

// controls
window.addEventListener("keydown", (e) => {
  const key = e.key;

  if (key === " ") {
    paused = !paused;
    return;
  }

  // prevent reverse direction
  if (key === "ArrowUp" && dir.y !== 1) dir = { x: 0, y: -1 };
  else if (key === "ArrowDown" && dir.y !== -1) dir = { x: 0, y: 1 };
  else if (key === "ArrowLeft" && dir.x !== 1) dir = { x: -1, y: 0 };
  else if (key === "ArrowRight" && dir.x !== -1) dir = { x: 1, y: 0 };
});

startBtn.addEventListener("click", () => {
  resetGame();
  startLoop();
});

// initial screen
resetGame();