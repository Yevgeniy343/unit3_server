// captureManager.js

import { spawn } from "node:child_process";

import { createMockFrame } from "./mockCapture.js";
import { CAPTURE_SOURCE } from "./captureConfig.js";

const CAPTURE_BINARY = "/home/ssdt/Desktop/unit3/capture/build/capture";

const HEADER_SIZE = 4;
const EXPECTED_FRAME_SIZE = 16384;

let lastFrame = null;
let frameNumber = 0;

let captureProcess = null;
let mockTimer = null;

/* -------------------------------------------------- */
/* Public API */
/* -------------------------------------------------- */

export function getLastFrame() {
  return lastFrame;
}

export function getFrameNumber() {
  return frameNumber;
}

/* -------------------------------------------------- */
/* Mock source */
/* -------------------------------------------------- */

function startMockCapture() {
  console.log("Capture source: MOCK");

  //   mockTimer = setInterval(() => {
  //     frameNumber++;
  //     lastFrame = createMockFrame(frameNumber);
  //   }, 20);

  mockTimer = setInterval(() => {
    try {
      frameNumber++;
      lastFrame = createMockFrame(frameNumber);

      console.log(frameNumber, lastFrame.length);
    } catch (err) {
      console.error(err);
    }
  }, 1000);
}

/* -------------------------------------------------- */
/* Hantek source */
/* -------------------------------------------------- */

function startRealCapture() {
  console.log("Capture source: HANTEK");

  captureProcess = spawn(CAPTURE_BINARY, [], {
    stdio: ["ignore", "pipe", "pipe"],
  });

  let buffer = Buffer.alloc(0);

  captureProcess.stderr.on("data", (data) => {
    process.stderr.write(data);
  });

  captureProcess.on("error", (err) => {
    console.error("Capture start error:", err.message);
  });

  captureProcess.on("close", (code, signal) => {
    console.log(`Capture stopped. code=${code}, signal=${signal}`);
  });

  captureProcess.stdout.on("data", (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);

    while (true) {
      if (buffer.length < HEADER_SIZE) {
        return;
      }

      const frameLength = buffer.readUInt32LE(0);

      if (frameLength <= 0 || frameLength > EXPECTED_FRAME_SIZE) {
        console.error("Invalid frame size:", frameLength);

        captureProcess.kill();

        return;
      }

      const packetLength = HEADER_SIZE + frameLength;

      if (buffer.length < packetLength) {
        return;
      }

      lastFrame = Buffer.from(buffer.subarray(HEADER_SIZE, packetLength));

      frameNumber++;

      buffer = buffer.subarray(packetLength);
    }
  });
}

/* -------------------------------------------------- */
/* Shutdown */
/* -------------------------------------------------- */

// function shutdown() {
//   if (mockTimer) {
//     clearInterval(mockTimer);
//   }

//   if (captureProcess) {
//     captureProcess.kill("SIGTERM");
//   }
// }

function shutdown() {
  console.log("Shutting down...");

  if (mockTimer) {
    clearInterval(mockTimer);
  }

  if (captureProcess) {
    captureProcess.kill("SIGTERM");
  }

  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

/* -------------------------------------------------- */
/* Start */
/* -------------------------------------------------- */

switch (CAPTURE_SOURCE) {
  case "mock":
    startMockCapture();
    break;

  case "hantek":
    startRealCapture();
    break;

  default:
    throw new Error(`Unknown capture source: ${CAPTURE_SOURCE}`);
}
