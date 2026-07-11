import { spawn } from "node:child_process";

const captureBinary = "/home/ssdt/Desktop/unit3/capture/build/capture";

const child = spawn(captureBinary, [], {
  stdio: ["ignore", "pipe", "pipe"],
});

const chunks = [];

child.stdout.on("data", (chunk) => {
  chunks.push(chunk);
});

child.stderr.on("data", (chunk) => {
  process.stderr.write(`[C++] ${chunk.toString()}`);
});

child.on("error", (error) => {
  console.error("Не удалось запустить C++:", error);
});

child.on("close", (code) => {
  if (code !== 0) {
    console.error(`C++ завершился с кодом ${code}`);
    return;
  }

  const rawData = Buffer.concat(chunks);

  console.log("Получено байт:", rawData.length);

  if (rawData.length !== 16384) {
    console.error(`Неверный размер: ${rawData.length}, ожидалось 16384`);
    return;
  }

  const ch1 = [];
  const ch2 = [];

  for (let index = 0; index + 1 < rawData.length; index += 2) {
    ch1.push(rawData[index]);
    ch2.push(rawData[index + 1]);
  }

  console.log("CH1 points:", ch1.length);
  console.log("CH2 points:", ch2.length);

  console.log("CH1 first 20:", ch1.slice(0, 20));
  console.log("CH2 first 20:", ch2.slice(0, 20));

  console.log("CH1 min:", Math.min(...ch1), "max:", Math.max(...ch1));
});
