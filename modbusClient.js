// modbusClient.js
// process.env.DEBUG = "modbus-serial";
import ModbusRTU from "modbus-serial";
import fs from "fs";

// const PORT = "/dev/ttyACM0";
const PORT = "/dev/ttyUSB0";
// const PORT = "COM2";

const BAUD = 115200;
// const BAUD = 9600;

const client = new ModbusRTU();

client.setID(1);
client.setTimeout(2000);

let isConnecting = false;

async function connect() {
  console.log("🚀 modbusClient loaded");
  // чтобы не лезть в порт параллельно
  if (client.isOpen || isConnecting) return;
  isConnecting = true;

  // порта ещё нет (например, контроллер не подключен)
  if (!fs.existsSync(PORT)) {
    console.log(`⚠️ ${PORT} не существует. Ждём подключения контроллера...`);
    isConnecting = false;
    setTimeout(connect, 2000);
    return;
  }

  try {
    console.log(`🔌 Подключаемся к ${PORT}...`);
    // await client.connectRTUBuffered(PORT, { baudRate: BAUD }); //!
    await client.connectRTUBuffered(PORT, {
      baudRate: BAUD,
      dataBits: 8,
      stopBits: 1,
      parity: "none",
    });
    console.log("✅ Подключено к контроллеру");

    // degug
    // client._port.on("data", (chunk) => {
    //   console.log("📥 RAW:", chunk.toString("hex"));
    // });

    // вешаем обработчики один раз после успешного коннекта
    if (client._port && !client._port._hasReconnectHandlers) {
      client._port._hasReconnectHandlers = true;

      client._port.on("close", () => {
        console.log("⛓ Порт закрыт. Попробуем переподключиться...");
        isConnecting = false;
        // делаем паузу, чтобы ядро успело «отпустить» устройство
        setTimeout(connect, 2000);
      });

      client._port.on("error", (e) => {
        console.log("❌ Ошибка порта:", e.message);
        // ошибку логируем, но процесс не валим
      });
    }
  } catch (e) {
    console.log("❌ Ошибка подключения:", e.message);
  } finally {
    // если не удалось подключиться — разрешаем следующую попытку
    isConnecting = false;
    if (!client.isOpen) {
      setTimeout(connect, 2000);
    }
  }
}

// запускаем цикл подключения
connect();

export default client;
