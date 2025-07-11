// Ambil elemen canvas dan context 2D untuk menggambar
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Sound effects (gunakan file lokal, pastikan file slice.mp3 dan gameover.mp3 ada di folder ini)
const sliceSfx = new Audio("./sound/slice.mp3"); // suara saat slice buah
const gameOverSfx = new Audio("./sound/gameover.mp3"); // suara saat game over

// Variabel utama game
let score = 0;
let fruits = [];      // array untuk menyimpan buah yang muncul
let slices = [];      // array untuk menyimpan jejak slice
let particles = [];   // array untuk efek partikel

// Atur ukuran canvas sesuai window
let cw = window.innerWidth;
let ch = window.innerHeight;
canvas.width = cw;
canvas.height = ch;

// Load gambar buah-buahan dari URL eksternal
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
// Array gambar buah
const fruitImgs = fruitImgSources.map(src => {
  const img = new Image();
  img.src = src;
  return img;
});
// Gambar bom
const bombImg = new Image();
bombImg.src = "https://img.icons8.com/color/96/000000/bomb.png";

// Fungsi random antara min dan max
function random(min, max) {
  return Math.random() * (max - min) + min;
}

// Kelas Fruit untuk objek buah dan bom
class Fruit {
  constructor() {
    // Posisi awal buah di bawah layar
    this.x = random(100, cw - 100);
    this.y = ch;
    this.radius = 30;
    // Kecepatan awal buah (ke atas dan ke samping)
    this.speedY = random(-16, -22);
    this.speedX = random(-3, 3);
    this.isHit = false; // status sudah di-slice atau belum
    this.isBomb = Math.random() < 0.15; // 15% kemungkinan bom
    if (this.isBomb) {
      this.img = bombImg;
    } else {
      // Pilih gambar buah secara acak
      this.img = fruitImgs[Math.floor(Math.random() * fruitImgs.length)];
    }
  }

  // Update posisi buah (efek gravitasi)
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.speedY += 0.5;
  }

  // Gambar buah atau bom ke canvas
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
      // Jika gambar belum siap, tampilkan lingkaran warna
      ctx.beginPath();
      ctx.fillStyle = this.isBomb ? "red" : "lime";
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Cek apakah buah terkena slice (jarak mouse/touch dengan pusat buah < radius)
  isSliced(x, y) {
    const dx = this.x - x;
    const dy = this.y - y;
    return Math.sqrt(dx * dx + dy * dy) < this.radius;
  }
}

// Kelas Particle untuk efek partikel saat slice
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
  // Update posisi dan transparansi partikel
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.speedY += 0.2;
    this.alpha -= 0.03;
  }
  // Gambar partikel ke canvas
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

// Fungsi untuk menambah buah baru ke array fruits
function spawnFruit() {
  fruits.push(new Fruit());
}

// Fungsi utama untuk menggambar semua elemen game
function draw() {
  ctx.clearRect(0, 0, cw, ch); // Bersihkan canvas
  // Gambar semua buah
  fruits.forEach(fruit => {
    fruit.update();
    fruit.draw();
  });

  // Gambar semua partikel
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  // Hapus partikel yang sudah transparan
  particles = particles.filter(p => p.alpha > 0);

  // Gambar jejak slice (garis putih)
  slices.forEach(slice => {
    ctx.beginPath();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.moveTo(slice.x1, slice.y1);
    ctx.lineTo(slice.x2, slice.y2);
    ctx.stroke();
  });

  // Hapus jejak slice lama agar tidak terlalu banyak
  if (slices.length > 5) slices.shift();
}

// Fungsi update game (loop utama)
function updateGame() {
  draw();
  // Hapus buah yang sudah keluar layar atau sudah di-slice
  fruits = fruits.filter(f => f.y < ch + 60 && !f.isHit);
  requestAnimationFrame(updateGame); // Loop animasi
}

// Event handler untuk slice via touch (HP)
canvas.addEventListener("touchmove", (e) => {
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;

  // Tambahkan jejak slice
  slices.push({ x1: x - 15, y1: y - 15, x2: x, y2: y });

  // Cek apakah ada buah yang terkena slice
  fruits.forEach(fruit => {
    if (!fruit.isHit && fruit.isSliced(x, y)) {
      fruit.isHit = true;
      // Efek partikel saat slice
      for (let i = 0; i < 18; i++) {
        let color = fruit.isBomb ? "#ff3333" : "#7fff00";
        particles.push(new Particle(fruit.x, fruit.y, color));
      }
      if (fruit.isBomb) {
        // Jika bom, mainkan suara game over dan tampilkan modal
        gameOverSfx.currentTime = 0; gameOverSfx.play();
        showGameOverModal(score);
      } else {
        // Jika buah, mainkan suara slice dan tambah skor
        sliceSfx.currentTime = 0; sliceSfx.play();
        score++;
        document.getElementById("score").textContent = "Score: " + score;
      }
    }
  });
});

// Event handler untuk slice via mouse (PC)
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

  // Tambahkan jejak slice
  slices.push({ x1: x - 15, y1: y - 15, x2: x, y2: y });

  // Cek apakah ada buah yang terkena slice
  fruits.forEach(fruit => {
    if (!fruit.isHit && fruit.isSliced(x, y)) {
      fruit.isHit = true;
      // Efek partikel saat slice
      for (let i = 0; i < 18; i++) {
        let color = fruit.isBomb ? "#ff3333" : "#7fff00";
        particles.push(new Particle(fruit.x, fruit.y, color));
      }
      if (fruit.isBomb) {
        // Jika bom, mainkan suara game over dan tampilkan modal
        gameOverSfx.currentTime = 0; gameOverSfx.play();
        showGameOverModal(score);
      } else {
        // Jika buah, mainkan suara slice dan tambah skor
        sliceSfx.currentTime = 0; sliceSfx.play();
        score++;
        document.getElementById("score").textContent = "Score: " + score;
      }
    }
  });
});

// Fungsi untuk menampilkan modal Game Over
function showGameOverModal(finalScore) {
  const modal = document.getElementById('gameOverModal');
  const scoreDiv = document.getElementById('finalScore');
  scoreDiv.textContent = 'Score: ' + finalScore;
  modal.style.display = 'flex';
  // Nonaktifkan interaksi pada canvas
  canvas.style.pointerEvents = 'none';
}

// Event handler tombol Play Again pada modal Game Over
const playAgainBtn = document.getElementById('playAgainBtn');
if (playAgainBtn) {
  playAgainBtn.onclick = function() {
    location.reload();
  };
}

// Interval untuk spawn buah baru setiap 1 detik
setInterval(spawnFruit, 1000);
// Mulai loop game
updateGame();

// Event handler untuk resize window agar canvas selalu full screen
window.addEventListener("resize", () => {
  cw = window.innerWidth;
  ch = window.innerHeight;
  canvas.width = cw;
  canvas.height = ch;
});
