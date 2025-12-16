const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

// --- Параметри м'яча ---
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 4; // Початкова швидкість по X
let dy = -4; // Початкова швидкість по Y
const ballRadius = 10;

// --- Параметри ракетки ---
const paddleHeight = 10;
const paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;

// --- Керування клавіатурою ---
let rightPressed = false;
let leftPressed = false;

// --- Стан гри ---
let gameStarted = false;

// --- Параметри цеглин (Bricks) ---
const brickRowCount = 3;
const brickColumnCount = 5;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

// --- Рахунок та життя ---
let score = 0;
let lives = 2;

// Створення масиву цеглин
const bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (let r = 0; r < brickRowCount; r++) {
    bricks[c][r] = { x: 0, y: 0, status: 1 };
  }
}

// Слухачі подій і управління клавіатурою
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = true;
    if (!gameStarted) gameStarted = true;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = true;
    if (!gameStarted) gameStarted = true;
  }
}

function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = false;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = false;
  }
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#dd2900ff";
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1) {
        const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = "#0095DD";
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

function drawScore() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.textAlign = "left";
  ctx.fillText("Score: " + score, 8, 20);
}

function drawLives() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#141515ff";
  ctx.fillText("Lives: " + lives, canvas.width - 65, 20);
}

function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const b = bricks[c][r];
      if (b.status === 1) {
        if (
          x > b.x &&
          x < b.x + brickWidth &&
          y > b.y &&
          y < b.y + brickHeight
        ) {
          dy = -dy;
          b.status = 0;
          score++;
          if (score === brickRowCount * brickColumnCount) {
            alert("YOU WIN, CONGRATULATIONS!");
            document.location.reload();
          }
        }
      }
    }
  }
}

function draw() {
  if (!gameStarted) {
    x = paddleX + paddleWidth / 2;
    y = canvas.height - paddleHeight - ballRadius;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBricks();
  drawBall();
  drawPaddle();
  drawScore();
  drawLives();
  collisionDetection();

  // --- Логіка відскоку від стін ---
  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
    dx = -dx;
  }
  if (y + dy < ballRadius) {
    dy = -dy;
  }

  // === ВЗАЄМОДІЯ З НИЗОМ (РАКЕТКА) ===
  else if (y + dy > canvas.height - ballRadius) {
    // Перевірка удару об ракетку
    if (x > paddleX && x < paddleX + paddleWidth) {
      dy = -dy; // Відбиваємо вгору

      // === УМОВА 1: ПРИСКОРЕННЯ ===
      // Якщо швидкість ще не занадто велика (менше 8), прискорюємо
      if (Math.abs(dx) < 8) {
        dx *= 1.1;
        dy *= 1.1;
        console.log("Speed increased:", dx); // Для перевірки в консолі
      }
    } else {
      // Якщо м'яч пролетів повз ракетку
      lives--;
      if (!lives) {
        alert("GAME OVER");
        document.location.reload();
      } else {
        // === УМОВА 2: ЗБЕРЕЖЕННЯ ШВИДКОСТІ ===
        // Скидаємо координати м'яча і ракетки, але зберігаємо швидкість
        x = canvas.width / 2;
        y = canvas.height - 30;
        paddleX = (canvas.width - paddleWidth) / 2;

        // Гарантуємо, що м'яч полетить вгору (dy має бути від'ємним)

        if (dy > 0) {
          dy = -dy;
        }
      }
    }
  }

  if (rightPressed && paddleX < canvas.width - paddleWidth) {
    paddleX += 7;
  } else if (leftPressed && paddleX > 0) {
    paddleX -= 7;
  }

  if (gameStarted) {
    x += dx;
    y += dy;
  }

  requestAnimationFrame(draw);

  if (!gameStarted) {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.textAlign = "center";
    ctx.fillText(
      "Натисніть ← або → щоб почати",
      canvas.width / 2,
      canvas.height / 2
    );
  }
}

draw();
