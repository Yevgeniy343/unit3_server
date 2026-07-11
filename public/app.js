const canvas = document.getElementById("scope");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const SCALE = 4;
const OFFSET = 128;

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
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // центральная линия
    const center = HEIGHT / 2;

    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(0, center);
    ctx.lineTo(WIDTH, center);
    ctx.stroke();

    // сигнал
    ctx.strokeStyle = "#00ff00";
    ctx.lineWidth = 1;
    ctx.beginPath();

    const points = bytes.length / 2;

    for (let p = 0; p < points; p++) {
      const value = bytes[p * 2];

      const x = (p * WIDTH) / (points - 1);

      const y = center - (value - OFFSET) * SCALE;

      if (p === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();
  } catch (err) {
    console.error(err);
  }

  requestAnimationFrame(update);
}

update();
