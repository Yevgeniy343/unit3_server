const canvas = document.getElementById("scope");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// =====================
// Настройки отображения
// =====================

// вертикальный масштаб
const SCALE = 6;

// уровень "нуля"
const OFFSET = 128;

// =====================

async function update() {
  try {
    const response = await fetch("/frame");

    if (!response.ok) {
      requestAnimationFrame(update);
      return;
    }

    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // очистка

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // сетка

    ctx.strokeStyle = "#222";
    ctx.lineWidth = 1;

    // вертикальные линии

    for (let x = 0; x <= WIDTH; x += 100) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, HEIGHT);
      ctx.stroke();
    }

    // горизонтальные линии

    for (let y = 0; y <= HEIGHT; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(WIDTH, y);
      ctx.stroke();
    }

    // центральная линия

    const center = HEIGHT / 2;

    ctx.strokeStyle = "#555";

    ctx.beginPath();
    ctx.moveTo(0, center);
    ctx.lineTo(WIDTH, center);
    ctx.stroke();

    // сигнал

    ctx.strokeStyle = "#00ff00";
    ctx.lineWidth = 2;
    ctx.beginPath();

    const center = HEIGHT / 2;

    for (let i = 0; i < bytes.length; i += 2) {
      const x = ((i / 2) * WIDTH) / 8192;

      const value = bytes[i];

      const y = center - (value - OFFSET) * SCALE;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.stroke();
  } catch (err) {
    console.error(err);
  }

  requestAnimationFrame(update);
}

update();
