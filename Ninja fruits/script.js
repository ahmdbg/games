
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let score = 0;
let fruits = [];
let slices = [];
let particles = [];

let cw = window.innerWidth;
let ch = window.innerHeight;
canvas.width = cw;
canvas.height = ch;

// Load images
const fruitImgSources = [
  "https://img.icons8.com/color/96/000000/watermelon.png",
  "https://img.icons8.com/color/96/000000/apple.png",
  "https://img.icons8.com/color/96/000000/banana.png",
  "https://img.icons8.com/color/96/000000/orange.png",
  "https://img.icons8.com/color/96/000000/pineapple.png",
  "https://img.icons8.com/color/96/000000/pear.png",
  "https://img.icons8.com/color/96/000000/grapes.png",
  "https://img.icons8.com/color/96/000000/kiwi.png",
  "https://img.icons8.com/color/96/000000/strawberry.png",
  "https://img.icons8.com/color/96/000000/cherry.png"
];
const fruitImgs = fruitImgSources.map(src => {
  const img = new Image();
  img.src = src;
  return img;
});
const bombImg = new Image();
bombImg.src = "https://img.icons8.com/color/96/000000/bomb.png";

function random(min, max) {
  return Math.random() * (max - min) + min;
}


class Fruit {
  constructor() {
    this.x = random(100, cw - 100);
    this.y = ch;
    this.radius = 30;
    this.speedY = random(-16, -22);
    this.speedX = random(-3, 3);
    this.isHit = false;
    this.isBomb = Math.random() < 0.15; // 15% chance bomb
    if (this.isBomb) {
      this.img = bombImg;
    } else {
      // Pick a random fruit image
      this.img = fruitImgs[Math.floor(Math.random() * fruitImgs.length)];
    }
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.speedY += 0.5;
  }

  draw() {
    if (this.img.complete) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(this.img, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
      ctx.restore();
    } else {
      // fallback circle
      ctx.beginPath();
      ctx.fillStyle = this.isBomb ? "red" : "lime";
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  isSliced(x, y) {
    const dx = this.x - x;
    const dy = this.y - y;
    return Math.sqrt(dx * dx + dy * dy) < this.radius;
  }
}

// Particle effect for slice
class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.radius = random(2, 5);
    this.color = color;
    this.alpha = 1;
    this.speedX = random(-4, 4);
    this.speedY = random(-6, -2);
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.speedY += 0.2;
    this.alpha -= 0.03;
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }
}

function spawnFruit() {
  fruits.push(new Fruit());
}


function draw() {
  ctx.clearRect(0, 0, cw, ch);
  fruits.forEach(fruit => {
    fruit.update();
    fruit.draw();
  });

  // Draw particles
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  particles = particles.filter(p => p.alpha > 0);

  slices.forEach(slice => {
    ctx.beginPath();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.moveTo(slice.x1, slice.y1);
    ctx.lineTo(slice.x2, slice.y2);
    ctx.stroke();
  });

  // Clear old slice lines
  if (slices.length > 5) slices.shift();
}

function updateGame() {
  draw();
  fruits = fruits.filter(f => f.y < ch + 60 && !f.isHit);
  requestAnimationFrame(updateGame);
}

// Handle touch slice
canvas.addEventListener("touchmove", (e) => {
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;

  slices.push({ x1: x - 15, y1: y - 15, x2: x, y2: y });

  fruits.forEach(fruit => {
    if (!fruit.isHit && fruit.isSliced(x, y)) {
      fruit.isHit = true;
      // Particle effect on slice
      for (let i = 0; i < 18; i++) {
        let color = fruit.isBomb ? "#ff3333" : "#7fff00";
        particles.push(new Particle(fruit.x, fruit.y, color));
      }
      if (fruit.isBomb) {
        alert("Game Over!\nFinal Score: " + score);
        location.reload();
      } else {
        score++;
        document.getElementById("score").textContent = "Score: " + score;
      }
    }
  });
});

// Handle mouse slice for PC
let isMouseDown = false;
canvas.addEventListener("mousedown", (e) => {
  isMouseDown = true;
});
canvas.addEventListener("mouseup", (e) => {
  isMouseDown = false;
});
canvas.addEventListener("mousemove", (e) => {
  if (!isMouseDown) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  slices.push({ x1: x - 15, y1: y - 15, x2: x, y2: y });

  fruits.forEach(fruit => {
    if (!fruit.isHit && fruit.isSliced(x, y)) {
      fruit.isHit = true;
      if (fruit.isBomb) {
        alert("Game Over!\nFinal Score: " + score);
        location.reload();
      } else {
        score++;
        document.getElementById("score").textContent = "Score: " + score;
      }
    }
  });
});



setInterval(spawnFruit, 1000);
updateGame();

// Handle resize
window.addEventListener("resize", () => {
  cw = window.innerWidth;
  ch = window.innerHeight;
  canvas.width = cw;
  canvas.height = ch;
});
