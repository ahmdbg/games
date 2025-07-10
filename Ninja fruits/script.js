
// --- Opening Screen Logic ---
const openingScreen = document.getElementById("openingScreen");
const openingCanvas = document.getElementById("openingCanvas");
const openingCtx = openingCanvas.getContext("2d");
const startBtn = document.getElementById("startBtn");
const gameContainer = document.getElementById("gameContainer");

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let score = 0;
let fruits = [];
let slices = [];
// --- Opening Screen Fruits ---
let openingFruits = [];
function spawnOpeningFruit() {
  const idx = Math.floor(random(0, fruitImages.length));
  openingFruits.push({
    x: random(100, 700),
    y: 600,
    radius: 30,
    speedY: random(-10, -16),
    speedX: random(-2, 2),
    img: fruitImages[idx].img
  });
}

function drawOpeningScreen() {
  openingCtx.clearRect(0, 0, openingCanvas.width, openingCanvas.height);
  openingFruits.forEach(fruit => {
    fruit.x += fruit.speedX;
    fruit.y += fruit.speedY;
    fruit.speedY += 0.4;
    openingCtx.save();
    openingCtx.beginPath();
    openingCtx.arc(fruit.x, fruit.y, fruit.radius, 0, Math.PI * 2);
    openingCtx.closePath();
    openingCtx.clip();
    openingCtx.drawImage(fruit.img, fruit.x - fruit.radius, fruit.y - fruit.radius, fruit.radius * 2, fruit.radius * 2);
    openingCtx.restore();
  });
  // Remove out of bounds
  openingFruits = openingFruits.filter(f => f.y < openingCanvas.height + 50);
  requestAnimationFrame(drawOpeningScreen);
}

if (openingScreen && openingCanvas) {
  // Start animating opening fruits
  setInterval(spawnOpeningFruit, 900);
  drawOpeningScreen();
}

if (startBtn) {
  startBtn.onclick = function() {
    openingScreen.style.display = "none";
    gameContainer.style.display = "block";
    // Start/reset game
    score = 0;
    document.getElementById("score").textContent = "Score: 0";
    fruits = [];
    slices = [];
    setTimeout(() => {
      // Prevent double interval if user restarts
      if (window._fruitInterval) clearInterval(window._fruitInterval);
      window._fruitInterval = setInterval(spawnFruit, 1000);
      updateGame();
    }, 100);
  };
}

// Load fruit and bomb images
const fruitImages = [
  { name: "watermelon", img: new Image() },
  { name: "banana", img: new Image() },
  { name: "apple", img: new Image() },
  { name: "orange", img: new Image() },
  { name: "strawberry", img: new Image() },
  { name: "melon", img: new Image() },
  { name: "avocado", img: new Image() }
];
fruitImages[0].img.src = "https://img.icons8.com/color/200/watermelon.png";
fruitImages[1].img.src = "https://img.icons8.com/color/200/banana.png";
fruitImages[2].img.src = "https://img.icons8.com/color/200/apple.png";
fruitImages[3].img.src = "https://img.icons8.com/color/200/orange.png";
fruitImages[4].img.src = "https://img.icons8.com/color/200/strawberry.png";
fruitImages[5].img.src = "https://img.icons8.com/color/200/melon.png";
fruitImages[6].img.src = "https://img.icons8.com/color/200/avocado.png";

const bombImage = new Image();
bombImage.src = "https://img.icons8.com/color/200/bomb.png";

// For slice effect
let particles = [];

function random(min, max) {
  return Math.random() * (max - min) + min;
}


class Fruit {
  constructor() {
    this.x = random(100, 700);
    this.y = 600;
    this.radius = 30;
    this.speedY = random(-10, -16);
    this.speedX = random(-2, 2);
    this.isHit = false;
    this.isBomb = Math.random() < 0.1; // 10% chance bomb
    if (this.isBomb) {
      this.img = bombImage;
      this.type = "bomb";
    } else {
      const idx = Math.floor(random(0, fruitImages.length));
      this.img = fruitImages[idx].img;
      this.type = fruitImages[idx].name;
    }
    this.sliceEffect = false;
    this.sliceFrame = 0;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.speedY += 0.4; // gravity
    if (this.sliceEffect) {
      this.sliceFrame++;
    }
  }

  draw() {
    if (this.isHit && this.sliceEffect) {
      // Draw slice effect: two halves
      drawSlicedFruit(this);
    } else {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(this.img, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
      ctx.restore();
    }
  }

  isSliced(mouseX, mouseY) {
    const dx = this.x - mouseX;
    const dy = this.y - mouseY;
    return Math.sqrt(dx * dx + dy * dy) < this.radius;
  }
}

function drawSlicedFruit(fruit) {
  // Draw two halves separated
  const offset = fruit.sliceFrame * 2;
  // Left half
  ctx.save();
  ctx.beginPath();
  ctx.arc(fruit.x - offset, fruit.y, fruit.radius, Math.PI * 0.2, Math.PI * 1.2);
  ctx.lineTo(fruit.x, fruit.y);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(fruit.img, fruit.x - fruit.radius - offset, fruit.y - fruit.radius, fruit.radius * 2, fruit.radius * 2);
  ctx.restore();
  // Right half
  ctx.save();
  ctx.beginPath();
  ctx.arc(fruit.x + offset, fruit.y, fruit.radius, Math.PI * 1.2, Math.PI * 0.2);
  ctx.lineTo(fruit.x, fruit.y);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(fruit.img, fruit.x - fruit.radius + offset, fruit.y - fruit.radius, fruit.radius * 2, fruit.radius * 2);
  ctx.restore();
  // Add juice particles
  for (let i = 0; i < 5; i++) {
    particles.push({
      x: fruit.x,
      y: fruit.y,
      dx: random(-2, 2),
      dy: random(-2, 2),
      color: fruit.type === "bomb" ? "#fff" : "#aaff00",
      life: 20
    });
  }
}

function spawnFruit() {
  fruits.push(new Fruit());
}


function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  fruits.forEach(fruit => {
    fruit.update();
    fruit.draw();
  });
  // Draw slice trail
  slices.forEach(s => {
    ctx.beginPath();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.moveTo(s.x1, s.y1);
    ctx.lineTo(s.x2, s.y2);
    ctx.stroke();
  });
  // Draw particles
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
    p.x += p.dx;
    p.y += p.dy;
    p.dy += 0.1;
    p.life--;
  }
  particles = particles.filter(p => p.life > 0);
}

function updateGame() {
  draw();

  // Remove fruits out of bounds
  fruits = fruits.filter(f => f.y < canvas.height + 50 && !f.isHit);
  slices = [];

  requestAnimationFrame(updateGame);
}


canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  slices.push({
    x1: mouseX - 10,
    y1: mouseY - 10,
    x2: mouseX,
    y2: mouseY
  });

  fruits.forEach(fruit => {
    if (!fruit.isHit && fruit.isSliced(mouseX, mouseY)) {
      fruit.isHit = true;
      fruit.sliceEffect = true;
      fruit.sliceFrame = 0;
      if (fruit.isBomb) {
        setTimeout(() => {
          showGameOverModal();
        }, 300);
      } else {
        score += 1;
        document.getElementById("score").textContent = "Score: " + score;
      }
    }
  });
});

// Tambahkan event listener untuk sentuhan di perangkat mobile
canvas.addEventListener("touchmove", (e) => {
  const rect = canvas.getBoundingClientRect();
  // Ambil posisi sentuhan pertama
  const touch = e.touches[0];
  const touchX = touch.clientX - rect.left;
  const touchY = touch.clientY - rect.top;

  slices.push({
    x1: touchX - 10,
    y1: touchY - 10,
    x2: touchX,
    y2: touchY
  });

  fruits.forEach(fruit => {
    if (!fruit.isHit && fruit.isSliced(touchX, touchY)) {
      fruit.isHit = true;
      fruit.sliceEffect = true;
      fruit.sliceFrame = 0;
      if (fruit.isBomb) {
        setTimeout(() => {
          showGameOverModal();
        }, 300);
      } else {
        score += 1;
        document.getElementById("score").textContent = "Score: " + score;
      }
    }
  });
  // Mencegah scroll saat main game di HP
  e.preventDefault();
}, { passive: false });

// Modal elements
const gameOverModal = document.getElementById("gameOverModal");
const finalScoreText = document.getElementById("finalScore");
const playAgainBtn = document.getElementById("playAgainBtn");

function showGameOverModal() {
  finalScoreText.textContent = "Your Score: " + score;
  gameOverModal.style.display = "flex";
}

function hideGameOverModal() {
  gameOverModal.style.display = "none";
}

playAgainBtn.addEventListener("click", () => {
  location.reload();
});

function resetGame() {
  score = 0;
  document.getElementById("score").textContent = "Score: 0";
  fruits = [];
  slices = [];
  hideGameOverModal();
  // Restart fruit spawning and game loop
  if (window._fruitInterval) clearInterval(window._fruitInterval);
  window._fruitInterval = setInterval(spawnFruit, 1000);
  updateGame();
}


// Only start game if not in opening screen
if (!openingScreen) {
  setInterval(spawnFruit, 1000);
  updateGame();
}
