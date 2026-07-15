import express from "express";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const captureBinary = "/home/ssdt/Desktop/unit3/capture/build/capture";
// const captureBinary = "/home/ujin/Desktop/apps/unit3/capture/build/capture";

const HEADER_SIZE = 4;

let buffer = Buffer.alloc(0);
let frameNumber = 0;

// здесь всегда хранится последний кадр
let lastFrame = null;

const proc = spawn("sudo", [captureBinary]);

proc.stderr.on("data", (data) => {
  process.stderr.write(data.toString());
});

proc.on("error", (err) => {
  console.error(err);
});

proc.stdout.on("data", (chunk) => {
  buffer = Buffer.concat([buffer, chunk]);

  while (true) {
    if (buffer.length < HEADER_SIZE) {
      return;
    }

    const frameLength = buffer.readUInt32LE(0);

    if (buffer.length < HEADER_SIZE + frameLength) {
      return;
    }

    const frame = buffer.subarray(HEADER_SIZE, HEADER_SIZE + frameLength);

    buffer = buffer.subarray(HEADER_SIZE + frameLength);

    frameNumber++;

    lastFrame = Buffer.from(frame);

    if (frameNumber % 30 === 0) {
      console.log("Frame:", frameNumber);
    }
  }
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/frame", (req, res) => {
  if (!lastFrame) {
    return res.status(404).end();
  }

  res.setHeader("Content-Type", "application/octet-stream");

  res.send(lastFrame);
});

app.listen(3000, () => {
  console.log();
  console.log("Server started");
  console.log("http://localhost:3000");
  console.log();
});
