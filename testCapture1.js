import { spawn } from "node:child_process";

const captureBinary = "/home/ssdt/Desktop/unit3/capture/build/capture";

const FRAME_SIZE = 16384;
const HEADER_SIZE = 4;

const proc = spawn("sudo", [captureBinary]);

let buffer = Buffer.alloc(0);
let frameNumber = 0;

proc.stderr.on("data", (data) => {
  process.stderr.write(data.toString());
});

proc.on("error", (err) => {
  console.error(err);
});

proc.stdout.on("data", (chunk) => {
  // Добавляем новые данные
  buffer = Buffer.concat([buffer, chunk]);

  while (true) {
    // Ждем заголовок
    if (buffer.length < HEADER_SIZE) {
      return;
    }

    // Размер кадра
    const frameLength = buffer.readUInt32LE(0);

    // Ждем весь кадр
    if (buffer.length < HEADER_SIZE + frameLength) {
      return;
    }

    // Получаем кадр
    const frame = buffer.subarray(HEADER_SIZE, HEADER_SIZE + frameLength);

    // Убираем обработанный кадр
    buffer = buffer.subarray(HEADER_SIZE + frameLength);

    frameNumber++;

    const ch1 = [];
    const ch2 = [];

    for (let i = 0; i < frame.length; i += 2) {
      ch1.push(frame[i]);
      ch2.push(frame[i + 1]);
    }

    console.clear();

    console.log("Frame:", frameNumber);

    console.log("CH1:", ch1.length, "points");

    console.log("CH2:", ch2.length, "points");

    console.log("CH1 first 20:", ch1.slice(0, 20));

    console.log("CH2 first 20:", ch2.slice(0, 20));

    const min = Math.min(...ch1);
    const max = Math.max(...ch1);

    console.log("CH1 min:", min, "max:", max);
  }
});
