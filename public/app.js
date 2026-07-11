const canvas = document.getElementById("scope");

const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;

const HEIGHT = canvas.height;

async function update() {
  try {
    const response = await fetch("/frame");

    if (!response.ok) {
      requestAnimationFrame(update);
      return;
    }

    const buffer = await response.arrayBuffer();

    const bytes = new Uint8Array(buffer);

    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    ctx.beginPath();

    const SCALE = 4;

    for (let i = 0; i < bytes.length; i += 2) {
      const x = ((i / 2) * WIDTH) / 8192;

      //   const y = HEIGHT - (bytes[i] / 255) * HEIGHT;
      const center = HEIGHT / 2;

      const y = center - (bytes[i] - 128) * SCALE;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.strokeStyle = "#00ff00";

    ctx.lineWidth = 1;

    ctx.stroke();
  } catch (e) {
    console.log(e);
  }

  requestAnimationFrame(update);
}

update();
