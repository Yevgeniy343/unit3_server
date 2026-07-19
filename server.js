import express from "express";

import captureRoutes from "./routes/capture.js";
import modbusRoutes from "./routes/modbus.js";

import { startWSServer } from "./wsServer.js";

import { getLastFrame } from "./captureManager.js";

const app = express();

app.use(express.json());

app.use(captureRoutes);
app.use(modbusRoutes);

startWSServer();

let prevFrame = null;

setInterval(() => {
  const frame = getLastFrame();

  if (!frame) {
    console.log("Нет кадра");
    return;
  }

  const channel1 = [];
  const channel2 = [];

  for (let i = 0; i < frame.length; i += 2) {
    channel1.push(frame[i]);
    channel2.push(frame[i + 1]);
  }

  console.log("==================================");
  console.log("Размер кадра:", frame.length);

  console.log("CH1:", channel1.slice(0, 16));
  console.log("CH2:", channel2.slice(0, 16));

  console.log("CH1 диапазон:", getMinMax(channel1));
  console.log("CH2 диапазон:", getMinMax(channel2));

  console.log(
    "Кадр изменился:",
    prevFrame ? !prevFrame.equals(frame) : "первый кадр",
  );

  prevFrame = Buffer.from(frame);
}, 1000);

function getMinMax(values) {
  let min = 255;
  let max = 0;

  for (const v of values) {
    if (v < min) min = v;
    if (v > max) max = v;
  }

  return { min, max };
}

app.listen(3000, () => {
  console.log("HTTP API: http://localhost:3000");
});
