// wsServer.js
import { WebSocketServer } from "ws";
import { getAin0, getAin2, getAin4 } from "./controllers/modbusControls.js";

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
    console.log("vef");

    try {
      const ain0 = await getAin0();
      // const ain2 = await getAin2();
      // const ain4 = await getAin4();

      const payload = JSON.stringify({
        sampleTemp: ain0,
        // airTemp: ain4,
        // airHum: ain2,
        // sampleTemp: 25.5,
        // airTemp: 22.3,
        // airHum: 55.2,
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
