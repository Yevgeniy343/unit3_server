// wsServer.js
import { WebSocketServer } from "ws";
import {
  getAin0,
  getAin2,
  getAin4,
  getAin8,
} from "./controllers/modbusControls.js";

const WS_PORT = 8080;

export function startWSServer() {
  const wss = new WebSocketServer({ port: WS_PORT });
  const clients = new Set();

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
    console.log("setInterval");

    try {
      const ain0 = await getAin0();
      const ain2 = await getAin2();
      const ain4 = await getAin4();
      const ain8 = await getAin8();

      const payload = JSON.stringify({
        sampleTemp: ain0,
        airTemp: ain4,
        airHum: ain2,
        rFilm: ain8,
        // sampleTemp: 59.5,
        // airTemp: 26.3,
        // airHum: 56.2,
        // rFilm: 50.3,
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
