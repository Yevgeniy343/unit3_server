// wsServer.js
import { WebSocketServer } from "ws";
import {
  getAin0,
  getAin2,
  getAin4,
  getAin6,
  getAin8,
} from "./controllers/modbusControls.js";

import { getLastFrame } from "./captureManager.js"; //!

const WS_PORT = 8080;

export function startWSServer() {
  const wss = new WebSocketServer({ port: WS_PORT });
  const clients = new Set();

  // Последние 10 значений rFilm
  const rFilmHistory = [];
  const strokeLengthHistory = [];

  console.log(`📡 WS server started on ws://localhost:${WS_PORT}`);

  wss.on("connection", (ws) => {
    console.log("🟢 WS client connected");
    clients.add(ws);

    ws.on("close", () => {
      console.log("🔴 WS client disconnected");
      clients.delete(ws);
    });
  });

  setInterval(async () => {
    if (clients.size === 0) return;

    try {
      //!
      const currentRFilm = await getAin8();
      rFilmHistory.push(currentRFilm);

      if (rFilmHistory.length > 10) {
        rFilmHistory.shift();
      }

      const averageRFilm =
        rFilmHistory.reduce((sum, value) => sum + value, 0) /
        rFilmHistory.length;

      const currentStrokeLength = await getAin6();
      strokeLengthHistory.push(currentStrokeLength);

      if (strokeLengthHistory.length > 20) {
        strokeLengthHistory.shift();
      }

      const averageStrokeLength =
        strokeLengthHistory.reduce((sum, value) => sum + value, 0) /
        strokeLengthHistory.length;

      const ain0 = await getAin0();
      const ain2 = await getAin2();
      const ain4 = await getAin4();
      const ain6 = await getAin6();
      const ain8 = await getAin8();
      //!

      // получаем кадр из captureManager
      const frame = getLastFrame();

      let oscilloscope = null;

      if (frame) {
        let ch1Min = 255;
        let ch1Max = 0;
        let ch2Min = 255;
        let ch2Max = 0;

        for (let i = 0; i < frame.length; i += 2) {
          const ch1 = frame[i];
          const ch2 = frame[i + 1];

          if (ch1 < ch1Min) ch1Min = ch1;
          if (ch1 > ch1Max) ch1Max = ch1;

          if (ch2 < ch2Min) ch2Min = ch2;
          if (ch2 > ch2Max) ch2Max = ch2;
        }

        oscilloscope = {
          channel1: {
            min: ch1Min,
            max: ch1Max,
          },
          channel2: {
            min: ch2Min,
            max: ch2Max,
          },
        };
      }
      //!

      const payload = JSON.stringify({
        sampleTemp: ain0,
        airHum: ain2,
        airTemp: ain4,
        // strokeLength: Number(averageStrokeLength.toFixed(2)),
        rFilm: Number(averageRFilm.toFixed(2)),

        sampleTemp: 60,
        airTemp: 26.3,
        airHum: 56.2,
        strokeLength: 410000,
        rFilm: 50.3,
        oscilloscope,

        // strokeLength: ain6,
        rFilm: ain8,
      });

      console.log("payload:", payload);

      for (const ws of clients) {
        if (ws.readyState === ws.OPEN) {
          ws.send(payload);
        }
      }
    } catch (err) {
      console.error("WS read error:", err.message);
    }
  }, 1000);
}
