import express from "express";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createMockFrame } from "./mockCapture.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// -----------------------------------------------------
// Режим источника данных
// true  — моковые данные
// false — реальный Hantek через C++
// -----------------------------------------------------

const USE_MOCK = true;

// -----------------------------------------------------

const PORT = 3000;

const captureBinary = "/home/ssdt/Desktop/unit3/capture/build/capture";

const HEADER_SIZE = 4;
const EXPECTED_FRAME_SIZE = 16384;

let lastFrame = null;
let frameNumber = 0;

let captureProcess = null;
let mockTimer = null;

// -----------------------------------------------------
// Моковый источник
// -----------------------------------------------------

const startMockCapture = () => {
  console.log("Capture source: MOCK");

  mockTimer = setInterval(() => {
    frameNumber++;

    lastFrame = createMockFrame(frameNumber);

    if (frameNumber % 30 === 0) {
      console.log(`Mock frame: ${frameNumber}, bytes: ${lastFrame.length}`);
    }
  }, 20);
};

// -----------------------------------------------------
// Реальный источник C++
// -----------------------------------------------------

const startRealCapture = () => {
  console.log("Capture source: HANTEK");

  captureProcess = spawn(captureBinary, [], {
    stdio: ["ignore", "pipe", "pipe"],
  });

  let buffer = Buffer.alloc(0);

  captureProcess.stderr.on("data", (data) => {
    process.stderr.write(`[C++] ${data.toString()}`);
  });

  captureProcess.on("error", (error) => {
    console.error("Не удалось запустить capture:", error);
  });

  captureProcess.on("close", (code, signal) => {
    console.log(`Capture завершился. code=${code}, signal=${signal}`);
  });

  captureProcess.stdout.on("data", (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);

    while (true) {
      if (buffer.length < HEADER_SIZE) {
        return;
      }

      const frameLength = buffer.readUInt32LE(0);

      if (frameLength <= 0 || frameLength > EXPECTED_FRAME_SIZE) {
        console.error("Получен неправильный размер кадра:", frameLength);

        captureProcess.kill();
        return;
      }

      const packetLength = HEADER_SIZE + frameLength;

      if (buffer.length < packetLength) {
        return;
      }

      const frame = buffer.subarray(HEADER_SIZE, packetLength);

      buffer = buffer.subarray(packetLength);

      frameNumber++;
      lastFrame = Buffer.from(frame);

      if (frameNumber % 30 === 0) {
        console.log(`Real frame: ${frameNumber}, bytes: ${lastFrame.length}`);
      }
    }
  });
};

// -----------------------------------------------------
// Запуск выбранного источника
// -----------------------------------------------------

if (USE_MOCK) {
  startMockCapture();
} else {
  startRealCapture();
}

// -----------------------------------------------------
// HTTP
// -----------------------------------------------------

app.use(express.static(path.join(__dirname, "public")));

app.get("/frame", (req, res) => {
  if (!lastFrame) {
    return res.status(503).json({ error: "Frame is not ready" });
  }

  res.setHeader("Content-Type", "application/octet-stream");

  res.setHeader("Cache-Control", "no-store");

  return res.send(lastFrame);
});

app.get("/status", (req, res) => {
  res.json({
    source: USE_MOCK ? "mock" : "hantek",
    frameNumber,
    frameReady: Boolean(lastFrame),
    frameSize: lastFrame?.length ?? 0,
  });
});

const server = app.listen(PORT, () => {
  console.log();
  console.log(`Server started: http://localhost:${PORT}`);
  console.log(`Mode: ${USE_MOCK ? "MOCK" : "HANTEK"}`);
  console.log();
});

// -----------------------------------------------------
// Корректное завершение
// -----------------------------------------------------

const shutdown = () => {
  console.log("\nStopping...");

  if (mockTimer) {
    clearInterval(mockTimer);
  }

  if (captureProcess) {
    captureProcess.kill("SIGTERM");
  }

  server.close(() => {
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
