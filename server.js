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

setInterval(() => {
  const frame = getLastFrame();

  if (frame) {
    // console.log(frame.length);
    const frame = getLastFrame();

    if (frame) {
      console.log("length:", frame.length);
      console.log("first 16 bytes:", [...frame.slice(0, 16)]);
    }

    let prev = null;

    setInterval(() => {
      const frame = getLastFrame();
      if (!frame) return;

      const same = prev && Buffer.compare(prev, frame) === 0;

      console.log("same:", same);

      prev = Buffer.from(frame);
    }, 1000);
  }
}, 1000);

app.listen(3000, () => {
  console.log("HTTP API: http://localhost:3000");
});
